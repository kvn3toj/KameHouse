export enum QuestType {
  HABIT_COMPLETION = 'HABIT_COMPLETION',
  STREAK_BUILD = 'STREAK_BUILD',
  SPECIFIC_HABIT = 'SPECIFIC_HABIT',
  SOCIAL = 'SOCIAL',
  CUSTOM = 'CUSTOM',
}

export interface Quest {
  id: string;
  key: string;
  title: string;
  description: string;
  icon?: string;
  type: QuestType;
  category: string;
  targetCount: number;
  xpReward: number;
  goldReward: number;
  gemsReward: number;
  difficulty: number;
  isActive: boolean;
  isDaily: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserQuest {
  id: string;
  userId: string;
  questId: string;
  quest: Quest;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  assignedDate: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestCompletionResponse {
  userQuest: UserQuest;
  rewards: {
    xp: number;
    gold: number;
    gems: number;
    levelUp: boolean;
    newLevel: number;
  };
}
