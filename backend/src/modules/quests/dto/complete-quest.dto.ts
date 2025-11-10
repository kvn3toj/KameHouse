import { IsOptional, IsString } from 'class-validator';

export class CompleteQuestDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
