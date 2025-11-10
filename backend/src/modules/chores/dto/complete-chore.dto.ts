import { IsString, IsOptional } from 'class-validator';

export class CompleteChoreDto {
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
