import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CategoryService } from './category.service';
import type { CreateCategoryDto, UpdateCategoryDto } from './category.service';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Create a new task category
   * POST /api/categories
   */
  @Post()
  async create(@Request() req, @Body() data: CreateCategoryDto) {
    const userId = req.user.userId;
    return this.categoryService.create(userId, data);
  }

  /**
   * Get all categories for a household
   * GET /api/categories?householdId=xxx
   */
  @Get()
  async findByHousehold(@Request() req, @Query('householdId') householdId: string) {
    const userId = req.user.userId;
    return this.categoryService.findByHousehold(userId, householdId);
  }

  /**
   * Get a single category by ID
   * GET /api/categories/:id
   */
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.categoryService.findOne(userId, id);
  }

  /**
   * Update a category
   * PATCH /api/categories/:id
   */
  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() data: UpdateCategoryDto) {
    const userId = req.user.userId;
    return this.categoryService.update(userId, id, data);
  }

  /**
   * Delete a category (soft delete)
   * DELETE /api/categories/:id
   */
  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.categoryService.delete(userId, id);
  }

  /**
   * Reorder categories
   * PATCH /api/categories/reorder
   */
  @Patch('household/:householdId/reorder')
  async reorder(
    @Request() req,
    @Param('householdId') householdId: string,
    @Body() data: { categoryIds: string[] }
  ) {
    const userId = req.user.userId;
    return this.categoryService.reorder(userId, householdId, data.categoryIds);
  }

  /**
   * Get category statistics
   * GET /api/categories/:id/stats
   */
  @Get(':id/stats')
  async getStats(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.categoryService.getStats(userId, id);
  }
}
