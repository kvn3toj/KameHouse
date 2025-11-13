import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TaskHistoryAction } from '@prisma/client';

export interface CreateTaskHistoryDto {
  taskId: string;
  userId: string;
  action: TaskHistoryAction;
  field?: string;
  oldValue?: string;
  newValue?: string;
  description?: string;
  metadata?: any;
}

@Injectable()
export class TaskHistoryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Log a task change to history
   */
  async logChange(data: CreateTaskHistoryDto) {
    return this.prisma.taskHistory.create({
      data: {
        taskId: data.taskId,
        userId: data.userId,
        action: data.action,
        field: data.field,
        oldValue: data.oldValue,
        newValue: data.newValue,
        description: data.description,
        metadata: data.metadata,
      },
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
  }

  /**
   * Get history for a specific task
   */
  async getTaskHistory(userId: string, taskId: string) {
    // Verify task exists and user has access
    const task = await this.prisma.choreTemplate.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    await this.verifyHouseholdMembership(userId, task.householdId);

    return this.prisma.taskHistory.findMany({
      where: { taskId },
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
    });
  }

  /**
   * Get recent activity for a household
   */
  async getHouseholdActivity(userId: string, householdId: string, limit: number = 50) {
    // Verify user is member of household
    await this.verifyHouseholdMembership(userId, householdId);

    return this.prisma.taskHistory.findMany({
      where: {
        task: {
          householdId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            icon: true,
            room: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
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
   * Get activity by user in a household
   */
  async getUserActivity(requestingUserId: string, targetUserId: string, householdId: string, limit: number = 50) {
    // Verify requesting user is member of household
    await this.verifyHouseholdMembership(requestingUserId, householdId);

    return this.prisma.taskHistory.findMany({
      where: {
        userId: targetUserId,
        task: {
          householdId,
        },
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            icon: true,
            room: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
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
   * Get activity for a specific room
   */
  async getRoomActivity(userId: string, roomId: string, limit: number = 50) {
    // Verify room exists and user has access
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    await this.verifyHouseholdMembership(userId, room.householdId);

    return this.prisma.taskHistory.findMany({
      where: {
        task: {
          roomId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            icon: true,
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
   * Get statistics about task changes
   */
  async getTaskStats(userId: string, taskId: string) {
    // Verify task exists and user has access
    const task = await this.prisma.choreTemplate.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    await this.verifyHouseholdMembership(userId, task.householdId);

    const history = await this.prisma.taskHistory.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    const totalChanges = history.length;
    const actionCounts = history.reduce((acc, entry) => {
      acc[entry.action] = (acc[entry.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const userContributions = history.reduce((acc, entry) => {
      const username = entry.user.displayName || entry.user.username;
      acc[username] = (acc[username] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const firstChange = history[history.length - 1];
    const lastChange = history[0];

    return {
      taskId,
      totalChanges,
      actionCounts,
      userContributions,
      firstChange: firstChange ? {
        action: firstChange.action,
        user: firstChange.user.displayName || firstChange.user.username,
        timestamp: firstChange.createdAt,
      } : null,
      lastChange: lastChange ? {
        action: lastChange.action,
        user: lastChange.user.displayName || lastChange.user.username,
        timestamp: lastChange.createdAt,
      } : null,
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
