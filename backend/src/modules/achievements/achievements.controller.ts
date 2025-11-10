import { Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AchievementsService } from './achievements.service';
import { AchievementResponseDto } from './dto/achievement.dto';

@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class AchievementsController {
  constructor(private achievementsService: AchievementsService) {}

  @Get()
  async getUserAchievements(@Req() req: any): Promise<AchievementResponseDto[]> {
    return this.achievementsService.getUserAchievements(req.user.id);
  }

  @Post('check')
  async checkAchievements(@Req() req: any): Promise<AchievementResponseDto[]> {
    return this.achievementsService.checkAndUnlockAchievements(req.user.id);
  }

  @Post('seed')
  async seedAchievements(): Promise<{ message: string }> {
    await this.achievementsService.seedAchievements();
    return { message: 'Achievements seeded successfully' };
  }
}
