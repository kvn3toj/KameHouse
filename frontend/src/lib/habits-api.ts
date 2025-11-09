import { api } from './api';
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
    return api.get<Habit[]>('/habits');
  },

  async getOne(id: string): Promise<Habit> {
    return api.get<Habit>(`/habits/${id}`);
  },

  async create(data: CreateHabitDto): Promise<Habit> {
    return api.post<Habit>('/habits', data);
  },

  async update(id: string, data: UpdateHabitDto): Promise<Habit> {
    return api.put<Habit>(`/habits/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete<void>(`/habits/${id}`);
  },

  async complete(id: string, data?: CompleteHabitDto): Promise<{
    completion: HabitCompletion;
    rewards: CompletionRewards;
  }> {
    return api.post(`/habits/${id}/complete`, data || {});
  },

  async uncomplete(id: string, date?: string): Promise<{ message: string }> {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    return api.delete<{ message: string }>(`/habits/${id}/complete${query}`);
  },
};
