import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateRoomDto) {
    // Verify user is member of household
    const member = await this.prisma.householdMember.findFirst({
      where: {
        householdId: dto.householdId,
        userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this household');
    }

    const room = await this.prisma.room.create({
      data: {
        householdId: dto.householdId,
        name: dto.name,
        type: dto.type || 'CUSTOM',
        icon: dto.icon || '🏠',
        description: dto.description,
        order: dto.order || 0,
      },
    });

    return room;
  }

  async findByHousehold(householdId: string) {
    const rooms = await this.prisma.room.findMany({
      where: { householdId, isActive: true },
      orderBy: { order: 'asc' },
      include: {
        choreTemplates: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            icon: true,
            difficulty: true,
            xpReward: true,
          },
        },
        _count: {
          select: {
            choreTemplates: true,
          },
        },
      },
    });

    return rooms;
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        choreTemplates: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        household: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async getTasksWithProgress(roomId: string) {
    const room = await this.findOne(roomId);

    // Get all chore templates for this room
    const chores = await this.prisma.choreTemplate.findMany({
      where: {
        roomId,
        isActive: true,
      },
      include: {
        assignments: {
          where: {
            weekStarting: {
              gte: new Date(new Date().setDate(new Date().getDate() - 7)),
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    const totalChores = chores.length;
    const completedChores = chores.filter((chore) =>
      chore.assignments.some((a) => a.isCompleted)
    ).length;

    return {
      room,
      chores,
      progress: {
        total: totalChores,
        completed: completedChores,
        percentage: totalChores > 0 ? Math.round((completedChores / totalChores) * 100) : 0,
      },
    };
  }

  async update(id: string, userId: string, dto: UpdateRoomDto) {
    const room = await this.findOne(id);

    // Verify user is member of household
    const member = await this.prisma.householdMember.findFirst({
      where: {
        householdId: room.householdId,
        userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this household');
    }

    return this.prisma.room.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const room = await this.findOne(id);

    // Verify user is admin or owner of household
    const member = await this.prisma.householdMember.findFirst({
      where: {
        householdId: room.householdId,
        userId,
        role: {
          in: ['ADMIN', 'OWNER'],
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You do not have permission to delete rooms');
    }

    // Soft delete by marking as inactive
    return this.prisma.room.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getTaskPresets() {
    const presets = await this.prisma.taskPreset.findMany({
      where: {
        isSystemPreset: true,
      },
      orderBy: [{ roomType: 'asc' }, { category: 'asc' }, { title: 'asc' }],
    });

    // Group by room type
    const groupedPresets = presets.reduce((acc, preset) => {
      if (!acc[preset.roomType]) {
        acc[preset.roomType] = [];
      }
      acc[preset.roomType].push(preset);
      return acc;
    }, {} as Record<string, typeof presets>);

    return groupedPresets;
  }

  async getTaskPresetsByRoomType(roomType: string) {
    return this.prisma.taskPreset.findMany({
      where: {
        roomType: roomType as any,
        isSystemPreset: true,
      },
      orderBy: [{ category: 'asc' }, { title: 'asc' }],
    });
  }

  async createTaskFromPreset(roomId: string, presetId: string, userId: string) {
    // Get room to verify ownership
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        household: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.household.members.length === 0) {
      throw new ForbiddenException('You do not have permission to add tasks to this room');
    }

    // Get preset
    const preset = await this.prisma.taskPreset.findUnique({
      where: { id: presetId },
    });

    if (!preset) {
      throw new NotFoundException('Task preset not found');
    }

    // Create ChoreTemplate from preset
    const choreTemplate = await this.prisma.choreTemplate.create({
      data: {
        householdId: room.householdId,
        roomId: roomId, // Link to the room
        title: preset.title,
        description: preset.description || '',
        icon: preset.icon,
        difficulty: preset.difficulty,
        estimatedTime: preset.estimatedMinutes,
        xpReward: preset.xpReward,
        goldReward: preset.goldReward,
        letsCredit: 0,
        frequency: preset.frequency as any,
        photoRequired: false,
        isActive: true,
      },
    });

    return choreTemplate;
  }

  async getRoomTasks(roomId: string) {
    const room = await this.findOne(roomId);

    const tasks = await this.prisma.choreTemplate.findMany({
      where: {
        roomId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tasks;
  }

  async updateTask(taskId: string, userId: string, data: any) {
    // Get task and verify permissions
    const task = await this.prisma.choreTemplate.findUnique({
      where: { id: taskId },
      include: {
        household: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.household.members.length === 0) {
      throw new ForbiddenException('You do not have permission to update this task');
    }

    return this.prisma.choreTemplate.update({
      where: { id: taskId },
      data,
    });
  }

  async deleteTask(taskId: string, userId: string) {
    // Get task and verify permissions
    const task = await this.prisma.choreTemplate.findUnique({
      where: { id: taskId },
      include: {
        household: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.household.members.length === 0) {
      throw new ForbiddenException('You do not have permission to delete this task');
    }

    // Soft delete by marking as inactive
    return this.prisma.choreTemplate.update({
      where: { id: taskId },
      data: { isActive: false },
    });
  }

  async createCustomTask(roomId: string, userId: string, data: any) {
    // Get room to verify ownership
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        household: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.household.members.length === 0) {
      throw new ForbiddenException('You do not have permission to add tasks to this room');
    }

    // Create custom ChoreTemplate
    const task = await this.prisma.choreTemplate.create({
      data: {
        householdId: room.householdId,
        roomId: roomId,
        title: data.title,
        description: data.description || '',
        icon: data.icon || '🧹',
        difficulty: data.difficulty || 1,
        estimatedTime: data.estimatedMinutes || 30,
        xpReward: data.xpReward || 20,
        goldReward: data.goldReward || 10,
        letsCredit: 0,
        frequency: data.frequency || 'WEEKLY',
        photoRequired: data.photoRequired || false,
        isActive: true,
      },
    });

    return task;
  }

  /**
   * Get comprehensive room analytics
   */
  async getRoomAnalytics(roomId: string, userId: string) {
    const room = await this.findOne(roomId);

    // Verify user is member of household
    const member = await this.prisma.householdMember.findFirst({
      where: {
        householdId: room.householdId,
        userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this household');
    }

    // Get all tasks for this room
    const tasks = await this.prisma.choreTemplate.findMany({
      where: {
        roomId,
        isActive: true,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Task completion stats (would need actual completion records)
    const totalTasks = tasks.length;
    const tasksByCategory = tasks.reduce((acc, task) => {
      const categoryName = task.category?.name || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tasksByDifficulty = tasks.reduce((acc, task) => {
      acc[task.difficulty] = (acc[task.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const avgDifficulty = tasks.length > 0
      ? tasks.reduce((sum, task) => sum + task.difficulty, 0) / tasks.length
      : 0;

    const totalXpRewards = tasks.reduce((sum, task) => sum + task.xpReward, 0);
    const totalGoldRewards = tasks.reduce((sum, task) => sum + task.goldReward, 0);

    // Tag distribution
    const tagDistribution = tasks.reduce((acc, task) => {
      task.tags.forEach((taskTag) => {
        acc[taskTag.tag.name] = (acc[taskTag.tag.name] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return {
      roomId: room.id,
      roomName: room.name,
      roomType: room.type,
      overview: {
        totalTasks,
        avgDifficulty: parseFloat(avgDifficulty.toFixed(2)),
        totalXpRewards,
        totalGoldRewards,
      },
      distribution: {
        byCategory: tasksByCategory,
        byDifficulty: tasksByDifficulty,
        byTag: tagDistribution,
      },
      roomStats: {
        level: room.level,
        xp: room.xp,
      },
    };
  }

  /**
   * Get household-wide room analytics
   */
  async getHouseholdRoomAnalytics(householdId: string, userId: string) {
    // Verify user is member of household
    const member = await this.prisma.householdMember.findFirst({
      where: {
        householdId,
        userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this household');
    }

    const rooms = await this.prisma.room.findMany({
      where: {
        householdId,
        isActive: true,
      },
      include: {
        choreTemplates: {
          where: { isActive: true },
        },
      },
    });

    const totalRooms = rooms.length;
    const totalTasks = rooms.reduce((sum, room) => sum + room.choreTemplates.length, 0);

    const roomsByType = rooms.reduce((acc, room) => {
      acc[room.type] = (acc[room.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tasksByRoom = rooms.map((room) => ({
      roomId: room.id,
      roomName: room.name,
      roomType: room.type,
      taskCount: room.choreTemplates.length,
      roomLevel: room.level,
      roomXp: room.xp,
    }));

    const avgTasksPerRoom = totalRooms > 0 ? totalTasks / totalRooms : 0;

    return {
      householdId,
      overview: {
        totalRooms,
        totalTasks,
        avgTasksPerRoom: parseFloat(avgTasksPerRoom.toFixed(2)),
      },
      distribution: {
        roomsByType,
        tasksByRoom,
      },
    };
  }

  /**
   * Archive a room (soft delete with archival flag)
   */
  async archiveRoom(roomId: string, userId: string) {
    const room = await this.findOne(roomId);

    // Verify user is admin or owner of household
    const member = await this.prisma.householdMember.findFirst({
      where: {
        householdId: room.householdId,
        userId,
        role: {
          in: ['ADMIN', 'OWNER'],
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You do not have permission to archive rooms');
    }

    return this.prisma.room.update({
      where: { id: roomId },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Restore an archived room
   */
  async restoreRoom(roomId: string, userId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        household: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Verify user is admin or owner of household
    const member = await this.prisma.householdMember.findFirst({
      where: {
        householdId: room.householdId,
        userId,
        role: {
          in: ['ADMIN', 'OWNER'],
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You do not have permission to restore rooms');
    }

    return this.prisma.room.update({
      where: { id: roomId },
      data: {
        isActive: true,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Get archived rooms for a household
   */
  async getArchivedRooms(householdId: string, userId: string) {
    // Verify user is member of household
    const member = await this.prisma.householdMember.findFirst({
      where: {
        householdId,
        userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this household');
    }

    return this.prisma.room.findMany({
      where: {
        householdId,
        isActive: false,
      },
      include: {
        _count: {
          select: {
            choreTemplates: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }
}
