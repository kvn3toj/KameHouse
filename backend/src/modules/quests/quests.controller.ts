import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { QuestsService } from './quests.service';
import { UpdateQuestProgressDto } from './dto/update-quest-progress.dto';
import { CompleteQuestDto } from './dto/complete-quest.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('quests')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  /**
   * GET /quests/daily
   * Get today's quests for the current user
   */
  @Get('daily')
  @UseGuards(JwtAuthGuard)
  getDailyQuests(@CurrentUser() user: any) {
    return this.questsService.getDailyQuests(user.id);
  }

  /**
   * GET /quests
   * Get all available quests (admin/dev)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  getAllQuests() {
    return this.questsService.getAllQuests();
  }

  /**
   * POST /quests/:questId/progress
   * Update quest progress
   */
  @Post(':questId/progress')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  updateProgress(
    @CurrentUser() user: any,
    @Param('questId') questId: string,
    @Body() updateProgressDto: UpdateQuestProgressDto,
  ) {
    return this.questsService.updateProgress(
      user.id,
      questId,
      updateProgressDto.progress,
    );
  }

  /**
   * POST /quests/:questId/complete
   * Mark quest as complete
   */
  @Post(':questId/complete')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  completeQuest(
    @CurrentUser() user: any,
    @Param('questId') questId: string,
    @Body() _completeQuestDto: CompleteQuestDto,
  ) {
    return this.questsService.completeQuest(user.id, questId);
  }

  /**
   * POST /quests/seed
   * Seed initial quests (dev/deployment)
   * No auth required for seeding
   */
  @Post('seed')
  @HttpCode(HttpStatus.OK)
  seedQuests() {
    return this.questsService.seedQuests();
  }
}
