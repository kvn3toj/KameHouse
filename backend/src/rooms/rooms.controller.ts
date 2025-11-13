import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { TaskSchedulerService } from './task-scheduler.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly taskSchedulerService: TaskSchedulerService,
  ) {}

  @Post()
  create(@Request() req, @Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(req.user.userId, createRoomDto);
  }

  @Get('household/:householdId')
  findByHousehold(@Param('householdId') householdId: string) {
    return this.roomsService.findByHousehold(householdId);
  }

  @Get('presets')
  getPresets() {
    return this.roomsService.getTaskPresets();
  }

  @Get('presets/:roomType')
  getPresetsByRoomType(@Param('roomType') roomType: string) {
    return this.roomsService.getTaskPresetsByRoomType(roomType);
  }

  @Post(':id/tasks/from-preset/:presetId')
  createTaskFromPreset(
    @Request() req,
    @Param('id') roomId: string,
    @Param('presetId') presetId: string,
  ) {
    return this.roomsService.createTaskFromPreset(roomId, presetId, req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Get(':id/tasks')
  getRoomTasks(@Param('id') id: string) {
    return this.roomsService.getRoomTasks(id);
  }

  @Post(':id/tasks')
  createCustomTask(@Request() req, @Param('id') roomId: string, @Body() data: any) {
    return this.roomsService.createCustomTask(roomId, req.user.userId, data);
  }

  @Patch(':id/tasks/:taskId')
  updateTask(@Request() req, @Param('taskId') taskId: string, @Body() data: any) {
    return this.roomsService.updateTask(taskId, req.user.userId, data);
  }

  @Delete(':id/tasks/:taskId')
  deleteTask(@Request() req, @Param('taskId') taskId: string) {
    return this.roomsService.deleteTask(taskId, req.user.userId);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.update(id, req.user.userId, updateRoomDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.roomsService.remove(id, req.user.userId);
  }

  // ============================================
  // TASK SCHEDULING ENDPOINTS (Sprint 5B)
  // ============================================

  @Patch(':roomId/tasks/:taskId/schedule')
  scheduleTask(
    @Param('roomId') roomId: string,
    @Param('taskId') taskId: string,
    @Body() scheduleData: any,
  ) {
    return this.taskSchedulerService.scheduleTask(taskId, scheduleData);
  }

  @Post(':roomId/tasks/:taskId/schedule/instances')
  generateInstances(
    @Param('roomId') roomId: string,
    @Param('taskId') taskId: string,
    @Body() data: { until: string },
  ) {
    const until = new Date(data.until);
    return this.taskSchedulerService.createRecurrentInstances(taskId, until);
  }

  @Delete(':roomId/tasks/:taskId/schedule')
  cancelSchedule(@Param('roomId') roomId: string, @Param('taskId') taskId: string) {
    return this.taskSchedulerService.cancelSchedule(taskId);
  }

  @Get(':roomId/tasks/scheduled')
  getScheduledTasks(
    @Param('roomId') roomId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.taskSchedulerService.getScheduledTasks(roomId, start, end);
  }

  @Patch(':roomId/tasks/:taskId/status')
  updateTaskStatus(
    @Param('roomId') roomId: string,
    @Param('taskId') taskId: string,
    @Body() data: { status: string },
  ) {
    return this.taskSchedulerService.updateTaskStatus(taskId, data.status as any);
  }

  // ============================================
  // ROOM ANALYTICS ENDPOINTS (Sprint 6)
  // ============================================

  /**
   * Get comprehensive analytics for a specific room
   * GET /api/rooms/:id/analytics
   */
  @Get(':id/analytics')
  getRoomAnalytics(@Request() req, @Param('id') roomId: string) {
    return this.roomsService.getRoomAnalytics(roomId, req.user.userId);
  }

  /**
   * Get household-wide room analytics
   * GET /api/rooms/household/:householdId/analytics
   */
  @Get('household/:householdId/analytics')
  getHouseholdRoomAnalytics(@Request() req, @Param('householdId') householdId: string) {
    return this.roomsService.getHouseholdRoomAnalytics(householdId, req.user.userId);
  }

  // ============================================
  // ROOM ARCHIVING ENDPOINTS (Sprint 6)
  // ============================================

  /**
   * Archive a room
   * POST /api/rooms/:id/archive
   */
  @Post(':id/archive')
  archiveRoom(@Request() req, @Param('id') roomId: string) {
    return this.roomsService.archiveRoom(roomId, req.user.userId);
  }

  /**
   * Restore an archived room
   * POST /api/rooms/:id/restore
   */
  @Post(':id/restore')
  restoreRoom(@Request() req, @Param('id') roomId: string) {
    return this.roomsService.restoreRoom(roomId, req.user.userId);
  }

  /**
   * Get archived rooms for a household
   * GET /api/rooms/household/:householdId/archived
   */
  @Get('household/:householdId/archived')
  getArchivedRooms(@Request() req, @Param('householdId') householdId: string) {
    return this.roomsService.getArchivedRooms(householdId, req.user.userId);
  }
}
