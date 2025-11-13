import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RoomType } from '@prisma/client';

export interface CreateTemplateDto {
  name: string;
  description?: string;
  roomType: RoomType;
  icon?: string;
  config: {
    room: {
      name: string;
      description?: string;
      icon?: string;
    };
    tasks: Array<{
      title: string;
      description?: string;
      icon?: string;
      difficulty?: number;
      estimatedTime?: number;
      xpReward?: number;
      goldReward?: number;
      frequency?: string;
      categoryId?: string;
      tags?: string[];
    }>;
  };
  isPublic?: boolean;
}

export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  icon?: string;
  config?: any;
  isPublic?: boolean;
}

@Injectable()
export class RoomTemplateService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new room template
   */
  async create(userId: string, data: CreateTemplateDto) {
    return this.prisma.roomTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        roomType: data.roomType,
        icon: data.icon || '🏠',
        config: data.config,
        isPublic: data.isPublic || false,
        createdBy: userId,
      },
      include: {
        creator: {
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
   * Get all templates (system + public + user's private)
   */
  async findAll(userId: string, roomType?: RoomType) {
    const where: any = {
      OR: [
        { isSystemTemplate: true },
        { isPublic: true },
        { createdBy: userId },
      ],
    };

    if (roomType) {
      where.roomType = roomType;
    }

    return this.prisma.roomTemplate.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
      orderBy: [
        { isSystemTemplate: 'desc' },
        { useCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Get a single template
   */
  async findOne(userId: string, templateId: string) {
    const template = await this.prisma.roomTemplate.findUnique({
      where: { id: templateId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    // Check access permissions
    if (!template.isSystemTemplate && !template.isPublic && template.createdBy !== userId) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    return template;
  }

  /**
   * Update a template (only creator can update)
   */
  async update(userId: string, templateId: string, data: UpdateTemplateDto) {
    const template = await this.prisma.roomTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    if (template.isSystemTemplate) {
      throw new BadRequestException('Cannot modify system templates');
    }

    if (template.createdBy !== userId) {
      throw new BadRequestException('You can only modify your own templates');
    }

    return this.prisma.roomTemplate.update({
      where: { id: templateId },
      data,
      include: {
        creator: {
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
   * Delete a template (only creator can delete)
   */
  async delete(userId: string, templateId: string) {
    const template = await this.prisma.roomTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    if (template.isSystemTemplate) {
      throw new BadRequestException('Cannot delete system templates');
    }

    if (template.createdBy !== userId) {
      throw new BadRequestException('You can only delete your own templates');
    }

    return this.prisma.roomTemplate.delete({
      where: { id: templateId },
    });
  }

  /**
   * Apply a template to create a new room
   */
  async applyTemplate(userId: string, templateId: string, householdId: string) {
    // Verify user is member of household
    const member = await this.prisma.householdMember.findFirst({
      where: {
        userId,
        householdId,
      },
    });

    if (!member) {
      throw new BadRequestException('You are not a member of this household');
    }

    // Get the template
    const template = await this.findOne(userId, templateId);

    const config = template.config as any;

    // Create the room
    const room = await this.prisma.room.create({
      data: {
        householdId,
        name: config.room.name,
        description: config.room.description,
        type: template.roomType,
        icon: config.room.icon || template.icon,
        order: 0, // Will be adjusted by the client
      },
    });

    // Create tasks from template
    if (config.tasks && config.tasks.length > 0) {
      const taskCreates = config.tasks.map((task: any) =>
        this.prisma.choreTemplate.create({
          data: {
            householdId,
            roomId: room.id,
            title: task.title,
            description: task.description,
            icon: task.icon,
            difficulty: task.difficulty || 1,
            estimatedTime: task.estimatedTime,
            xpReward: task.xpReward || 20,
            goldReward: task.goldReward || 10,
            frequency: task.frequency || 'WEEKLY',
            categoryId: task.categoryId,
          },
        })
      );

      await Promise.all(taskCreates);
    }

    // Increment template use count
    await this.prisma.roomTemplate.update({
      where: { id: templateId },
      data: {
        useCount: {
          increment: 1,
        },
      },
    });

    // Return the created room with tasks
    return this.prisma.room.findUnique({
      where: { id: room.id },
      include: {
        choreTemplates: {
          include: {
            category: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Save current room as template
   */
  async saveRoomAsTemplate(userId: string, roomId: string, templateData: { name: string; description?: string; isPublic?: boolean }) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        choreTemplates: {
          where: { isActive: true },
          include: {
            category: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    // Verify user is member of household
    const member = await this.prisma.householdMember.findFirst({
      where: {
        userId,
        householdId: room.householdId,
      },
    });

    if (!member) {
      throw new BadRequestException('You are not a member of this household');
    }

    // Build template config
    const config = {
      room: {
        name: room.name,
        description: room.description,
        icon: room.icon,
      },
      tasks: room.choreTemplates.map((task) => ({
        title: task.title,
        description: task.description,
        icon: task.icon,
        difficulty: task.difficulty,
        estimatedTime: task.estimatedTime,
        xpReward: task.xpReward,
        goldReward: task.goldReward,
        frequency: task.frequency,
        categoryId: task.categoryId,
        tags: task.tags.map((t) => t.tag.name),
      })),
    };

    return this.create(userId, {
      name: templateData.name,
      description: templateData.description,
      roomType: room.type,
      icon: room.icon,
      config,
      isPublic: templateData.isPublic || false,
    });
  }
}
