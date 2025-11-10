import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChoresService } from './chores.service';
import { CreateChoreTemplateDto } from './dto/create-chore-template.dto';
import { CompleteChoreDto } from './dto/complete-chore.dto';
import { SwapChoreDto } from './dto/swap-chore.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('chores')
@UseGuards(JwtAuthGuard)
export class ChoresController {
  constructor(private readonly choresService: ChoresService) {}

  /**
   * POST /api/chores/templates
   * Create a new chore template
   */
  @Post('templates')
  async createTemplate(@Body() dto: CreateChoreTemplateDto) {
    return this.choresService.createTemplate(dto);
  }

  /**
   * GET /api/chores/templates/:householdId
   * Get all templates for a household
   */
  @Get('templates/:householdId')
  async getTemplates(@Param('householdId') householdId: string) {
    return this.choresService.getTemplates(householdId);
  }

  /**
   * POST /api/chores/assign/:householdId
   * Auto-assign chores for the current week
   */
  @Post('assign/:householdId')
  async assignChores(@Param('householdId') householdId: string) {
    return this.choresService.assignChoresForWeek(householdId);
  }

  /**
   * GET /api/chores/my-week
   * Get current user's chores for this week
   */
  @Get('my-week')
  async getMyChores(@Request() req) {
    return this.choresService.getMyChores(req.user.id);
  }

  /**
   * POST /api/chores/:id/complete
   * Mark a chore as complete
   */
  @Post(':id/complete')
  async completeChore(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: CompleteChoreDto,
  ) {
    return this.choresService.completeChore(id, req.user.id, dto);
  }

  /**
   * POST /api/chores/:id/swap
   * Request to swap chore with another user
   */
  @Post(':id/swap')
  async swapChore(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: SwapChoreDto,
  ) {
    return this.choresService.requestSwap(id, req.user.id, dto);
  }
}
