import { IsString, IsOptional, IsEnum, IsInt, Min, Max, IsBoolean, IsDateString } from 'class-validator';
import { HabitType, HabitFrequency } from '@prisma/client';

export class CreateHabitDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsEnum(HabitType)
  type: HabitType;

  @IsOptional()
  @IsEnum(HabitFrequency)
  frequency?: HabitFrequency;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  difficulty?: number;

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
  healthCost?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
