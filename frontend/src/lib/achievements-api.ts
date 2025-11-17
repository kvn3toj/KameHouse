import { pb } from './pocketbase';
import type { Achievement } from '../types/achievement';

/**
 * Get all achievements for a household
 */
export const getAchievements = async (householdId: string): Promise<Achievement[]> => {
  try {
    // Get all achievements without parameters (PocketBase browser limitation)
    const allAchievements = await pb.collection('achievements').getFullList<Achievement>();

    // Filter and sort in JavaScript
    const householdAchievements = allAchievements
      .filter(a => a.household === householdId)
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    return householdAchievements;
  } catch (error) {
    console.error('Error fetching achievements:', error);
    throw error;
  }
};

/**
 * Get achievements for a specific user
 */
export const getUserAchievements = async (
  householdId: string,
  userId: string
): Promise<Achievement[]> => {
  try {
    const allAchievements = await getAchievements(householdId);

    // Filter for user's achievements
    const userAchievements = allAchievements.filter(a => a.user === userId);

    return userAchievements;
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    throw error;
  }
};

/**
 * Get unlocked achievements for a user
 */
export const getUnlockedAchievements = async (
  householdId: string,
  userId: string
): Promise<Achievement[]> => {
  try {
    const userAchievements = await getUserAchievements(householdId, userId);

    // Filter for unlocked achievements
    const unlockedAchievements = userAchievements.filter(a => a.unlocked);

    return unlockedAchievements;
  } catch (error) {
    console.error('Error fetching unlocked achievements:', error);
    throw error;
  }
};

/**
 * Get a single achievement by ID
 */
export const getAchievement = async (achievementId: string): Promise<Achievement> => {
  try {
    const achievement = await pb.collection('achievements').getOne<Achievement>(achievementId);
    return achievement;
  } catch (error) {
    console.error('Error fetching achievement:', error);
    throw error;
  }
};

/**
 * Create a new achievement
 */
export const createAchievement = async (
  achievement: Omit<Achievement, 'id' | 'created' | 'updated'>
): Promise<Achievement> => {
  try {
    const newAchievement = await pb.collection('achievements').create<Achievement>(achievement);
    return newAchievement;
  } catch (error) {
    console.error('Error creating achievement:', error);
    throw error;
  }
};

/**
 * Unlock an achievement
 */
export const unlockAchievement = async (achievementId: string): Promise<Achievement> => {
  try {
    const unlockedAchievement = await pb.collection('achievements').update<Achievement>(
      achievementId,
      {
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      }
    );
    return unlockedAchievement;
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    throw error;
  }
};

/**
 * Delete an achievement
 */
export const deleteAchievement = async (achievementId: string): Promise<void> => {
  try {
    await pb.collection('achievements').delete(achievementId);
  } catch (error) {
    console.error('Error deleting achievement:', error);
    throw error;
  }
};

/**
 * Achievements API for backward compatibility
 */
export const achievementsApi = {
  getAll: async (): Promise<Achievement[]> => {
    // For components that don't have household context, return empty array
    // This prevents crashes in NavigationBar while we refactor
    try {
      const userId = pb.authStore.model?.id;
      if (!userId) return [];

      // Get all achievements without filter to avoid 400 errors
      const allAchievements = await pb.collection('achievements').getFullList<Achievement>();

      // Filter for current user's achievements
      const userAchievements = allAchievements.filter(a => a.user === userId);

      return userAchievements;
    } catch (error) {
      console.error('Error in achievementsApi.getAll:', error);
      return [];
    }
  },
};
