import { api } from './api';

export type AnnouncementType = 'INFO' | 'URGENT' | 'EVENT' | 'REMINDER' | 'POLL';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
}

export interface AnnouncementReaction {
  id: string;
  announcementId: string;
  userId: string;
  emoji: string;
  createdAt: string;
  user: User;
}

export interface Announcement {
  id: string;
  householdId: string;
  authorId: string;
  title: string;
  content: string;
  type: AnnouncementType;
  isPinned: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  author: User;
  reactions: AnnouncementReaction[];
}

export interface CreateAnnouncementDto {
  householdId: string;
  title: string;
  content: string;
  type?: AnnouncementType;
  isPinned?: boolean;
  expiresAt?: string;
}

export interface UpdateAnnouncementDto {
  title?: string;
  content?: string;
  type?: AnnouncementType;
  isPinned?: boolean;
  expiresAt?: string;
}

export interface ReactAnnouncementDto {
  emoji: string;
}

export interface ReactionSummary {
  [emoji: string]: User[];
}

/**
 * Create a new announcement
 */
export async function createAnnouncement(dto: CreateAnnouncementDto): Promise<Announcement> {
  return api.post<Announcement>('/bulletin', dto);
}

/**
 * Get all announcements for a household
 */
export async function getAnnouncements(householdId: string): Promise<Announcement[]> {
  return api.get<Announcement[]>(`/bulletin/${householdId}`);
}

/**
 * Get a single announcement by ID
 */
export async function getAnnouncement(id: string): Promise<Announcement> {
  return api.get<Announcement>(`/bulletin/announcement/${id}`);
}

/**
 * Update an announcement
 */
export async function updateAnnouncement(id: string, dto: UpdateAnnouncementDto): Promise<Announcement> {
  return api.put<Announcement>(`/bulletin/${id}`, dto);
}

/**
 * Delete an announcement
 */
export async function deleteAnnouncement(id: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/bulletin/${id}`);
}

/**
 * Toggle pin status of an announcement
 */
export async function togglePin(id: string): Promise<Announcement> {
  return api.post<Announcement>(`/bulletin/${id}/pin`, {});
}

/**
 * Toggle reaction on an announcement
 */
export async function toggleReaction(id: string, dto: ReactAnnouncementDto): Promise<{ action: 'added' | 'removed'; emoji: string }> {
  return api.post<{ action: 'added' | 'removed'; emoji: string }>(`/bulletin/${id}/react`, dto);
}

/**
 * Get reaction summary for an announcement
 */
export async function getReactionSummary(id: string): Promise<ReactionSummary> {
  return api.get<ReactionSummary>(`/bulletin/${id}/reactions`);
}
