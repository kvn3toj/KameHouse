/**
 * Notifications API - PocketBase Implementation
 * PHOENIX-12 Phase 2B: Migrated from legacy localhost:3000 to PocketBase
 *
 * Collections used:
 * - notifications: User notifications
 * - notification_preferences: User notification settings
 * - push_subscriptions: Push notification subscriptions
 */

import { pb } from './pocketbase';
import type {
  Notification,
  NotificationPreferences,
  CreateNotificationDto,
  UpdatePreferencesDto,
  CreatePushSubscriptionDto,
  PushSubscription as PushSubscriptionType,
} from '@/types/notification';

// ============================================
// NOTIFICATIONS CRUD
// ============================================

export const notificationsApi = {
  /**
   * Get all notifications for current user
   */
  async getNotifications(limit: number = 50): Promise<Notification[]> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('User not authenticated');

    const result = await pb.collection('notifications').getList<Notification>(1, limit, {
      filter: `user = "${userId}"`,
      sort: '-created',
    });
    return result.items;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('User not authenticated');

    const result = await pb.collection('notifications').getList<Notification>(1, 1, {
      filter: `user = "${userId}" && isRead = false`,
    });
    return result.totalItems;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    return await pb.collection('notifications').update<Notification>(notificationId, {
      isRead: true,
      readAt: new Date().toISOString(),
    });
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('User not authenticated');

    // Get all unread notifications
    const unreadNotifications = await pb.collection('notifications').getFullList<Notification>({
      filter: `user = "${userId}" && isRead = false`,
    });

    // Update each notification
    const updatePromises = unreadNotifications.map(notification =>
      pb.collection('notifications').update(notification.id, {
        isRead: true,
        readAt: new Date().toISOString(),
      })
    );

    await Promise.all(updatePromises);
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await pb.collection('notifications').delete(notificationId);
  },

  /**
   * Delete all read notifications
   */
  async deleteAllRead(): Promise<void> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('User not authenticated');

    // Get all read notifications
    const readNotifications = await pb.collection('notifications').getFullList<Notification>({
      filter: `user = "${userId}" && isRead = true`,
    });

    // Delete each notification
    const deletePromises = readNotifications.map(notification =>
      pb.collection('notifications').delete(notification.id)
    );

    await Promise.all(deletePromises);
  },

  /**
   * Create a notification (typically called by backend services, but available for testing)
   */
  async createNotification(data: CreateNotificationDto): Promise<Notification> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('User not authenticated');

    return await pb.collection('notifications').create<Notification>({
      user: userId,
      type: data.type,
      priority: data.priority,
      title: data.title,
      message: data.message,
      icon: data.icon || '🔔',
      actionUrl: data.actionUrl,
      metadata: data.metadata,
      isRead: false,
      expiresAt: data.expiresAt,
    });
  },

  // ============================================
  // NOTIFICATION PREFERENCES
  // ============================================

  /**
   * Get notification preferences for current user
   */
  async getPreferences(): Promise<NotificationPreferences> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('User not authenticated');

    try {
      // Try to find existing preferences
      const result = await pb.collection('notification_preferences').getList<NotificationPreferences>(1, 1, {
        filter: `user = "${userId}"`,
      });

      if (result.items.length > 0) {
        return result.items[0];
      }

      // Create default preferences if none exist
      return await pb.collection('notification_preferences').create<NotificationPreferences>({
        user: userId,
        enableEmail: false,
        enablePush: true,
        enableInApp: true,
        taskAssignments: true,
        taskReminders: true,
        taskCompletions: true,
        choreRotations: true,
        favorRequests: true,
        achievements: true,
        announcements: true,
        enableQuietHours: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        enableDailyDigest: false,
        digestTime: '09:00',
      });
    } catch (error) {
      console.error('Error getting preferences:', error);
      throw error;
    }
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: UpdatePreferencesDto): Promise<NotificationPreferences> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('User not authenticated');

    // Get existing preferences first
    const existing = await this.getPreferences();

    return await pb.collection('notification_preferences').update<NotificationPreferences>(
      existing.id,
      preferences
    );
  },

  // ============================================
  // PUSH NOTIFICATIONS
  // ============================================

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(subscription: PushSubscription): Promise<void> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('User not authenticated');

    // Convert PushSubscription to our format
    const subscriptionJson = subscription.toJSON();

    // Check if subscription already exists
    const existing = await pb.collection('push_subscriptions').getList<PushSubscriptionType>(1, 1, {
      filter: `user = "${userId}" && endpoint = "${subscription.endpoint}"`,
    });

    if (existing.items.length > 0) {
      // Update existing subscription
      await pb.collection('push_subscriptions').update(existing.items[0].id, {
        p256dh: subscriptionJson.keys?.p256dh || '',
        auth: subscriptionJson.keys?.auth || '',
        isActive: true,
      });
    } else {
      // Create new subscription
      await pb.collection('push_subscriptions').create<PushSubscriptionType>({
        user: userId,
        endpoint: subscription.endpoint,
        p256dh: subscriptionJson.keys?.p256dh || '',
        auth: subscriptionJson.keys?.auth || '',
        deviceName: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop',
        userAgent: navigator.userAgent,
        isActive: true,
      });
    }
  },

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(endpoint: string): Promise<void> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('User not authenticated');

    // Find the subscription
    const result = await pb.collection('push_subscriptions').getList<PushSubscriptionType>(1, 1, {
      filter: `user = "${userId}" && endpoint = "${endpoint}"`,
    });

    if (result.items.length > 0) {
      // Mark as inactive instead of deleting
      await pb.collection('push_subscriptions').update(result.items[0].id, {
        isActive: false,
      });
    }
  },
};

// Re-export types for convenience
export type { Notification, NotificationPreferences };
