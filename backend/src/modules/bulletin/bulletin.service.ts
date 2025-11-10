import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { ReactAnnouncementDto } from './dto/react-announcement.dto';

@Injectable()
export class BulletinService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new announcement
   */
  async create(userId: string, dto: CreateAnnouncementDto) {
    // Verify user is in household
    const member = await this.prisma.householdMember.findFirst({
      where: {
        userId,
        householdId: dto.householdId,
      },
    });

    if (!member) {
      throw new ForbiddenException('You must be a household member to post announcements');
    }

    return this.prisma.announcement.create({
      data: {
        householdId: dto.householdId,
        authorId: userId,
        title: dto.title,
        content: dto.content,
        type: dto.type || 'INFO',
        isPinned: dto.isPinned || false,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        reactions: {
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
    });
  }

  /**
   * Get all announcements for a household
   */
  async findAll(householdId: string) {
    const now = new Date();

    return this.prisma.announcement.findMany({
      where: {
        householdId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Get a single announcement by ID
   */
  async findOne(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        reactions: {
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
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    return announcement;
  }

  /**
   * Update an announcement
   */
  async update(id: string, userId: string, dto: UpdateAnnouncementDto) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    // Only author can update
    if (announcement.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own announcements');
    }

    return this.prisma.announcement.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        type: dto.type,
        isPinned: dto.isPinned,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        reactions: {
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
    });
  }

  /**
   * Delete an announcement
   */
  async remove(id: string, userId: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    // Only author can delete
    if (announcement.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own announcements');
    }

    await this.prisma.announcement.delete({
      where: { id },
    });

    return { message: 'Announcement deleted successfully' };
  }

  /**
   * Toggle pin status
   */
  async togglePin(id: string, userId: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    // Only author can pin/unpin
    if (announcement.authorId !== userId) {
      throw new ForbiddenException('You can only pin your own announcements');
    }

    return this.prisma.announcement.update({
      where: { id },
      data: {
        isPinned: !announcement.isPinned,
      },
      include: {
        author: {
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
   * Add or remove reaction to announcement
   */
  async toggleReaction(announcementId: string, userId: string, dto: ReactAnnouncementDto) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    // Check if reaction already exists
    const existingReaction = await this.prisma.announcementReaction.findUnique({
      where: {
        announcementId_userId_emoji: {
          announcementId,
          userId,
          emoji: dto.emoji,
        },
      },
    });

    if (existingReaction) {
      // Remove reaction
      await this.prisma.announcementReaction.delete({
        where: { id: existingReaction.id },
      });

      return { action: 'removed', emoji: dto.emoji };
    } else {
      // Add reaction
      await this.prisma.announcementReaction.create({
        data: {
          announcementId,
          userId,
          emoji: dto.emoji,
        },
      });

      return { action: 'added', emoji: dto.emoji };
    }
  }

  /**
   * Get reaction summary for an announcement
   */
  async getReactionSummary(announcementId: string) {
    const reactions = await this.prisma.announcementReaction.findMany({
      where: { announcementId },
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

    // Group by emoji
    const summary = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction.user);
      return acc;
    }, {} as Record<string, any[]>);

    return summary;
  }
}
