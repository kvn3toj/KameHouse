import { apiClient } from './api-client';
import type { Achievement } from '@/types/achievement';

export const achievementsApi = {
  /**
   * Get all achievements with unlock status
   */
  getAll: async (): Promise<Achievement[]> => {
    const response = await apiClient.get('/achievements');
    return response.data;
  },

  /**
   * Check and unlock any newly earned achievements
   */
  checkUnlocks: async (): Promise<Achievement[]> => {
    const response = await apiClient.post('/achievements/check');
    return response.data;
  },
};
