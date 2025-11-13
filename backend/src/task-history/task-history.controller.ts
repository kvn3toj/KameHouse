import { Controller, Get, Post, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TaskHistoryService } from './task-history.service';
import type { CreateTaskHistoryDto } from './task-history.service';

@Controller('task-history')
@UseGuards(JwtAuthGuard)
export class TaskHistoryController {
  constructor(private readonly taskHistoryService: TaskHistoryService) {}

  /**
   * Log a task change (internal use, typically called by other services)
   * POST /api/task-history
   */
  @Post()
  async logChange(@Request() req, @Body() data: CreateTaskHistoryDto) {
    const userId = req.user.userId;
    return this.taskHistoryService.logChange({ ...data, userId });
  }

  /**
   * Get history for a specific task
   * GET /api/task-history/task/:taskId
   */
  @Get('task/:taskId')
  async getTaskHistory(@Request() req, @Param('taskId') taskId: string) {
    const userId = req.user.userId;
    return this.taskHistoryService.getTaskHistory(userId, taskId);
  }

  /**
   * Get task statistics
   * GET /api/task-history/task/:taskId/stats
   */
  @Get('task/:taskId/stats')
  async getTaskStats(@Request() req, @Param('taskId') taskId: string) {
    const userId = req.user.userId;
    return this.taskHistoryService.getTaskStats(userId, taskId);
  }

  /**
   * Get recent activity for a household
   * GET /api/task-history/household/:householdId?limit=50
   */
  @Get('household/:householdId')
  async getHouseholdActivity(
    @Request() req,
    @Param('householdId') householdId: string,
    @Query('limit') limit?: string
  ) {
    const userId = req.user.userId;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.taskHistoryService.getHouseholdActivity(userId, householdId, limitNum);
  }

  /**
   * Get activity by user in a household
   * GET /api/task-history/household/:householdId/user/:targetUserId?limit=50
   */
  @Get('household/:householdId/user/:targetUserId')
  async getUserActivity(
    @Request() req,
    @Param('householdId') householdId: string,
    @Param('targetUserId') targetUserId: string,
    @Query('limit') limit?: string
  ) {
    const userId = req.user.userId;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.taskHistoryService.getUserActivity(userId, targetUserId, householdId, limitNum);
  }

  /**
   * Get activity for a specific room
   * GET /api/task-history/room/:roomId?limit=50
   */
  @Get('room/:roomId')
  async getRoomActivity(
    @Request() req,
    @Param('roomId') roomId: string,
    @Query('limit') limit?: string
  ) {
    const userId = req.user.userId;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.taskHistoryService.getRoomActivity(userId, roomId, limitNum);
  }
}
