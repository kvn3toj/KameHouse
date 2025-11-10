import { IsString } from 'class-validator';

export class SwapChoreDto {
  @IsString()
  targetUserId: string;
}
