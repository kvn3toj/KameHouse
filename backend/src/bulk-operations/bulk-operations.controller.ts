import { Controller, Get, Post, Body, Param, Query, Request, UseGuards, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BulkOperationsService } from './bulk-operations.service';
import type { CreateBulkOperationDto } from './bulk-operations.service';

@Controller('bulk-operations')
@UseGuards(JwtAuthGuard)
export class BulkOperationsController {
  constructor(private readonly bulkOperationsService: BulkOperationsService) {}

  /**
   * Create and execute a bulk operation
   * POST /api/bulk-operations
   */
  @Post()
  async createAndExecute(@Request() req, @Body() data: CreateBulkOperationDto) {
    const userId = req.user.userId;
    return this.bulkOperationsService.createAndExecute(userId, data);
  }

  /**
   * Get operation history for a household
   * GET /api/bulk-operations/household/:householdId?limit=20
   */
  @Get('household/:householdId')
  async getHouseholdOperations(
    @Request() req,
    @Param('householdId') householdId: string,
    @Query('limit') limit?: string
  ) {
    const userId = req.user.userId;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.bulkOperationsService.getHouseholdOperations(userId, householdId, limitNum);
  }

  /**
   * Get a single operation
   * GET /api/bulk-operations/:id
   */
  @Get(':id')
  async getOperation(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.bulkOperationsService.getOperation(userId, id);
  }

  /**
   * Cancel an in-progress operation
   * PATCH /api/bulk-operations/:id/cancel
   */
  @Patch(':id/cancel')
  async cancelOperation(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.bulkOperationsService.cancelOperation(userId, id);
  }
}
