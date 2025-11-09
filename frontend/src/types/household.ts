export enum HouseholdRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface HouseholdMember {
  id: string;
  userId: string;
  username: string;
  displayName?: string;
  avatar?: string;
  role: HouseholdRole;
  nickname?: string;
  contribution: number;
  level: number;
  xp: number;
  gold: number;
  joinedAt: Date;
}

export interface Household {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  inviteCode: string;
  isActive: boolean;
  maxMembers: number;
  ownerId: string;
  memberCount: number;
  members: HouseholdMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName?: string;
  avatar?: string;
  level: number;
  xp: number;
  gold: number;
  contribution: number;
  habitsCompleted: number;
  currentStreak: number;
  rank: number;
}

export interface CreateHouseholdDto {
  name: string;
  description?: string;
  avatar?: string;
  maxMembers?: number;
}

export interface UpdateHouseholdDto {
  name?: string;
  description?: string;
  avatar?: string;
  maxMembers?: number;
}

export interface JoinHouseholdDto {
  inviteCode: string;
  nickname?: string;
}
