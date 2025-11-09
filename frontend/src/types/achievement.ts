export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon?: string;
  category: string;
  requirement: number;
  xpReward: number;
  goldReward: number;
  gemsReward: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
}

export type AchievementCategory = 'level' | 'habits' | 'completions' | 'streak' | 'gold' | 'gems';
