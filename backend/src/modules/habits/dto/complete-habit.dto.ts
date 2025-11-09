import { IsOptional, IsString, IsDateString } from 'class-validator';

export class CompleteHabitDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
