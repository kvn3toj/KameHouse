import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RoomTemplateService } from './room-template.service';
import type { CreateTemplateDto, UpdateTemplateDto } from './room-template.service';
import { RoomType } from '@prisma/client';

@Controller('room-templates')
@UseGuards(JwtAuthGuard)
export class RoomTemplateController {
  constructor(private readonly roomTemplateService: RoomTemplateService) {}

  /**
   * Create a new room template
   * POST /api/room-templates
   */
  @Post()
  async create(@Request() req, @Body() data: CreateTemplateDto) {
    const userId = req.user.userId;
    return this.roomTemplateService.create(userId, data);
  }

  /**
   * Get all templates (system + public + user's private)
   * GET /api/room-templates?roomType=LIVING_SPACE
   */
  @Get()
  async findAll(@Request() req, @Query('roomType') roomType?: RoomType) {
    const userId = req.user.userId;
    return this.roomTemplateService.findAll(userId, roomType);
  }

  /**
   * Get a single template
   * GET /api/room-templates/:id
   */
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.roomTemplateService.findOne(userId, id);
  }

  /**
   * Update a template (only creator can update)
   * PATCH /api/room-templates/:id
   */
  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() data: UpdateTemplateDto) {
    const userId = req.user.userId;
    return this.roomTemplateService.update(userId, id, data);
  }

  /**
   * Delete a template (only creator can delete)
   * DELETE /api/room-templates/:id
   */
  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.roomTemplateService.delete(userId, id);
  }

  /**
   * Apply a template to create a new room
   * POST /api/room-templates/:id/apply
   */
  @Post(':id/apply')
  async applyTemplate(
    @Request() req,
    @Param('id') templateId: string,
    @Body() data: { householdId: string }
  ) {
    const userId = req.user.userId;
    return this.roomTemplateService.applyTemplate(userId, templateId, data.householdId);
  }

  /**
   * Save current room as template
   * POST /api/room-templates/from-room/:roomId
   */
  @Post('from-room/:roomId')
  async saveRoomAsTemplate(
    @Request() req,
    @Param('roomId') roomId: string,
    @Body() data: { name: string; description?: string; isPublic?: boolean }
  ) {
    const userId = req.user.userId;
    return this.roomTemplateService.saveRoomAsTemplate(userId, roomId, data);
  }
}
