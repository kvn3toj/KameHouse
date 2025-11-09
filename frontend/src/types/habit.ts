export enum HabitType {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE',
  DAILY = 'DAILY',
}

export enum HabitFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  CUSTOM = 'CUSTOM',
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  type: HabitType;
  frequency: HabitFrequency;
  difficulty: number;
  xpReward: number;
  goldReward: number;
  healthCost: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitDto {
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  type: HabitType;
  frequency?: HabitFrequency;
  difficulty?: number;
  xpReward?: number;
  goldReward?: number;
  healthCost?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UpdateHabitDto {
  title?: string;
  description?: string;
  icon?: string;
  color?: string;
  type?: HabitType;
  frequency?: HabitFrequency;
  difficulty?: number;
  xpReward?: number;
  goldReward?: number;
  healthCost?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface CompleteHabitDto {
  date?: string;
  notes?: string;
}

export interface CompletionRewards {
  xp: number;
  gold: number;
  healthChange: number;
  levelUp: boolean;
  newLevel: number;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  completedAt: string;
  date: string;
  notes: string | null;
  xpEarned: number;
  goldEarned: number;
}
