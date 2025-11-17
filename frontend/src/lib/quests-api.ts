/**
 * Quests API - PocketBase Implementation
 * PHOENIX-12 Phase 2G: Migrated from legacy localhost:3000 to PocketBase
 *
 * Collections used:
 * - quests: Quest definitions (admin-managed)
 * - user_quests: User quest progress
 */

import { pb } from './pocketbase';
import type {
  Quest,
  UserQuest,
  ExpandedUserQuest,
  QuestCompletionResponse,
  QuestType,
} from '@/types/quest';

// ============================================
// DAILY QUESTS
// ============================================

/**
 * Get daily quests for current user
 * Returns active daily quests for today
 */
async function getDailyQuests(): Promise<ExpandedUserQuest[]> {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('User not authenticated');

  // Calculate today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  // Get user's daily quests that haven't expired
  const userQuests = await pb.collection('user_quests').getFullList<ExpandedUserQuest>({
    filter: `user = "${userId}" && assignedDate >= "${todayISO}" && expiresAt >= "${new Date().toISOString()}"`,
    expand: 'quest',
    sort: '-created',
  });

  // If no quests assigned for today, assign new daily quests
  if (userQuests.length === 0) {
    return await assignDailyQuests(userId);
  }

  return userQuests;
}

/**
 * Assign daily quests to user
 * This is called when user has no active daily quests
 */
async function assignDailyQuests(userId: string): Promise<ExpandedUserQuest[]> {
  // Get all active daily quests
  const dailyQuests = await pb.collection('quests').getFullList<Quest>({
    filter: 'isActive = true && isDaily = true',
    sort: 'difficulty',
  });

  // Randomly select 3 daily quests (or all if less than 3)
  const selectedQuests = dailyQuests.sort(() => 0.5 - Math.random()).slice(0, 3);

  // Calculate expiry (end of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Create user quest records
  const userQuests: ExpandedUserQuest[] = [];
  for (const quest of selectedQuests) {
    const userQuest = await pb.collection('user_quests').create<ExpandedUserQuest>({
      user: userId,
      quest: quest.id,
      progress: 0,
      isCompleted: false,
      assignedDate: today.toISOString(),
      expiresAt: tomorrow.toISOString(),
    }, {
      expand: 'quest',
    });
    userQuests.push(userQuest);
  }

  return userQuests;
}

// ============================================
// QUEST PROGRESS
// ============================================

/**
 * Update quest progress
 */
async function updateProgress(questId: string, progress: number): Promise<UserQuest> {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('User not authenticated');

  // Get the user quest record
  const userQuests = await pb.collection('user_quests').getFullList<UserQuest>({
    filter: `user = "${userId}" && quest = "${questId}" && isCompleted = false`,
  });

  if (userQuests.length === 0) {
    throw new Error('User quest not found or already completed');
  }

  const userQuest = userQuests[0];

  // Update progress
  return await pb.collection('user_quests').update<UserQuest>(userQuest.id, {
    progress,
  });
}

/**
 * Complete a quest
 */
async function completeQuest(questId: string): Promise<QuestCompletionResponse> {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('User not authenticated');

  // Get the user quest record with expanded quest
  const userQuests = await pb.collection('user_quests').getFullList<ExpandedUserQuest>({
    filter: `user = "${userId}" && quest = "${questId}" && isCompleted = false`,
    expand: 'quest',
  });

  if (userQuests.length === 0) {
    throw new Error('User quest not found or already completed');
  }

  const userQuest = userQuests[0];
  const quest = userQuest.expand?.quest;

  if (!quest) {
    throw new Error('Quest definition not found');
  }

  // Check if progress meets target
  if (userQuest.progress < quest.targetCount) {
    throw new Error(`Quest not ready to complete. Progress: ${userQuest.progress}/${quest.targetCount}`);
  }

  // Mark as completed
  const updatedUserQuest = await pb.collection('user_quests').update<UserQuest>(userQuest.id, {
    isCompleted: true,
    completedAt: new Date().toISOString(),
    progress: quest.targetCount, // Ensure progress is exactly the target
  });

  // Return completion response with rewards
  // Note: In a full implementation, this would update user stats/levels
  return {
    userQuest: updatedUserQuest,
    rewards: {
      xp: quest.xpReward,
      gold: quest.goldReward,
      gems: quest.gemsReward,
      levelUp: false, // TODO: Calculate based on user's total XP
      newLevel: 0,    // TODO: Calculate new level
    },
  };
}

// ============================================
// ADMIN / DEV HELPERS
// ============================================

/**
 * Seed quests (dev/admin)
 * Creates some default quests for testing
 */
async function seedQuests(): Promise<void> {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('User not authenticated');

  // Check if quests already exist
  const existingQuests = await pb.collection('quests').getFullList<Quest>();
  if (existingQuests.length > 0) {
    console.log('Quests already seeded');
    return;
  }

  // Create default daily quests
  const defaultQuests = [
    {
      key: 'daily_habit_3',
      title: 'Complete 3 Habits',
      description: 'Complete any 3 habits today',
      icon: '✅',
      type: 'HABIT_COMPLETION',
      category: 'DAILY',
      targetCount: 3,
      xpReward: 50,
      goldReward: 10,
      gemsReward: 1,
      difficulty: 1,
      isActive: true,
      isDaily: true,
    },
    {
      key: 'daily_streak',
      title: 'Build a Streak',
      description: 'Maintain a 3-day streak on any habit',
      icon: '🔥',
      type: 'STREAK_BUILD',
      category: 'DAILY',
      targetCount: 3,
      xpReward: 75,
      goldReward: 15,
      gemsReward: 2,
      difficulty: 2,
      isActive: true,
      isDaily: true,
    },
    {
      key: 'daily_social',
      title: 'Social Interaction',
      description: 'Help a household member with a task',
      icon: '🤝',
      type: 'SOCIAL',
      category: 'DAILY',
      targetCount: 1,
      xpReward: 100,
      goldReward: 20,
      gemsReward: 3,
      difficulty: 3,
      isActive: true,
      isDaily: true,
    },
  ];

  // Create the quests
  for (const quest of defaultQuests) {
    await pb.collection('quests').create<Quest>(quest);
  }

  console.log(`Seeded ${defaultQuests.length} default quests`);
}

// ============================================
// EXPORTS
// ============================================

export const questsApi = {
  getDailyQuests,
  updateProgress,
  completeQuest,
  seedQuests,
};

// Re-export types for convenience
export type {
  Quest,
  UserQuest,
  ExpandedUserQuest,
  QuestCompletionResponse,
  QuestType,
};
