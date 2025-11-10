import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateChoreTemplateDto } from './dto/create-chore-template.dto';
import { CompleteChoreDto } from './dto/complete-chore.dto';
import { SwapChoreDto } from './dto/swap-chore.dto';

@Injectable()
export class ChoresService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new chore template for a household
   */
  async createTemplate(dto: CreateChoreTemplateDto) {
    // Verify household exists
    const household = await this.prisma.household.findUnique({
      where: { id: dto.householdId },
    });

    if (!household) {
      throw new NotFoundException('Household not found');
    }

    return this.prisma.choreTemplate.create({
      data: {
        householdId: dto.householdId,
        title: dto.title,
        description: dto.description,
        icon: dto.icon || '🧹',
        difficulty: dto.difficulty || 1,
        estimatedTime: dto.estimatedTime,
        xpReward: dto.xpReward || 20,
        goldReward: dto.goldReward || 10,
        letsCredit: dto.letsCredit || 5,
        frequency: dto.frequency || 'WEEKLY',
        photoRequired: dto.photoRequired || false,
      },
    });
  }

  /**
   * Get all chore templates for a household
   */
  async getTemplates(householdId: string) {
    return this.prisma.choreTemplate.findMany({
      where: {
        householdId,
        isActive: true,
      },
      include: {
        assignments: {
          where: {
            weekStarting: this.getWeekStart(),
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
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Auto-assign chores for the current week
   * Rotates assignments based on last week's assignments
   */
  async assignChoresForWeek(householdId: string) {
    const weekStart = this.getWeekStart();

    // Get all active templates
    const templates = await this.prisma.choreTemplate.findMany({
      where: {
        householdId,
        isActive: true,
      },
    });

    // Get household members
    const members = await this.prisma.householdMember.findMany({
      where: { householdId },
      select: { userId: true },
    });

    if (members.length === 0) {
      throw new BadRequestException('Household has no members');
    }

    const memberIds = members.map((m) => m.userId);

    // Check if already assigned for this week
    const existingAssignments = await this.prisma.choreAssignment.findMany({
      where: {
        weekStarting: weekStart,
        chore: {
          householdId,
        },
      },
    });

    if (existingAssignments.length > 0) {
      return { message: 'Chores already assigned for this week', assignments: existingAssignments };
    }

    // Get last week's assignments for rotation
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const lastWeekAssignments = await this.prisma.choreAssignment.findMany({
      where: {
        weekStarting: lastWeekStart,
        chore: {
          householdId,
        },
      },
      select: {
        choreId: true,
        assignedTo: true,
      },
    });

    // Create assignment map for rotation
    const lastAssignmentMap = new Map<string, string>();
    lastWeekAssignments.forEach((a) => {
      lastAssignmentMap.set(a.choreId, a.assignedTo);
    });

    // Assign chores with rotation
    const assignments = [];
    for (const template of templates) {
      const lastAssignedUser = lastAssignmentMap.get(template.id);

      // Rotate to next member
      let assignedUserId: string;
      if (lastAssignedUser) {
        const currentIndex = memberIds.indexOf(lastAssignedUser);
        const nextIndex = (currentIndex + 1) % memberIds.length;
        assignedUserId = memberIds[nextIndex];
      } else {
        // First time assignment - use first member
        assignedUserId = memberIds[0];
      }

      const assignment = await this.prisma.choreAssignment.create({
        data: {
          choreId: template.id,
          assignedTo: assignedUserId,
          weekStarting: weekStart,
        },
        include: {
          chore: true,
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

      assignments.push(assignment);
    }

    return { message: 'Chores assigned successfully', assignments };
  }

  /**
   * Get chores assigned to a user for the current week
   */
  async getMyChores(userId: string) {
    const weekStart = this.getWeekStart();

    return this.prisma.choreAssignment.findMany({
      where: {
        assignedTo: userId,
        weekStarting: weekStart,
      },
      include: {
        chore: true,
      },
      orderBy: {
        isCompleted: 'asc',
      },
    });
  }

  /**
   * Complete a chore and award rewards
   */
  async completeChore(assignmentId: string, userId: string, dto: CompleteChoreDto) {
    const assignment = await this.prisma.choreAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        chore: true,
        user: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Chore assignment not found');
    }

    if (assignment.assignedTo !== userId) {
      throw new BadRequestException('You can only complete your own chores');
    }

    if (assignment.isCompleted) {
      throw new BadRequestException('Chore already completed');
    }

    // Check photo requirement
    if (assignment.chore.photoRequired && !dto.photoUrl) {
      throw new BadRequestException('Photo is required for this chore');
    }

    // Update assignment
    const completed = await this.prisma.choreAssignment.update({
      where: { id: assignmentId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        photoUrl: dto.photoUrl,
        notes: dto.notes,
      },
      include: {
        chore: true,
      },
    });

    // Award rewards to user
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        xp: {
          increment: assignment.chore.xpReward,
        },
        gold: {
          increment: assignment.chore.goldReward,
        },
      },
    });

    // Update household member contribution (LETS credits)
    const householdMember = await this.prisma.householdMember.findFirst({
      where: {
        userId,
        householdId: assignment.chore.householdId,
      },
    });

    if (householdMember) {
      await this.prisma.householdMember.update({
        where: { id: householdMember.id },
        data: {
          contribution: {
            increment: assignment.chore.letsCredit,
          },
        },
      });
    }

    return {
      assignment: completed,
      rewards: {
        xp: assignment.chore.xpReward,
        gold: assignment.chore.goldReward,
        letsCredit: assignment.chore.letsCredit,
      },
    };
  }

  /**
   * Request to swap chore with another user
   */
  async requestSwap(assignmentId: string, userId: string, dto: SwapChoreDto) {
    const assignment = await this.prisma.choreAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        chore: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Chore assignment not found');
    }

    if (assignment.assignedTo !== userId) {
      throw new BadRequestException('You can only swap your own chores');
    }

    if (assignment.isCompleted) {
      throw new BadRequestException('Cannot swap completed chores');
    }

    // Verify target user is in the same household
    const targetMember = await this.prisma.householdMember.findFirst({
      where: {
        userId: dto.targetUserId,
        householdId: assignment.chore.householdId,
      },
    });

    if (!targetMember) {
      throw new BadRequestException('Target user is not in this household');
    }

    // Mark as swap requested
    return this.prisma.choreAssignment.update({
      where: { id: assignmentId },
      data: {
        swapRequested: true,
        swappedWith: dto.targetUserId,
      },
      include: {
        chore: true,
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
   * Get the start of the current week (Monday)
   */
  private getWeekStart(): Date {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }
}
