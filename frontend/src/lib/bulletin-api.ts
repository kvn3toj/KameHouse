/**
 * Bulletin API - PocketBase Implementation
 * PHOENIX-12 Phase 2E: Migrated from legacy localhost:3000 to PocketBase
 *
 * Collections used:
 * - announcements: Household announcements/bulletin posts
 * - announcement_reactions: Emoji reactions to announcements
 */

import { pb } from './pocketbase';
import type {
  Announcement,
  ExpandedAnnouncement,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  AnnouncementReaction,
  ExpandedAnnouncementReaction,
  ReactAnnouncementDto,
  ToggleReactionResponse,
  ReactionSummary,
  User,
} from '@/types/bulletin';

// ============================================
// ANNOUNCEMENTS
// ============================================

/**
 * Create a new announcement
 */
export async function createAnnouncement(dto: CreateAnnouncementDto): Promise<Announcement> {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('User not authenticated');

  return await pb.collection('announcements').create<Announcement>({
    household: dto.household,
    author: userId,
    title: dto.title,
    content: dto.content,
    type: dto.type || 'INFO',
    isPinned: dto.isPinned ?? false,
    expiresAt: dto.expiresAt,
  });
}

/**
 * Get all announcements for a household
 * Returns announcements with expanded author data
 */
export async function getAnnouncements(householdId: string): Promise<ExpandedAnnouncement[]> {
  const result = await pb.collection('announcements').getList<ExpandedAnnouncement>(1, 100, {
    filter: `household = "${householdId}"`,
    sort: '-isPinned,-created', // Pinned first, then newest
    expand: 'author',
  });

  // Fetch reactions for each announcement
  const announcementsWithReactions = await Promise.all(
    result.items.map(async (announcement) => {
      const reactions = await pb
        .collection('announcement_reactions')
        .getFullList<ExpandedAnnouncementReaction>({
          filter: `announcement = "${announcement.id}"`,
          expand: 'user',
        });

      return {
        ...announcement,
        reactions,
      };
    })
  );

  return announcementsWithReactions;
}

/**
 * Get a single announcement by ID
 */
export async function getAnnouncement(id: string): Promise<ExpandedAnnouncement> {
  const announcement = await pb.collection('announcements').getOne<ExpandedAnnouncement>(id, {
    expand: 'author',
  });

  // Fetch reactions
  const reactions = await pb
    .collection('announcement_reactions')
    .getFullList<ExpandedAnnouncementReaction>({
      filter: `announcement = "${id}"`,
      expand: 'user',
    });

  return {
    ...announcement,
    reactions,
  };
}

/**
 * Update an announcement
 */
export async function updateAnnouncement(
  id: string,
  dto: UpdateAnnouncementDto
): Promise<Announcement> {
  return await pb.collection('announcements').update<Announcement>(id, dto);
}

/**
 * Delete an announcement
 */
export async function deleteAnnouncement(id: string): Promise<{ message: string }> {
  await pb.collection('announcements').delete(id);
  return { message: 'Announcement deleted successfully' };
}

/**
 * Toggle pin status of an announcement
 */
export async function togglePin(id: string): Promise<Announcement> {
  const announcement = await pb.collection('announcements').getOne<Announcement>(id);
  return await pb.collection('announcements').update<Announcement>(id, {
    isPinned: !announcement.isPinned,
  });
}

// ============================================
// REACTIONS
// ============================================

/**
 * Toggle reaction on an announcement
 * If the user has already reacted with this emoji, remove it
 * Otherwise, add the reaction
 */
export async function toggleReaction(
  id: string,
  dto: ReactAnnouncementDto
): Promise<ToggleReactionResponse> {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('User not authenticated');

  // Check if the user already reacted with this emoji
  const existingReactions = await pb
    .collection('announcement_reactions')
    .getFullList<AnnouncementReaction>({
      filter: `announcement = "${id}" && user = "${userId}" && emoji = "${dto.emoji}"`,
    });

  if (existingReactions.length > 0) {
    // Remove the reaction
    await pb.collection('announcement_reactions').delete(existingReactions[0].id);
    return {
      action: 'removed',
      emoji: dto.emoji,
    };
  } else {
    // Add the reaction
    await pb.collection('announcement_reactions').create<AnnouncementReaction>({
      announcement: id,
      user: userId,
      emoji: dto.emoji,
    });
    return {
      action: 'added',
      emoji: dto.emoji,
    };
  }
}

/**
 * Get reaction summary for an announcement
 * Returns reactions grouped by emoji with user details
 */
export async function getReactionSummary(id: string): Promise<ReactionSummary> {
  const reactions = await pb
    .collection('announcement_reactions')
    .getFullList<ExpandedAnnouncementReaction>({
      filter: `announcement = "${id}"`,
      expand: 'user',
    });

  // Group reactions by emoji
  const summary: ReactionSummary = {};

  for (const reaction of reactions) {
    if (!summary[reaction.emoji]) {
      summary[reaction.emoji] = [];
    }

    // Extract user data from expanded relation
    const user: User = {
      id: reaction.user,
      username: reaction.expand?.user?.username || 'Unknown',
      displayName: reaction.expand?.user?.displayName || 'Unknown',
      avatar: reaction.expand?.user?.avatar,
    };

    summary[reaction.emoji].push(user);
  }

  return summary;
}

// Re-export types for convenience
export type {
  Announcement,
  ExpandedAnnouncement,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  AnnouncementReaction,
  ReactAnnouncementDto,
  ReactionSummary,
  User,
};
