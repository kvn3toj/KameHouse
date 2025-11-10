import { IsString, IsOptional, IsInt, Min, Max, IsBoolean, IsEnum } from 'class-validator';
import { ChoreFrequency } from '@prisma/client';

export class CreateChoreTemplateDto {
  @IsString()
  householdId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  difficulty?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedTime?: number;

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
  letsCredit?: number;

  @IsOptional()
  @IsEnum(ChoreFrequency)
  frequency?: ChoreFrequency;

  @IsOptional()
  @IsBoolean()
  photoRequired?: boolean;
}
