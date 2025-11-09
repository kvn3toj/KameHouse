import { api } from './api';
import type {
  Household,
  CreateHouseholdDto,
  UpdateHouseholdDto,
  JoinHouseholdDto,
  LeaderboardEntry,
} from '@/types/household';

export const householdApi = {
  /**
   * Create a new household
   */
  create: async (data: CreateHouseholdDto): Promise<Household> => {
    return api.post<Household>('/household', data);
  },

  /**
   * Join a household using invite code
   */
  join: async (data: JoinHouseholdDto): Promise<Household> => {
    return api.post<Household>('/household/join', data);
  },

  /**
   * Get user's current household
   */
  getMy: async (): Promise<Household | null> => {
    return api.get<Household | null>('/household/my');
  },

  /**
   * Get household by ID
   */
  getById: async (id: string): Promise<Household> => {
    return api.get<Household>(`/household/${id}`);
  },

  /**
   * Update household
   */
  update: async (id: string, data: UpdateHouseholdDto): Promise<Household> => {
    return api.put<Household>(`/household/${id}`, data);
  },

  /**
   * Delete household (owner only)
   */
  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/household/${id}`);
  },

  /**
   * Leave household
   */
  leave: async (id: string): Promise<void> => {
    return api.post<void>(`/household/${id}/leave`);
  },

  /**
   * Remove member from household
   */
  removeMember: async (householdId: string, memberId: string): Promise<void> => {
    return api.delete<void>(`/household/${householdId}/members/${memberId}`);
  },

  /**
   * Get family leaderboard
   */
  getLeaderboard: async (id: string): Promise<LeaderboardEntry[]> => {
    return api.get<LeaderboardEntry[]>(`/household/${id}/leaderboard`);
  },
};
