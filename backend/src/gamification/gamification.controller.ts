import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GamificationService } from './gamification.service';

@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Post('task-complete/:roomId')
  async completeTask(
    @Request() req,
    @Param('roomId') roomId: string,
  ) {
    const userId = req.user.userId;
    const rewards = await this.gamificationService.calculateTaskRewards(
      userId,
      roomId,
      2, // Default difficulty
      15, // Default minutes
    );

    // Update streak
    const streakData = await this.gamificationService.updateStreak(userId);

    return {
      rewards,
      streak: streakData,
    };
  }

  @Get('room-stats/:roomId')
  async getRoomStats(@Param('roomId') roomId: string) {
    return this.gamificationService.getRoomStats(roomId);
  }

  @Post('update-streak')
  async updateStreak(@Request() req) {
    const userId = req.user.userId;
    return this.gamificationService.updateStreak(userId);
  }
}
