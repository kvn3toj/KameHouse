import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface CreateCategoryDto {
  householdId: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  order?: number;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
}

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new task category
   */
  async create(userId: string, data: CreateCategoryDto) {
    // Verify user is member of household
    await this.verifyHouseholdMembership(userId, data.householdId);

    return this.prisma.taskCategory.create({
      data: {
        householdId: data.householdId,
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        order: data.order ?? 0,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });
  }

  /**
   * Get all categories for a household
   */
  async findByHousehold(userId: string, householdId: string) {
    // Verify user is member of household
    await this.verifyHouseholdMembership(userId, householdId);

    return this.prisma.taskCategory.findMany({
      where: {
        householdId,
        isActive: true,
      },
      orderBy: {
        order: 'asc',
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });
  }

  /**
   * Get a single category by ID
   */
  async findOne(userId: string, categoryId: string) {
    const category = await this.prisma.taskCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { tasks: true },
        },
        tasks: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            icon: true,
            status: true,
            dueDate: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    // Verify user is member of household
    await this.verifyHouseholdMembership(userId, category.householdId);

    return category;
  }

  /**
   * Update a category
   */
  async update(userId: string, categoryId: string, data: UpdateCategoryDto) {
    const category = await this.prisma.taskCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    // Verify user is member of household
    await this.verifyHouseholdMembership(userId, category.householdId);

    return this.prisma.taskCategory.update({
      where: { id: categoryId },
      data,
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });
  }

  /**
   * Delete a category (soft delete by setting isActive = false)
   */
  async delete(userId: string, categoryId: string) {
    const category = await this.prisma.taskCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    // Verify user is member of household
    await this.verifyHouseholdMembership(userId, category.householdId);

    // Soft delete by setting isActive = false
    return this.prisma.taskCategory.update({
      where: { id: categoryId },
      data: { isActive: false },
    });
  }

  /**
   * Reorder categories
   */
  async reorder(userId: string, householdId: string, categoryIds: string[]) {
    // Verify user is member of household
    await this.verifyHouseholdMembership(userId, householdId);

    // Update order for each category
    const updates = categoryIds.map((categoryId, index) =>
      this.prisma.taskCategory.update({
        where: { id: categoryId },
        data: { order: index },
      })
    );

    await Promise.all(updates);

    return this.findByHousehold(userId, householdId);
  }

  /**
   * Get category statistics
   */
  async getStats(userId: string, categoryId: string) {
    const category = await this.prisma.taskCategory.findUnique({
      where: { id: categoryId },
      include: {
        tasks: {
          where: { isActive: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    // Verify user is member of household
    await this.verifyHouseholdMembership(userId, category.householdId);

    const totalTasks = category.tasks.length;
    const completedTasks = category.tasks.filter((t) => t.status === 'completed').length;
    const pendingTasks = category.tasks.filter((t) => t.status === 'pending').length;
    const inProgressTasks = category.tasks.filter((t) => t.status === 'in_progress').length;
    const overdueTasks = category.tasks.filter((t) => t.status === 'overdue').length;

    return {
      categoryId: category.id,
      categoryName: category.name,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0',
    };
  }

  /**
   * Verify user is a member of the household
   */
  private async verifyHouseholdMembership(userId: string, householdId: string) {
    const member = await this.prisma.householdMember.findFirst({
      where: {
        userId,
        householdId,
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this household');
    }

    return member;
  }
}
