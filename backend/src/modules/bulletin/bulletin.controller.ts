import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BulletinService } from './bulletin.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { ReactAnnouncementDto } from './dto/react-announcement.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('bulletin')
@UseGuards(JwtAuthGuard)
export class BulletinController {
  constructor(private readonly bulletinService: BulletinService) {}

  /**
   * POST /api/bulletin
   * Create a new announcement
   */
  @Post()
  async create(@Request() req, @Body() dto: CreateAnnouncementDto) {
    return this.bulletinService.create(req.user.id, dto);
  }

  /**
   * GET /api/bulletin/:householdId
   * Get all announcements for a household
   */
  @Get(':householdId')
  async findAll(@Param('householdId') householdId: string) {
    return this.bulletinService.findAll(householdId);
  }

  /**
   * GET /api/bulletin/announcement/:id
   * Get a single announcement
   */
  @Get('announcement/:id')
  async findOne(@Param('id') id: string) {
    return this.bulletinService.findOne(id);
  }

  /**
   * PUT /api/bulletin/:id
   * Update an announcement
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.bulletinService.update(id, req.user.id, dto);
  }

  /**
   * DELETE /api/bulletin/:id
   * Delete an announcement
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.bulletinService.remove(id, req.user.id);
  }

  /**
   * POST /api/bulletin/:id/pin
   * Toggle pin status
   */
  @Post(':id/pin')
  async togglePin(@Param('id') id: string, @Request() req) {
    return this.bulletinService.togglePin(id, req.user.id);
  }

  /**
   * POST /api/bulletin/:id/react
   * Add/remove reaction to announcement
   */
  @Post(':id/react')
  async toggleReaction(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: ReactAnnouncementDto,
  ) {
    return this.bulletinService.toggleReaction(id, req.user.id, dto);
  }

  /**
   * GET /api/bulletin/:id/reactions
   * Get reaction summary
   */
  @Get(':id/reactions')
  async getReactions(@Param('id') id: string) {
    return this.bulletinService.getReactionSummary(id);
  }
}
