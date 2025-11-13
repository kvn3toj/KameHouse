import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from '../notifications/notification.service';

export interface ScheduleConfig {
  scheduledAt?: Date;
  dueDate?: Date;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrenceData?: {
    interval?: number; // every N days/weeks/months
    daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc.
    dayOfMonth?: number; // 1-31
  };
  timezone?: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

@Injectable()
export class TaskSchedulerService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  /**
   * Schedule a task with optional recurrence
   */
  async scheduleTask(taskId: string, schedule: ScheduleConfig) {
    const task = await this.prisma.choreTemplate.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.choreTemplate.update({
      where: { id: taskId },
      data: {
        scheduledAt: schedule.scheduledAt,
        dueDate: schedule.dueDate,
        recurrence: schedule.recurrence || 'none',
        recurrenceData: schedule.recurrenceData || null,
        timezone: schedule.timezone || 'America/Mexico_City',
        status: 'pending',
      },
    });
  }

  /**
   * Create recurring task instances for a date range
   */
  async createRecurrentInstances(taskId: string, until: Date) {
    const parentTask = await this.prisma.choreTemplate.findUnique({
      where: { id: taskId },
    });

    if (!parentTask) {
      throw new NotFoundException('Parent task not found');
    }

    if (parentTask.recurrence === 'none' || !parentTask.recurrence) {
      return [];
    }

    const instances = this.generateInstanceDates(
      parentTask.scheduledAt || new Date(),
      until,
      parentTask.recurrence as 'daily' | 'weekly' | 'monthly',
      parentTask.recurrenceData as any,
    );

    const createdInstances = [];

    for (const instanceDate of instances) {
      // Check if instance already exists
      const existing = await this.prisma.choreTemplate.findFirst({
        where: {
          parentTaskId: taskId,
          scheduledAt: instanceDate,
        },
      });

      if (!existing) {
        const instance = await this.prisma.choreTemplate.create({
          data: {
            householdId: parentTask.householdId,
            roomId: parentTask.roomId,
            title: parentTask.title,
            description: parentTask.description,
            icon: parentTask.icon,
            difficulty: parentTask.difficulty,
            estimatedTime: parentTask.estimatedTime,
            xpReward: parentTask.xpReward,
            goldReward: parentTask.goldReward,
            letsCredit: parentTask.letsCredit,
            frequency: parentTask.frequency,
            photoRequired: parentTask.photoRequired,
            scheduledAt: instanceDate,
            dueDate: this.calculateDueDate(instanceDate, parentTask.recurrence as any),
            recurrence: 'none', // Instances don't recur
            timezone: parentTask.timezone,
            status: 'pending',
            parentTaskId: taskId,
          },
        });
        createdInstances.push(instance);
      }
    }

    return createdInstances;
  }

  /**
   * Update task schedule
   */
  async updateSchedule(taskId: string, newSchedule: ScheduleConfig) {
    return this.scheduleTask(taskId, newSchedule);
  }

  /**
   * Cancel/remove schedule from a task
   */
  async cancelSchedule(taskId: string) {
    return this.prisma.choreTemplate.update({
      where: { id: taskId },
      data: {
        scheduledAt: null,
        dueDate: null,
        recurrence: 'none',
        recurrenceData: null,
      },
    });
  }

  /**
   * Get next occurrence date for a recurring task
   */
  async getNextOccurrence(taskId: string): Promise<Date | null> {
    const task = await this.prisma.choreTemplate.findUnique({
      where: { id: taskId },
    });

    if (!task || task.recurrence === 'none' || !task.scheduledAt) {
      return null;
    }

    const now = new Date();
    const instances = this.generateInstanceDates(
      task.scheduledAt,
      new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      task.recurrence as 'daily' | 'weekly' | 'monthly',
      task.recurrenceData as any,
    );

    const futureInstances = instances.filter((date) => date > now);
    return futureInstances.length > 0 ? futureInstances[0] : null;
  }

  /**
   * Generate instances for a specific month
   */
  async generateInstancesForMonth(taskId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    return this.createRecurrentInstances(taskId, endDate);
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: TaskStatus) {
    return this.prisma.choreTemplate.update({
      where: { id: taskId },
      data: {
        status,
        completedAt: status === 'completed' ? new Date() : null,
      },
    });
  }

  /**
   * Get scheduled tasks for a room within a date range
   */
  async getScheduledTasks(roomId: string, startDate: Date, endDate: Date) {
    return this.prisma.choreTemplate.findMany({
      where: {
        roomId,
        isActive: true,
        OR: [
          {
            scheduledAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            dueDate: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  }

  /**
   * Cron job to mark overdue tasks
   * Runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async markOverdueTasks() {
    const now = new Date();

    const overdueTasks = await this.prisma.choreTemplate.findMany({
      where: {
        status: 'pending',
        dueDate: {
          lt: now,
        },
        isActive: true,
      },
      include: {
        room: {
          include: {
            household: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    for (const task of overdueTasks) {
      await this.prisma.choreTemplate.update({
        where: { id: task.id },
        data: { status: 'overdue' },
      });

      // Send notification to all household members
      if (task.room?.household?.members) {
        for (const member of task.room.household.members) {
          await this.notificationService.createNotification({
            userId: member.userId,
            type: 'TASK_OVERDUE',
            priority: 'HIGH',
            title: '⚠️ Tarea Vencida',
            message: `La tarea "${task.title}" en ${task.room.name} está vencida`,
            icon: '🚨',
            actionUrl: `/room/${task.roomId}`,
            metadata: { taskId: task.id, roomId: task.roomId },
          });
        }
      }
    }

    console.log(`Marked ${overdueTasks.length} tasks as overdue`);
  }

  /**
   * Cron job to send reminders for tasks due soon
   * Runs every 6 hours
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async sendDueSoonReminders() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const dueSoonTasks = await this.prisma.choreTemplate.findMany({
      where: {
        status: 'pending',
        dueDate: {
          gte: now,
          lte: tomorrow,
        },
        isActive: true,
      },
      include: {
        room: {
          include: {
            household: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    for (const task of dueSoonTasks) {
      if (task.room?.household?.members) {
        for (const member of task.room.household.members) {
          await this.notificationService.createNotification({
            userId: member.userId,
            type: 'TASK_DUE_SOON',
            priority: 'MEDIUM',
            title: '⏰ Tarea Próxima a Vencer',
            message: `La tarea "${task.title}" en ${task.room.name} vence pronto`,
            icon: '⏰',
            actionUrl: `/room/${task.roomId}`,
            metadata: { taskId: task.id, roomId: task.roomId },
          });
        }
      }
    }

    console.log(`Sent reminders for ${dueSoonTasks.length} tasks due soon`);
  }

  /**
   * Cron job to generate upcoming instances
   * Runs daily at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateUpcomingInstances() {
    const parentTasks = await this.prisma.choreTemplate.findMany({
      where: {
        recurrence: {
          not: 'none',
        },
        isActive: true,
        parentTaskId: null, // Only parent tasks, not instances
      },
    });

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    let totalCreated = 0;

    for (const task of parentTasks) {
      const instances = await this.createRecurrentInstances(task.id, thirtyDaysFromNow);
      totalCreated += instances.length;
    }

    console.log(`Generated ${totalCreated} task instances for the next 30 days`);
  }

  /**
   * Helper: Generate instance dates based on recurrence pattern
   */
  private generateInstanceDates(
    startDate: Date,
    endDate: Date,
    recurrence: 'daily' | 'weekly' | 'monthly',
    recurrenceData?: { interval?: number; daysOfWeek?: number[]; dayOfMonth?: number },
  ): Date[] {
    const dates: Date[] = [];
    const interval = recurrenceData?.interval || 1;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (recurrence === 'daily') {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + interval);
      } else if (recurrence === 'weekly') {
        const daysOfWeek = recurrenceData?.daysOfWeek || [currentDate.getDay()];

        // For each day of the week in the interval
        for (let i = 0; i < 7 * interval; i++) {
          const testDate = new Date(currentDate);
          testDate.setDate(testDate.getDate() + i);

          if (daysOfWeek.includes(testDate.getDay()) && testDate <= endDate) {
            dates.push(new Date(testDate));
          }
        }

        currentDate.setDate(currentDate.getDate() + 7 * interval);
      } else if (recurrence === 'monthly') {
        const dayOfMonth = recurrenceData?.dayOfMonth || currentDate.getDate();
        const nextDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + interval,
          dayOfMonth,
          currentDate.getHours(),
          currentDate.getMinutes(),
        );

        if (nextDate <= endDate) {
          dates.push(new Date(nextDate));
        }

        currentDate = nextDate;
      }
    }

    return dates;
  }

  /**
   * Helper: Calculate due date based on recurrence type
   */
  private calculateDueDate(scheduledAt: Date, recurrence: 'daily' | 'weekly' | 'monthly'): Date {
    const dueDate = new Date(scheduledAt);

    switch (recurrence) {
      case 'daily':
        dueDate.setDate(dueDate.getDate() + 1);
        break;
      case 'weekly':
        dueDate.setDate(dueDate.getDate() + 7);
        break;
      case 'monthly':
        dueDate.setMonth(dueDate.getMonth() + 1);
        break;
    }

    return dueDate;
  }
}
