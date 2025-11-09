import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { HouseholdRole } from '@prisma/client';

export class CreateHouseholdDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(50)
  maxMembers?: number;
}

export class UpdateHouseholdDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(50)
  maxMembers?: number;
}

export class JoinHouseholdDto {
  @IsString()
  inviteCode: string;

  @IsOptional()
  @IsString()
  nickname?: string;
}

export class UpdateMemberDto {
  @IsOptional()
  @IsEnum(HouseholdRole)
  role?: HouseholdRole;

  @IsOptional()
  @IsString()
  nickname?: string;
}

export interface HouseholdMemberResponse {
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

export interface HouseholdResponse {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  inviteCode: string;
  isActive: boolean;
  maxMembers: number;
  ownerId: string;
  memberCount: number;
  members: HouseholdMemberResponse[];
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
