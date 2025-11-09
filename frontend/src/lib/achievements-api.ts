import { api } from './api';
import type { Achievement } from '@/types/achievement';

export const achievementsApi = {
  /**
   * Get all achievements with unlock status
   */
  getAll: async (): Promise<Achievement[]> => {
    return api.get<Achievement[]>('/achievements');
  },

  /**
   * Check and unlock any newly earned achievements
   */
  checkUnlocks: async (): Promise<Achievement[]> => {
    return api.post<Achievement[]>('/achievements/check');
  },
};
