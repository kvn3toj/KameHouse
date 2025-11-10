import { useState, useCallback, useEffect } from 'react';
import { achievementsApi } from '@/lib/achievements-api';
import type { Achievement } from '@/types/achievement';

const SEEN_ACHIEVEMENTS_KEY = 'kh_seen_achievements';

/**
 * Get seen achievement IDs from localStorage
 */
const getSeenAchievements = (): Set<string> => {
  try {
    const stored = localStorage.getItem(SEEN_ACHIEVEMENTS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

/**
 * Save seen achievement IDs to localStorage
 */
const saveSeenAchievements = (seenIds: Set<string>): void => {
  try {
    localStorage.setItem(SEEN_ACHIEVEMENTS_KEY, JSON.stringify([...seenIds]));
  } catch (error) {
    console.error('Failed to save seen achievements:', error);
  }
};

export interface UseAchievementsReturn {
  /** All user achievements */
  achievements: Achievement[];
  /** Set of achievement IDs that have been seen by the user */
  seenIds: Set<string>;
  /** Check for newly unlocked achievements */
  checkForNew: () => Promise<Achievement[]>;
  /** Mark an achievement as seen */
  markSeen: (achievementId: string) => void;
  /** Refresh all achievements */
  refresh: () => Promise<void>;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
}

/**
 * Hook for managing user achievements and tracking which ones have been seen
 *
 * @example
 * ```tsx
 * const { checkForNew, markSeen } = useAchievements();
 *
 * // After habit completion
 * const newAchievements = await checkForNew();
 * if (newAchievements.length > 0) {
 *   // Show achievement modal
 *   setShowAchievement(newAchievements[0]);
 * }
 * ```
 */
export const useAchievements = (): UseAchievementsReturn => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [seenIds, setSeenIds] = useState<Set<string>>(getSeenAchievements);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check for newly unlocked achievements that haven't been seen yet
   */
  const checkForNew = useCallback(async (): Promise<Achievement[]> => {
    try {
      setLoading(true);
      setError(null);

      // Check backend for any newly unlocked achievements
      const newlyUnlocked = await achievementsApi.checkUnlocks();

      // Filter out achievements that have already been seen
      const unseen = newlyUnlocked.filter(a => !seenIds.has(a.id));

      // Update achievements list
      if (unseen.length > 0) {
        setAchievements(prev => {
          const existingIds = new Set(prev.map(a => a.id));
          const toAdd = unseen.filter(a => !existingIds.has(a.id));
          return [...prev, ...toAdd];
        });
      }

      return unseen;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check achievements';
      setError(errorMessage);
      console.error('Failed to check for new achievements:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [seenIds]);

  /**
   * Mark an achievement as seen (user has viewed the achievement modal)
   */
  const markSeen = useCallback((achievementId: string): void => {
    const newSeen = new Set(seenIds);
    newSeen.add(achievementId);
    setSeenIds(newSeen);
    saveSeenAchievements(newSeen);
  }, [seenIds]);

  /**
   * Refresh all achievements from the backend
   */
  const refresh = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await achievementsApi.getAll();
      setAchievements(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load achievements';
      setError(errorMessage);
      console.error('Failed to refresh achievements:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load achievements on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    achievements,
    seenIds,
    checkForNew,
    markSeen,
    refresh,
    loading,
    error,
  };
};
