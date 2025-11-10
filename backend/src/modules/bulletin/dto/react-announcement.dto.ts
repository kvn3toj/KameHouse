import { IsString } from 'class-validator';

export class ReactAnnouncementDto {
  @IsString()
  emoji: string; // 👍 ❤️ 😂 😮 😢 🎉
}
