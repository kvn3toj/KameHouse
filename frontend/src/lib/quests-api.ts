import { api } from './api';
import type { UserQuest, QuestCompletionResponse } from '@/types/quest';

export const questsApi = {
  /**
   * Get daily quests for current user
   */
  getDailyQuests: async (): Promise<UserQuest[]> => {
    const response = await api.get('/quests/daily');
    return response.data;
  },

  /**
   * Update quest progress
   */
  updateProgress: async (questId: string, progress: number): Promise<UserQuest> => {
    const response = await api.post(`/quests/${questId}/progress`, { progress });
    return response.data;
  },

  /**
   * Complete a quest
   */
  completeQuest: async (questId: string): Promise<QuestCompletionResponse> => {
    const response = await api.post(`/quests/${questId}/complete`, {});
    return response.data;
  },

  /**
   * Seed quests (dev/admin)
   */
  seedQuests: async (): Promise<void> => {
    await api.post('/quests/seed');
  },
};
