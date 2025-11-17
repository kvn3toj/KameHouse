import { pb } from './pocketbase';
import type {
  Habit,
  CreateHabitDto,
  UpdateHabitDto,
  CompleteHabitDto,
  CompletionRewards,
  HabitCompletion,
} from '@/types/habit';

export const habitsApi = {
  async getAll(): Promise<Habit[]> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('User not authenticated');

    const result = await pb.collection('habits').getList<Habit>(1, 50, {
      filter: `user = "${userId}" && isActive = true`,
    });

    return result.items;
  },

  async getOne(id: string): Promise<Habit> {
    return await pb.collection('habits').getOne<Habit>(id);
  },

  async create(data: CreateHabitDto): Promise<Habit> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('User not authenticated');

    // Calculate rewards based on difficulty
    const xpReward = data.difficulty * 10;
    const goldReward = data.difficulty * 5;

    return await pb.collection('habits').create<Habit>({
      user: userId,
      title: data.title,
      description: data.description || '',
      type: data.type,
      frequency: 'DAILY', // Default to DAILY
      difficulty: data.difficulty,
      xpReward,
      goldReward,
      currentStreak: 0,
      isActive: true,
      startDate: new Date().toISOString(),
    });
  },

  async update(id: string, data: UpdateHabitDto): Promise<Habit> {
    return await pb.collection('habits').update<Habit>(id, data);
  },

  async delete(id: string): Promise<void> {
    await pb.collection('habits').update(id, { isActive: false });
  },

  async complete(id: string, data?: CompleteHabitDto): Promise<{
    completion: HabitCompletion;
    rewards: CompletionRewards;
  }> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('User not authenticated');

    // Get habit details
    const habit = await pb.collection('habits').getOne<Habit>(id);

    // Create completion record
    const completion = await pb.collection('habit_completions').create<HabitCompletion>({
      user: userId,
      habit: id,
      completedAt: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      xpEarned: habit.xpReward,
      goldEarned: habit.goldReward,
    });

    // Update user stats
    const currentUser = pb.authStore.model as any;
    const newXP = currentUser.xp + habit.xpReward;
    const newGold = currentUser.gold + habit.goldReward;

    // Calculate level up
    const currentLevel = currentUser.level;
    const newLevel = Math.floor(newXP / 100) + 1;
    const levelUp = newLevel > currentLevel;

    await pb.collection('users').update(userId, {
      xp: newXP,
      gold: newGold,
      level: newLevel,
    });

    // Update habit streak
    await pb.collection('habits').update(id, {
      currentStreak: habit.currentStreak + 1,
    });

    // Return completion and rewards
    return {
      completion,
      rewards: {
        xp: habit.xpReward,
        gold: habit.goldReward,
        levelUp,
        newLevel: levelUp ? newLevel : currentLevel,
      },
    };
  },

  async uncomplete(id: string, date?: string): Promise<{ message: string }> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('User not authenticated');

    // Find the most recent completion
    const targetDate = date || new Date().toISOString().split('T')[0];
    const completions = await pb.collection('habit_completions').getList(1, 1, {
      filter: `user = "${userId}" && habit = "${id}" && date = "${targetDate}"`,
      sort: '-created',
    });

    if (completions.items.length === 0) {
      throw new Error('No completion found for this date');
    }

    const completion = completions.items[0];

    // Revert user stats
    const currentUser = pb.authStore.model as any;
    await pb.collection('users').update(userId, {
      xp: Math.max(0, currentUser.xp - completion.xpEarned),
      gold: Math.max(0, currentUser.gold - completion.goldEarned),
    });

    // Delete completion
    await pb.collection('habit_completions').delete(completion.id);

    // Update habit streak (decrease by 1)
    const habit = await pb.collection('habits').getOne<Habit>(id);
    await pb.collection('habits').update(id, {
      currentStreak: Math.max(0, habit.currentStreak - 1),
    });

    return { message: 'Habit uncompleted successfully' };
  },
};
