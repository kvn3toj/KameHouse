import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateAchievementDto, AchievementResponseDto } from './dto/achievement.dto';

@Injectable()
export class AchievementsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all achievements for a user with unlock status and progress
   */
  async getUserAchievements(userId: string): Promise<AchievementResponseDto[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        achievements: {
          include: {
            achievement: true,
          },
        },
        habits: {
          where: { isActive: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get all achievements
    const allAchievements = await this.prisma.achievement.findMany({
      orderBy: [{ category: 'asc' }, { requirement: 'asc' }],
    });

    // Calculate user's current stats
    const stats = await this.calculateUserStats(userId);

    // Map achievements with unlock status
    const achievementsWithStatus = allAchievements.map((achievement) => {
      const userAchievement = user.achievements.find(
        (ua) => ua.achievementId === achievement.id,
      );

      const progress = this.calculateProgress(achievement, stats);
      const unlocked = !!userAchievement;

      return {
        id: achievement.id,
        key: achievement.key,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        requirement: achievement.requirement,
        xpReward: achievement.xpReward,
        goldReward: achievement.goldReward,
        gemsReward: achievement.gemsReward,
        unlocked,
        unlockedAt: userAchievement?.unlockedAt,
        progress,
      };
    });

    return achievementsWithStatus;
  }

  /**
   * Check and unlock achievements for a user
   */
  async checkAndUnlockAchievements(userId: string): Promise<AchievementResponseDto[]> {
    const stats = await this.calculateUserStats(userId);
    const allAchievements = await this.prisma.achievement.findMany();
    const unlockedAchievements: AchievementResponseDto[] = [];

    for (const achievement of allAchievements) {
      // Check if already unlocked
      const existing = await this.prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
      });

      if (existing) continue;

      // Check if criteria met
      const progress = this.calculateProgress(achievement, stats);
      if (progress >= achievement.requirement) {
        // Unlock achievement
        const userAchievement = await this.prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            progress: achievement.requirement,
          },
        });

        // Grant rewards
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            xp: { increment: achievement.xpReward },
            gold: { increment: achievement.goldReward },
            gems: { increment: achievement.gemsReward },
          },
        });

        unlockedAchievements.push({
          id: achievement.id,
          key: achievement.key,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          category: achievement.category,
          requirement: achievement.requirement,
          xpReward: achievement.xpReward,
          goldReward: achievement.goldReward,
          gemsReward: achievement.gemsReward,
          unlocked: true,
          unlockedAt: userAchievement.unlockedAt,
          progress: achievement.requirement,
        });
      }
    }

    return unlockedAchievements;
  }

  /**
   * Calculate user stats for achievement tracking
   */
  private async calculateUserStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        habits: true,
        completions: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const maxStreak = Math.max(
      ...user.habits.map((h) => h.currentStreak),
      0,
    );

    const totalCompletions = user.habits.reduce(
      (sum, h) => sum + h.totalCompletions,
      0,
    );

    return {
      level: user.level,
      totalHabits: user.habits.length,
      activeHabits: user.habits.filter((h) => h.isActive).length,
      totalCompletions,
      maxStreak,
      gold: user.gold,
      gems: user.gems,
    };
  }

  /**
   * Calculate progress toward an achievement
   */
  private calculateProgress(achievement: any, stats: any): number {
    switch (achievement.category) {
      case 'level':
        return stats.level;
      case 'habits':
        return stats.totalHabits;
      case 'completions':
        return stats.totalCompletions;
      case 'streak':
        return stats.maxStreak;
      case 'gold':
        return stats.gold;
      case 'gems':
        return stats.gems;
      default:
        return 0;
    }
  }

  /**
   * Seed initial achievements (admin only)
   */
  async seedAchievements(): Promise<void> {
    const achievements: CreateAchievementDto[] = [
      // Level Achievements
      {
        key: 'level_5',
        name: 'Rising Star',
        description: 'Reach level 5',
        icon: '⭐',
        category: 'level',
        requirement: 5,
        xpReward: 50,
        goldReward: 25,
        gemsReward: 1,
      },
      {
        key: 'level_10',
        name: 'Dedicated Learner',
        description: 'Reach level 10',
        icon: '🌟',
        category: 'level',
        requirement: 10,
        xpReward: 100,
        goldReward: 50,
        gemsReward: 2,
      },
      {
        key: 'level_25',
        name: 'Master of Habits',
        description: 'Reach level 25',
        icon: '💫',
        category: 'level',
        requirement: 25,
        xpReward: 250,
        goldReward: 125,
        gemsReward: 5,
      },

      // Habit Creation Achievements
      {
        key: 'first_habit',
        name: 'First Step',
        description: 'Create your first habit',
        icon: '🌱',
        category: 'habits',
        requirement: 1,
        xpReward: 10,
        goldReward: 5,
      },
      {
        key: 'habit_collector',
        name: 'Habit Collector',
        description: 'Create 5 habits',
        icon: '📚',
        category: 'habits',
        requirement: 5,
        xpReward: 25,
        goldReward: 15,
      },
      {
        key: 'habit_master',
        name: 'Habit Architect',
        description: 'Create 10 habits',
        icon: '🏗️',
        category: 'habits',
        requirement: 10,
        xpReward: 50,
        goldReward: 30,
        gemsReward: 1,
      },

      // Completion Achievements
      {
        key: 'first_complete',
        name: 'Getting Started',
        description: 'Complete your first habit',
        icon: '✅',
        category: 'completions',
        requirement: 1,
        xpReward: 10,
        goldReward: 5,
      },
      {
        key: 'completions_10',
        name: 'Momentum Builder',
        description: 'Complete 10 habits',
        icon: '🔥',
        category: 'completions',
        requirement: 10,
        xpReward: 30,
        goldReward: 15,
      },
      {
        key: 'completions_50',
        name: 'Consistency King',
        description: 'Complete 50 habits',
        icon: '👑',
        category: 'completions',
        requirement: 50,
        xpReward: 100,
        goldReward: 50,
        gemsReward: 2,
      },
      {
        key: 'completions_100',
        name: 'Century Club',
        description: 'Complete 100 habits',
        icon: '💯',
        category: 'completions',
        requirement: 100,
        xpReward: 200,
        goldReward: 100,
        gemsReward: 3,
      },

      // Streak Achievements
      {
        key: 'streak_3',
        name: 'Three Days Strong',
        description: 'Maintain a 3-day streak',
        icon: '🔥',
        category: 'streak',
        requirement: 3,
        xpReward: 15,
        goldReward: 10,
      },
      {
        key: 'streak_7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '⚡',
        category: 'streak',
        requirement: 7,
        xpReward: 35,
        goldReward: 20,
        gemsReward: 1,
      },
      {
        key: 'streak_30',
        name: 'Monthly Master',
        description: 'Maintain a 30-day streak',
        icon: '🌙',
        category: 'streak',
        requirement: 30,
        xpReward: 150,
        goldReward: 75,
        gemsReward: 3,
      },
      {
        key: 'streak_100',
        name: 'Unstoppable',
        description: 'Maintain a 100-day streak',
        icon: '🚀',
        category: 'streak',
        requirement: 100,
        xpReward: 500,
        goldReward: 250,
        gemsReward: 10,
      },

      // Wealth Achievements
      {
        key: 'gold_100',
        name: 'First Fortune',
        description: 'Accumulate 100 gold',
        icon: '💰',
        category: 'gold',
        requirement: 100,
        xpReward: 25,
        goldReward: 10,
      },
      {
        key: 'gold_500',
        name: 'Wealthy Warrior',
        description: 'Accumulate 500 gold',
        icon: '💎',
        category: 'gold',
        requirement: 500,
        xpReward: 75,
        goldReward: 50,
        gemsReward: 2,
      },
    ];

    // Use upsert to avoid duplicates
    for (const achievement of achievements) {
      await this.prisma.achievement.upsert({
        where: { key: achievement.key },
        update: achievement,
        create: achievement,
      });
    }
  }
}
