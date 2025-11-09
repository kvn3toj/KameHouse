import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { HouseholdRole } from '@prisma/client';
import {
  CreateHouseholdDto,
  UpdateHouseholdDto,
  JoinHouseholdDto,
  UpdateMemberDto,
  HouseholdResponse,
  HouseholdMemberResponse,
  LeaderboardEntry,
} from './dto/household.dto';

@Injectable()
export class HouseholdService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new household
   */
  async create(userId: string, dto: CreateHouseholdDto): Promise<HouseholdResponse> {
    // Check if user already owns a household
    const existingHousehold = await this.prisma.household.findFirst({
      where: { ownerId: userId },
    });

    if (existingHousehold) {
      throw new BadRequestException('You already own a household');
    }

    // Create household and add owner as first member
    const household = await this.prisma.household.create({
      data: {
        name: dto.name,
        description: dto.description,
        avatar: dto.avatar,
        maxMembers: dto.maxMembers || 10,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: HouseholdRole.OWNER,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return this.formatHouseholdResponse(household);
  }

  /**
   * Join a household using invite code
   */
  async join(userId: string, dto: JoinHouseholdDto): Promise<HouseholdResponse> {
    const household = await this.prisma.household.findUnique({
      where: { inviteCode: dto.inviteCode },
      include: {
        members: true,
      },
    });

    if (!household) {
      throw new NotFoundException('Household not found');
    }

    if (!household.isActive) {
      throw new BadRequestException('This household is not active');
    }

    // Check if already a member
    const existingMember = household.members.find((m) => m.userId === userId);
    if (existingMember) {
      throw new BadRequestException('You are already a member of this household');
    }

    // Check member limit
    if (household.members.length >= household.maxMembers) {
      throw new BadRequestException('This household is full');
    }

    // Add member
    await this.prisma.householdMember.create({
      data: {
        householdId: household.id,
        userId,
        nickname: dto.nickname,
        role: HouseholdRole.MEMBER,
      },
    });

    return this.findOne(household.id);
  }

  /**
   * Get user's household
   */
  async getUserHousehold(userId: string): Promise<HouseholdResponse | null> {
    const member = await this.prisma.householdMember.findFirst({
      where: { userId },
      include: {
        household: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!member) {
      return null;
    }

    return this.formatHouseholdResponse(member.household);
  }

  /**
   * Get household by ID
   */
  async findOne(householdId: string): Promise<HouseholdResponse> {
    const household = await this.prisma.household.findUnique({
      where: { id: householdId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!household) {
      throw new NotFoundException('Household not found');
    }

    return this.formatHouseholdResponse(household);
  }

  /**
   * Update household
   */
  async update(
    userId: string,
    householdId: string,
    dto: UpdateHouseholdDto,
  ): Promise<HouseholdResponse> {
    const household = await this.prisma.household.findUnique({
      where: { id: householdId },
    });

    if (!household) {
      throw new NotFoundException('Household not found');
    }

    // Check if user has permission
    const member = await this.prisma.householdMember.findFirst({
      where: {
        householdId,
        userId,
        role: { in: [HouseholdRole.OWNER, HouseholdRole.ADMIN] },
      },
    });

    if (!member) {
      throw new ForbiddenException('You do not have permission to update this household');
    }

    const updated = await this.prisma.household.update({
      where: { id: householdId },
      data: dto,
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return this.formatHouseholdResponse(updated);
  }

  /**
   * Leave household
   */
  async leave(userId: string, householdId: string): Promise<void> {
    const member = await this.prisma.householdMember.findFirst({
      where: { householdId, userId },
    });

    if (!member) {
      throw new NotFoundException('You are not a member of this household');
    }

    if (member.role === HouseholdRole.OWNER) {
      throw new BadRequestException('Owner cannot leave the household. Transfer ownership or delete the household.');
    }

    await this.prisma.householdMember.delete({
      where: { id: member.id },
    });
  }

  /**
   * Remove member from household
   */
  async removeMember(
    userId: string,
    householdId: string,
    memberId: string,
  ): Promise<void> {
    const household = await this.prisma.household.findUnique({
      where: { id: householdId },
    });

    if (!household) {
      throw new NotFoundException('Household not found');
    }

    // Check if requester has permission
    const requester = await this.prisma.householdMember.findFirst({
      where: {
        householdId,
        userId,
        role: { in: [HouseholdRole.OWNER, HouseholdRole.ADMIN] },
      },
    });

    if (!requester) {
      throw new ForbiddenException('You do not have permission to remove members');
    }

    const memberToRemove = await this.prisma.householdMember.findFirst({
      where: { householdId, userId: memberId },
    });

    if (!memberToRemove) {
      throw new NotFoundException('Member not found');
    }

    if (memberToRemove.role === HouseholdRole.OWNER) {
      throw new BadRequestException('Cannot remove the owner');
    }

    await this.prisma.householdMember.delete({
      where: { id: memberToRemove.id },
    });
  }

  /**
   * Update member role or nickname
   */
  async updateMember(
    userId: string,
    householdId: string,
    memberId: string,
    dto: UpdateMemberDto,
  ): Promise<HouseholdMemberResponse> {
    // Check if requester has permission
    const requester = await this.prisma.householdMember.findFirst({
      where: {
        householdId,
        userId,
        role: { in: [HouseholdRole.OWNER, HouseholdRole.ADMIN] },
      },
    });

    if (!requester) {
      throw new ForbiddenException('You do not have permission to update members');
    }

    const member = await this.prisma.householdMember.findFirst({
      where: { householdId, userId: memberId },
      include: { user: true },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role === HouseholdRole.OWNER && dto.role) {
      throw new BadRequestException('Cannot change owner role');
    }

    const updated = await this.prisma.householdMember.update({
      where: { id: member.id },
      data: {
        role: dto.role,
        nickname: dto.nickname,
      },
      include: { user: true },
    });

    return this.formatMemberResponse(updated);
  }

  /**
   * Get family leaderboard
   */
  async getLeaderboard(householdId: string): Promise<LeaderboardEntry[]> {
    const household = await this.prisma.household.findUnique({
      where: { id: householdId },
      include: {
        members: {
          include: {
            user: {
              include: {
                habits: true,
              },
            },
          },
        },
      },
    });

    if (!household) {
      throw new NotFoundException('Household not found');
    }

    // Calculate stats for each member
    const entries: LeaderboardEntry[] = await Promise.all(
      household.members.map(async (member) => {
        const habitsCompleted = member.user.habits.reduce(
          (sum, h) => sum + h.totalCompletions,
          0,
        );
        const currentStreak = Math.max(
          ...member.user.habits.map((h) => h.currentStreak),
          0,
        );

        return {
          userId: member.userId,
          username: member.user.username,
          displayName: member.user.displayName,
          avatar: member.user.avatar,
          level: member.user.level,
          xp: member.user.xp,
          gold: member.user.gold,
          contribution: member.contribution,
          habitsCompleted,
          currentStreak,
          rank: 0, // Will be set after sorting
        };
      }),
    );

    // Sort by XP (primary), then contribution (secondary)
    entries.sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      return b.contribution - a.contribution;
    });

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries;
  }

  /**
   * Delete household (owner only)
   */
  async delete(userId: string, householdId: string): Promise<void> {
    const household = await this.prisma.household.findUnique({
      where: { id: householdId },
    });

    if (!household) {
      throw new NotFoundException('Household not found');
    }

    if (household.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can delete the household');
    }

    await this.prisma.household.delete({
      where: { id: householdId },
    });
  }

  /**
   * Format household response
   */
  private formatHouseholdResponse(household: any): HouseholdResponse {
    return {
      id: household.id,
      name: household.name,
      description: household.description,
      avatar: household.avatar,
      inviteCode: household.inviteCode,
      isActive: household.isActive,
      maxMembers: household.maxMembers,
      ownerId: household.ownerId,
      memberCount: household.members.length,
      members: household.members.map(this.formatMemberResponse),
      createdAt: household.createdAt,
      updatedAt: household.updatedAt,
    };
  }

  /**
   * Format member response
   */
  private formatMemberResponse(member: any): HouseholdMemberResponse {
    return {
      id: member.id,
      userId: member.userId,
      username: member.user.username,
      displayName: member.user.displayName,
      avatar: member.user.avatar,
      role: member.role,
      nickname: member.nickname,
      contribution: member.contribution,
      level: member.user.level,
      xp: member.user.xp,
      gold: member.user.gold,
      joinedAt: member.joinedAt,
    };
  }
}
