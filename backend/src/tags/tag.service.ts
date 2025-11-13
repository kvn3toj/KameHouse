import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface CreateTagDto {
  householdId: string;
  name: string;
  color?: string;
}

export interface UpdateTagDto {
  name?: string;
  color?: string;
}

export interface AddTagsToTaskDto {
  tagIds: string[];
}

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new tag
   */
  async create(userId: string, data: CreateTagDto) {
    // Verify user is member of household
    await this.verifyHouseholdMembership(userId, data.householdId);

    // Check if tag with same name already exists in household
    const existing = await this.prisma.tag.findFirst({
      where: {
        householdId: data.householdId,
        name: data.name,
      },
    });

    if (existing) {
      throw new BadRequestException(`Tag "${data.name}" already exists in this household`);
    }

    return this.prisma.tag.create({
      data: {
        householdId: data.householdId,
        name: data.name,
        color: data.color || '#6b7280',
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });
  }

  /**
   * Get all tags for a household
   */
  async findByHousehold(userId: string, householdId: string) {
    // Verify user is member of household
    await this.verifyHouseholdMembership(userId, householdId);

    return this.prisma.tag.findMany({
      where: { householdId },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Get a single tag by ID
   */
  async findOne(userId: string, tagId: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        _count: {
          select: { tasks: true },
        },
        tasks: {
          select: {
            task: {
              select: {
                id: true,
                title: true,
                icon: true,
                status: true,
                dueDate: true,
              },
            },
          },
          take: 20,
        },
      },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${tagId} not found`);
    }

    // Verify user is member of household
    await this.verifyHouseholdMembership(userId, tag.householdId);

    return tag;
  }

  /**
   * Update a tag
   */
  async update(userId: string, tagId: string, data: UpdateTagDto) {
    const tag = await this.prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${tagId} not found`);
    }

    // Verify user is member of household
    await this.verifyHouseholdMembership(userId, tag.householdId);

    // Check for name conflict if updating name
    if (data.name && data.name !== tag.name) {
      const existing = await this.prisma.tag.findFirst({
        where: {
          householdId: tag.householdId,
          name: data.name,
        },
      });

      if (existing) {
        throw new BadRequestException(`Tag "${data.name}" already exists in this household`);
      }
    }

    return this.prisma.tag.update({
      where: { id: tagId },
      data,
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });
  }

  /**
   * Delete a tag
   */
  async delete(userId: string, tagId: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${tagId} not found`);
    }

    // Verify user is member of household
    await this.verifyHouseholdMembership(userId, tag.householdId);

    // Delete will cascade to TaskTag junction table
    return this.prisma.tag.delete({
      where: { id: tagId },
    });
  }

  /**
   * Add tags to a task
   */
  async addTagsToTask(userId: string, taskId: string, data: AddTagsToTaskDto) {
    // Verify task exists and user has access
    const task = await this.prisma.choreTemplate.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    await this.verifyHouseholdMembership(userId, task.householdId);

    // Create TaskTag entries for each tag
    const creates = data.tagIds.map((tagId) =>
      this.prisma.taskTag.upsert({
        where: {
          taskId_tagId: {
            taskId,
            tagId,
          },
        },
        update: {},
        create: {
          taskId,
          tagId,
        },
      })
    );

    await Promise.all(creates);

    // Return updated task with tags
    return this.prisma.choreTemplate.findUnique({
      where: { id: taskId },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  /**
   * Remove tags from a task
   */
  async removeTagsFromTask(userId: string, taskId: string, data: AddTagsToTaskDto) {
    // Verify task exists and user has access
    const task = await this.prisma.choreTemplate.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    await this.verifyHouseholdMembership(userId, task.householdId);

    // Delete TaskTag entries
    await this.prisma.taskTag.deleteMany({
      where: {
        taskId,
        tagId: {
          in: data.tagIds,
        },
      },
    });

    // Return updated task with tags
    return this.prisma.choreTemplate.findUnique({
      where: { id: taskId },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  /**
   * Get tasks by tag
   */
  async getTasksByTag(userId: string, tagId: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${tagId} not found`);
    }

    await this.verifyHouseholdMembership(userId, tag.householdId);

    return this.prisma.choreTemplate.findMany({
      where: {
        tags: {
          some: {
            tagId,
          },
        },
        isActive: true,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
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
