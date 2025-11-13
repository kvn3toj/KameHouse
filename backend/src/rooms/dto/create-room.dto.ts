import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { RoomType } from '@prisma/client';

export class CreateRoomDto {
  @IsString()
  householdId: string;

  @IsString()
  name: string;

  @IsEnum(RoomType)
  @IsOptional()
  type?: RoomType;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
