import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QuestType } from '@prisma/client';

@Injectable()
export class QuestsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get daily quests for a user
   * Auto-assigns quests if not yet assigned for today
   */
  async getDailyQuests(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get user's quests for today
    let userQuests = await this.prisma.userQuest.findMany({
      where: {
        userId,
        assignedDate: today,
      },
      include: {
        quest: true,
      },
      orderBy: {
        quest: {
          difficulty: 'asc',
        },
      },
    });

    // If no quests assigned for today, assign them
    if (userQuests.length === 0) {
      userQuests = await this.assignDailyQuests(userId, today, tomorrow);
    }

    return userQuests;
  }

  /**
   * Assign daily quests to a user
   */
  private async assignDailyQuests(userId: string, assignedDate: Date, expiresAt: Date) {
    // Get all active daily quests
    const activeQuests = await this.prisma.quest.findMany({
      where: {
        isActive: true,
        isDaily: true,
      },
      orderBy: {
        difficulty: 'asc',
      },
    });

    // Create user quests for each active quest
    const userQuestsData = activeQuests.map((quest) => ({
      userId,
      questId: quest.id,
      assignedDate,
      expiresAt,
      progress: 0,
      isCompleted: false,
    }));

    await this.prisma.userQuest.createMany({
      data: userQuestsData,
      skipDuplicates: true, // Skip if already exists (race condition protection)
    });

    // Fetch and return the created user quests
    return this.prisma.userQuest.findMany({
      where: {
        userId,
        assignedDate,
      },
      include: {
        quest: true,
      },
      orderBy: {
        quest: {
          difficulty: 'asc',
        },
      },
    });
  }

  /**
   * Update quest progress
   */
  async updateProgress(userId: string, questId: string, progress: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userQuest = await this.prisma.userQuest.findFirst({
      where: {
        userId,
        questId,
        assignedDate: today,
      },
      include: {
        quest: true,
      },
    });

    if (!userQuest) {
      throw new NotFoundException('Quest not found for today');
    }

    if (userQuest.isCompleted) {
      throw new ConflictException('Quest already completed');
    }

    // Update progress
    const updatedQuest = await this.prisma.userQuest.update({
      where: { id: userQuest.id },
      data: { progress },
      include: { quest: true },
    });

    // Auto-complete if progress meets target
    if (progress >= userQuest.quest.targetCount && !userQuest.isCompleted) {
      return this.completeQuest(userId, questId);
    }

    return updatedQuest;
  }

  /**
   * Complete a quest and award rewards
   */
  async completeQuest(userId: string, questId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userQuest = await this.prisma.userQuest.findFirst({
      where: {
        userId,
        questId,
        assignedDate: today,
      },
      include: {
        quest: true,
      },
    });

    if (!userQuest) {
      throw new NotFoundException('Quest not found for today');
    }

    if (userQuest.isCompleted) {
      throw new ConflictException('Quest already completed');
    }

    // Get user stats
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Calculate rewards
    const xpEarned = userQuest.quest.xpReward;
    const goldEarned = userQuest.quest.goldReward;
    const gemsEarned = userQuest.quest.gemsReward;

    const newXp = user.xp + xpEarned;
    const newLevel = Math.floor(newXp / 100) + 1;

    // Update user stats
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel,
        gold: user.gold + goldEarned,
        gems: user.gems + gemsEarned,
        lastActive: new Date(),
      },
    });

    // Mark quest as completed
    const completedQuest = await this.prisma.userQuest.update({
      where: { id: userQuest.id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        progress: userQuest.quest.targetCount, // Ensure progress is at target
      },
      include: { quest: true },
    });

    return {
      userQuest: completedQuest,
      rewards: {
        xp: xpEarned,
        gold: goldEarned,
        gems: gemsEarned,
        levelUp: newLevel > user.level,
        newLevel,
      },
    };
  }

  /**
   * Increment quest progress by 1
   * Used for automatic progress tracking from habits
   */
  async incrementProgress(userId: string, questKey: string, amount: number = 1) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const quest = await this.prisma.quest.findUnique({
      where: { key: questKey },
    });

    if (!quest) {
      // Quest doesn't exist, silently return
      return null;
    }

    const userQuest = await this.prisma.userQuest.findFirst({
      where: {
        userId,
        questId: quest.id,
        assignedDate: today,
        isCompleted: false,
      },
    });

    if (!userQuest) {
      // No active quest for today, silently return
      return null;
    }

    const newProgress = Math.min(userQuest.progress + amount, quest.targetCount);

    return this.updateProgress(userId, quest.id, newProgress);
  }

  /**
   * Cron job: Reset daily quests at midnight
   * Runs every day at 00:00
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetDailyQuests() {
    console.log('🌅 Running daily quest reset...');

    // Optional: Clean up old expired quests
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    await this.prisma.userQuest.deleteMany({
      where: {
        assignedDate: {
          lt: yesterday,
        },
      },
    });

    console.log('✅ Daily quest reset complete');
  }

  /**
   * Seed initial quests (for development/deployment)
   */
  async seedQuests() {
    const quests = [
      // Easy quests
      {
        key: 'complete_1_habit',
        title: 'First Step',
        description: 'Complete any 1 habit today',
        icon: '🎯',
        type: QuestType.HABIT_COMPLETION,
        category: 'daily',
        targetCount: 1,
        xpReward: 15,
        goldReward: 8,
        gemsReward: 0,
        difficulty: 1,
        isActive: true,
        isDaily: true,
      },
      {
        key: 'maintain_streak',
        title: 'Consistency Counts',
        description: 'Maintain at least one active habit streak',
        icon: '🔥',
        type: QuestType.STREAK_BUILD,
        category: 'daily',
        targetCount: 1,
        xpReward: 20,
        goldReward: 10,
        gemsReward: 0,
        difficulty: 1,
        isActive: true,
        isDaily: true,
      },
      // Medium quests
      {
        key: 'complete_3_habits',
        title: 'Triple Threat',
        description: 'Complete 3 different habits today',
        icon: '⚡',
        type: QuestType.HABIT_COMPLETION,
        category: 'daily',
        targetCount: 3,
        xpReward: 30,
        goldReward: 15,
        gemsReward: 1,
        difficulty: 2,
        isActive: true,
        isDaily: true,
      },
      // Hard quests
      {
        key: 'complete_5_habits',
        title: 'Overachiever',
        description: 'Complete 5 different habits today',
        icon: '💪',
        type: QuestType.HABIT_COMPLETION,
        category: 'daily',
        targetCount: 5,
        xpReward: 50,
        goldReward: 25,
        gemsReward: 3,
        difficulty: 3,
        isActive: true,
        isDaily: true,
      },
    ];

    for (const questData of quests) {
      await this.prisma.quest.upsert({
        where: { key: questData.key },
        update: questData,
        create: questData,
      });
    }

    console.log(`✅ Seeded ${quests.length} quests`);
    return quests;
  }

  /**
   * Get all available quests (admin)
   */
  async getAllQuests() {
    return this.prisma.quest.findMany({
      orderBy: [
        { difficulty: 'asc' },
        { xpReward: 'asc' },
      ],
    });
  }
}
