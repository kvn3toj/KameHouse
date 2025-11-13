import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TagService } from './tag.service';
import type { CreateTagDto, UpdateTagDto, AddTagsToTaskDto } from './tag.service';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  /**
   * Create a new tag
   * POST /api/tags
   */
  @Post()
  async create(@Request() req, @Body() data: CreateTagDto) {
    const userId = req.user.userId;
    return this.tagService.create(userId, data);
  }

  /**
   * Get all tags for a household
   * GET /api/tags?householdId=xxx
   */
  @Get()
  async findByHousehold(@Request() req, @Query('householdId') householdId: string) {
    const userId = req.user.userId;
    return this.tagService.findByHousehold(userId, householdId);
  }

  /**
   * Get a single tag by ID
   * GET /api/tags/:id
   */
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.tagService.findOne(userId, id);
  }

  /**
   * Update a tag
   * PATCH /api/tags/:id
   */
  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() data: UpdateTagDto) {
    const userId = req.user.userId;
    return this.tagService.update(userId, id, data);
  }

  /**
   * Delete a tag
   * DELETE /api/tags/:id
   */
  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.tagService.delete(userId, id);
  }

  /**
   * Add tags to a task
   * POST /api/tags/task/:taskId/add
   */
  @Post('task/:taskId/add')
  async addTagsToTask(
    @Request() req,
    @Param('taskId') taskId: string,
    @Body() data: AddTagsToTaskDto
  ) {
    const userId = req.user.userId;
    return this.tagService.addTagsToTask(userId, taskId, data);
  }

  /**
   * Remove tags from a task
   * POST /api/tags/task/:taskId/remove
   */
  @Post('task/:taskId/remove')
  async removeTagsFromTask(
    @Request() req,
    @Param('taskId') taskId: string,
    @Body() data: AddTagsToTaskDto
  ) {
    const userId = req.user.userId;
    return this.tagService.removeTagsFromTask(userId, taskId, data);
  }

  /**
   * Get tasks by tag
   * GET /api/tags/:id/tasks
   */
  @Get(':id/tasks')
  async getTasksByTag(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.tagService.getTasksByTag(userId, id);
  }
}
