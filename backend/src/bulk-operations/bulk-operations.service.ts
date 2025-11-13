import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BulkOperationType, BulkOperationStatus } from '@prisma/client';

export interface CreateBulkOperationDto {
  householdId: string;
  operation: BulkOperationType;
  criteria: {
    taskIds?: string[];
    roomId?: string;
    categoryId?: string;
    tagIds?: string[];
    status?: string;
  };
  changes: {
    status?: string;
    assignedTo?: string;
    categoryId?: string;
    tagIds?: string[];
    scheduledFor?: Date;
  };
}

export interface BulkOperationResult {
  operationId: string;
  status: BulkOperationStatus;
  targetCount: number;
  successCount: number;
  failureCount: number;
  errors?: any[];
}

@Injectable()
export class BulkOperationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create and execute a bulk operation
   */
  async createAndExecute(userId: string, data: CreateBulkOperationDto): Promise<BulkOperationResult> {
    // Verify user is member of household
    await this.verifyHouseholdMembership(userId, data.householdId);

    // Find tasks matching criteria
    const tasks = await this.findTasksByCriteria(data.householdId, data.criteria);

    if (tasks.length === 0) {
      throw new BadRequestException('No tasks found matching the specified criteria');
    }

    // Create bulk operation record
    const operation = await this.prisma.bulkOperation.create({
      data: {
        householdId: data.householdId,
        userId,
        operation: data.operation,
        targetCount: tasks.length,
        criteria: data.criteria,
        changes: data.changes,
        status: BulkOperationStatus.IN_PROGRESS,
        progress: 0,
      },
    });

    // Execute the operation
    const result = await this.executeOperation(operation.id, tasks, data.operation, data.changes);

    return result;
  }

  /**
   * Find tasks by criteria
   */
  private async findTasksByCriteria(householdId: string, criteria: any) {
    const where: any = {
      householdId,
      isActive: true,
    };

    if (criteria.taskIds && criteria.taskIds.length > 0) {
      where.id = { in: criteria.taskIds };
    }

    if (criteria.roomId) {
      where.roomId = criteria.roomId;
    }

    if (criteria.categoryId) {
      where.categoryId = criteria.categoryId;
    }

    if (criteria.tagIds && criteria.tagIds.length > 0) {
      where.tags = {
        some: {
          tagId: { in: criteria.tagIds },
        },
      };
    }

    if (criteria.status) {
      where.status = criteria.status;
    }

    return this.prisma.choreTemplate.findMany({
      where,
      include: {
        tags: true,
      },
    });
  }

  /**
   * Execute the bulk operation
   */
  private async executeOperation(
    operationId: string,
    tasks: any[],
    operation: BulkOperationType,
    changes: any
  ): Promise<BulkOperationResult> {
    let successCount = 0;
    let failureCount = 0;
    const errors: any[] = [];

    for (let i = 0; i < tasks.length; i++) {
      try {
        switch (operation) {
          case BulkOperationType.UPDATE_STATUS:
            await this.updateTaskStatus(tasks[i].id, changes.status);
            break;

          case BulkOperationType.DELETE:
            await this.deleteTask(tasks[i].id);
            break;

          case BulkOperationType.ASSIGN:
            await this.assignTask(tasks[i].id, changes.assignedTo);
            break;

          case BulkOperationType.RESCHEDULE:
            await this.rescheduleTask(tasks[i].id, changes.scheduledFor);
            break;

          case BulkOperationType.TAG:
            await this.tagTask(tasks[i].id, changes.tagIds);
            break;

          case BulkOperationType.CATEGORY_CHANGE:
            await this.changeCategoryTask(tasks[i].id, changes.categoryId);
            break;

          default:
            throw new BadRequestException(`Unsupported operation type: ${operation}`);
        }

        successCount++;
      } catch (error) {
        failureCount++;
        errors.push({
          taskId: tasks[i].id,
          taskTitle: tasks[i].title,
          error: error.message,
        });
      }

      // Update progress
      const progress = Math.floor(((i + 1) / tasks.length) * 100);
      await this.prisma.bulkOperation.update({
        where: { id: operationId },
        data: { progress },
      });
    }

    // Mark operation as completed or failed
    const finalStatus = failureCount === 0 ? BulkOperationStatus.COMPLETED :
                       successCount === 0 ? BulkOperationStatus.FAILED :
                       BulkOperationStatus.COMPLETED;

    await this.prisma.bulkOperation.update({
      where: { id: operationId },
      data: {
        status: finalStatus,
        progress: 100,
        completedAt: new Date(),
        errors: errors.length > 0 ? errors : null,
      },
    });

    return {
      operationId,
      status: finalStatus,
      targetCount: tasks.length,
      successCount,
      failureCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Update task status
   */
  private async updateTaskStatus(taskId: string, status: string) {
    await this.prisma.choreTemplate.update({
      where: { id: taskId },
      data: { status },
    });
  }

  /**
   * Delete task (soft delete)
   */
  private async deleteTask(taskId: string) {
    await this.prisma.choreTemplate.update({
      where: { id: taskId },
      data: { isActive: false },
    });
  }

  /**
   * Assign task - Creates a ChoreAssignment record
   */
  private async assignTask(taskId: string, assignedTo: string) {
    if (!assignedTo) {
      throw new BadRequestException('assignedTo is required for ASSIGN operation');
    }

    // Get the task to find its household
    const task = await this.prisma.choreTemplate.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new BadRequestException('Task not found');
    }

    // Create assignment for current week
    const weekStarting = new Date();
    weekStarting.setHours(0, 0, 0, 0);
    const dayOfWeek = weekStarting.getDay();
    weekStarting.setDate(weekStarting.getDate() - dayOfWeek);

    await this.prisma.choreAssignment.create({
      data: {
        choreId: taskId,
        assignedTo,
        weekStarting,
      },
    });
  }

  /**
   * Reschedule task
   */
  private async rescheduleTask(taskId: string, scheduledFor: Date) {
    if (!scheduledFor) {
      throw new BadRequestException('scheduledFor is required for RESCHEDULE operation');
    }

    await this.prisma.choreTemplate.update({
      where: { id: taskId },
      data: {
        scheduledAt: new Date(scheduledFor),
        dueDate: new Date(scheduledFor)
      },
    });
  }

  /**
   * Tag task
   */
  private async tagTask(taskId: string, tagIds: string[]) {
    if (!tagIds || tagIds.length === 0) {
      throw new BadRequestException('tagIds are required for TAG operation');
    }

    // Remove existing tags
    await this.prisma.taskTag.deleteMany({
      where: { taskId },
    });

    // Add new tags
    const creates = tagIds.map((tagId) =>
      this.prisma.taskTag.create({
        data: {
          taskId,
          tagId,
        },
      })
    );

    await Promise.all(creates);
  }

  /**
   * Change task category
   */
  private async changeCategoryTask(taskId: string, categoryId: string) {
    await this.prisma.choreTemplate.update({
      where: { id: taskId },
      data: { categoryId },
    });
  }

  /**
   * Get operation history for a household
   */
  async getHouseholdOperations(userId: string, householdId: string, limit: number = 20) {
    // Verify user is member of household
    await this.verifyHouseholdMembership(userId, householdId);

    return this.prisma.bulkOperation.findMany({
      where: { householdId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Get a single operation
   */
  async getOperation(userId: string, operationId: string) {
    const operation = await this.prisma.bulkOperation.findUnique({
      where: { id: operationId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    if (!operation) {
      throw new NotFoundException(`Operation with ID ${operationId} not found`);
    }

    // Verify user is member of household
    await this.verifyHouseholdMembership(userId, operation.householdId);

    return operation;
  }

  /**
   * Cancel an in-progress operation
   */
  async cancelOperation(userId: string, operationId: string) {
    const operation = await this.prisma.bulkOperation.findUnique({
      where: { id: operationId },
    });

    if (!operation) {
      throw new NotFoundException(`Operation with ID ${operationId} not found`);
    }

    // Verify user is member of household
    await this.verifyHouseholdMembership(userId, operation.householdId);

    // Only allow canceling if in progress or pending
    if (operation.status !== BulkOperationStatus.IN_PROGRESS && operation.status !== BulkOperationStatus.PENDING) {
      throw new BadRequestException('Can only cancel operations that are in progress or pending');
    }

    return this.prisma.bulkOperation.update({
      where: { id: operationId },
      data: {
        status: BulkOperationStatus.CANCELLED,
        completedAt: new Date(),
      },
    });
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
