import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateAchievementDto {
  @IsString()
  key: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsString()
  category: string;

  @IsInt()
  @Min(0)
  requirement: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  xpReward?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  goldReward?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  gemsReward?: number;
}

export class AchievementResponseDto {
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
