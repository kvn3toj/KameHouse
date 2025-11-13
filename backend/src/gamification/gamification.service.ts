import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface TaskCompletionReward {
  xp: number;
  gold: number;
  streakBonus: number;
  roomXp: number;
  roomLevelUp: boolean;
  roomNewLevel?: number;
  userLevelUp: boolean;
  userNewLevel?: number;
  achievements: string[];
}

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate rewards for completing a task
   */
  async calculateTaskRewards(
    userId: string,
    roomId: string,
    taskDifficulty: number = 1,
    estimatedMinutes: number = 15,
  ): Promise<TaskCompletionReward> {
    // Base rewards
    const baseXP = Math.max(10, taskDifficulty * 10);
    const baseGold = Math.max(5, Math.floor(estimatedMinutes / 3));

    // Get user's current streak
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true, level: true, xp: true },
    });

    const currentStreak = user?.streak || 0;
    const streakMultiplier = 1 + Math.min(currentStreak * 0.05, 0.5); // Max 50% bonus at 10 day streak
    const streakBonus = Math.floor(baseXP * (streakMultiplier - 1));

    const totalXP = baseXP + streakBonus;
    const totalGold = baseGold;

    // Update room XP and check for level up
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { xp: true, level: true },
    });

    const newRoomXP = (room?.xp || 0) + totalXP;
    const roomXPForNextLevel = this.calculateXPForLevel((room?.level || 1) + 1);
    const roomLevelUp = newRoomXP >= roomXPForNextLevel;
    const newRoomLevel = roomLevelUp ? (room?.level || 1) + 1 : room?.level || 1;

    await this.prisma.room.update({
      where: { id: roomId },
      data: {
        xp: newRoomXP,
        level: newRoomLevel,
      },
    });

    // Update user XP and check for level up
    const newUserXP = (user?.xp || 0) + totalXP;
    const userXPForNextLevel = this.calculateXPForLevel((user?.level || 1) + 1);
    const userLevelUp = newUserXP >= userXPForNextLevel;
    const newUserLevel = userLevelUp ? (user?.level || 1) + 1 : user?.level || 1;

    // Update user
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        xp: newUserXP,
        level: newUserLevel,
        gold: { increment: totalGold },
      },
    });

    // Check for achievements
    const achievements = await this.checkAchievements(userId, {
      roomLevelUp,
      roomNewLevel: newRoomLevel,
      userLevelUp,
      userNewLevel: newUserLevel,
      taskCompleted: true,
    });

    return {
      xp: totalXP,
      gold: totalGold,
      streakBonus,
      roomXp: totalXP,
      roomLevelUp,
      roomNewLevel: roomLevelUp ? newRoomLevel : undefined,
      userLevelUp,
      userNewLevel: userLevelUp ? newUserLevel : undefined,
      achievements,
    };
  }

  /**
   * Calculate XP required for a specific level
   */
  private calculateXPForLevel(level: number): number {
    return level * 100; // Simple formula: Level 2 = 200 XP, Level 3 = 300 XP, etc.
  }

  /**
   * Update user's daily streak
   */
  async updateStreak(userId: string): Promise<{ streak: number; isNew: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true, lastActive: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = user.lastActive ? new Date(user.lastActive) : null;
    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
    }

    let newStreak = user.streak || 0;
    let isNew = false;

    // If last active was yesterday, increment streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastActive && lastActive.getTime() === yesterday.getTime()) {
      newStreak += 1;
      isNew = true;
    } else if (!lastActive || lastActive.getTime() < yesterday.getTime()) {
      // Streak broken, reset to 1
      newStreak = 1;
      isNew = true;
    }
    // If last active was today, keep current streak (already counted)

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        streak: newStreak,
        lastActive: new Date(),
      },
    });

    return { streak: newStreak, isNew };
  }

  /**
   * Check and unlock achievements
   */
  private async checkAchievements(
    userId: string,
    context: {
      roomLevelUp?: boolean;
      roomNewLevel?: number;
      userLevelUp?: boolean;
      userNewLevel?: number;
      taskCompleted?: boolean;
    },
  ): Promise<string[]> {
    const achievements: string[] = [];

    // First Task Achievement
    if (context.taskCompleted) {
      const userTaskCount = await this.prisma.choreTemplate.count({
        where: {
          household: {
            members: {
              some: { userId },
            },
          },
        },
      });

      if (userTaskCount === 1) {
        achievements.push('Primera Tarea Completada 🎉');
      }
    }

    // Room Level Milestones
    if (context.roomLevelUp && context.roomNewLevel) {
      if (context.roomNewLevel === 5) {
        achievements.push('Maestro del Espacio 🏆');
      } else if (context.roomNewLevel === 10) {
        achievements.push('Leyenda del Hogar 👑');
      }
    }

    // User Level Milestones
    if (context.userLevelUp && context.userNewLevel) {
      if (context.userNewLevel === 5) {
        achievements.push('Organizador Experto ⭐');
      } else if (context.userNewLevel === 10) {
        achievements.push('Guru del Orden 🌟');
      }
    }

    return achievements;
  }

  /**
   * Get room statistics
   */
  async getRoomStats(roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        choreTemplates: {
          include: {
            assignments: {
              where: {
                isCompleted: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      throw new Error('Room not found');
    }

    const totalTasks = room.choreTemplates.length;
    const completedTasks = room.choreTemplates.reduce(
      (sum, template) => sum + template.assignments.filter((a) => a.isCompleted).length,
      0,
    );

    const xpForNextLevel = this.calculateXPForLevel(room.level + 1);
    const progressToNextLevel = ((room.xp / xpForNextLevel) * 100).toFixed(1);

    return {
      name: room.name,
      type: room.type,
      icon: room.icon,
      level: room.level,
      xp: room.xp,
      xpForNextLevel,
      progressToNextLevel: parseFloat(progressToNextLevel),
      totalTasks,
      completedTasks,
      completionRate:
        totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0',
    };
  }
}
