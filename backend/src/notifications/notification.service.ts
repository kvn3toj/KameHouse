import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { NotificationType, NotificationPriority } from '@prisma/client';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string;
  metadata?: any;
  expiresAt?: Date;
}

export interface NotificationPreferenceDto {
  enableEmail?: boolean;
  enablePush?: boolean;
  enableInApp?: boolean;
  taskAssignments?: boolean;
  taskReminders?: boolean;
  taskCompletions?: boolean;
  choreRotations?: boolean;
  favorRequests?: boolean;
  achievements?: boolean;
  announcements?: boolean;
  enableQuietHours?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  enableDailyDigest?: boolean;
  digestTime?: string;
}

export interface PushSubscriptionDto {
  endpoint: string;
  p256dh: string;
  auth: string;
  deviceName?: string;
  userAgent?: string;
}

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new notification
   */
  async createNotification(data: CreateNotificationDto) {
    // Check user preferences before creating notification
    const preferences = await this.getOrCreatePreferences(data.userId);

    // Check if user wants this type of notification
    if (!this.shouldSendNotification(data.type, preferences)) {
      return null;
    }

    // Check quiet hours
    if (this.isInQuietHours(preferences)) {
      // Queue for later or skip
      return null;
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        priority: data.priority || 'MEDIUM',
        title: data.title,
        message: data.message,
        icon: data.icon || this.getDefaultIcon(data.type),
        actionUrl: data.actionUrl,
        metadata: data.metadata,
        expiresAt: data.expiresAt,
      },
    });

    // If push notifications enabled, send push
    if (preferences.enablePush) {
      await this.sendPushNotification(data.userId, notification);
    }

    return notification;
  }

  /**
   * Get all notifications for a user
   */
  async getUserNotifications(userId: string, limit: number = 50) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } },
        ],
      },
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new Error('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new Error('Notification not found');
    }

    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  /**
   * Delete all read notifications
   */
  async deleteAllRead(userId: string) {
    return this.prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });
  }

  /**
   * Get or create user notification preferences
   */
  async getOrCreatePreferences(userId: string) {
    let preferences = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await this.prisma.notificationPreference.create({
        data: { userId },
      });
    }

    return preferences;
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(userId: string, data: NotificationPreferenceDto) {
    const existing = await this.getOrCreatePreferences(userId);

    return this.prisma.notificationPreference.update({
      where: { id: existing.id },
      data,
    });
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(userId: string, subscription: PushSubscriptionDto) {
    // Check if subscription already exists
    const existing = await this.prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint },
    });

    if (existing) {
      // Update existing subscription
      return this.prisma.pushSubscription.update({
        where: { endpoint: subscription.endpoint },
        data: {
          userId,
          p256dh: subscription.p256dh,
          auth: subscription.auth,
          deviceName: subscription.deviceName,
          userAgent: subscription.userAgent,
          isActive: true,
          lastUsedAt: new Date(),
        },
      });
    }

    // Create new subscription
    return this.prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
        deviceName: subscription.deviceName,
        userAgent: subscription.userAgent,
      },
    });
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(endpoint: string) {
    return this.prisma.pushSubscription.update({
      where: { endpoint },
      data: { isActive: false },
    });
  }

  /**
   * Send push notification to user's devices
   */
  private async sendPushNotification(userId: string, notification: any) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    // TODO: Implement actual Web Push API integration
    // For now, just log that we would send push
    console.log(`Would send push notification to ${subscriptions.length} device(s) for user ${userId}`);
    console.log('Notification:', {
      title: notification.title,
      message: notification.message,
      icon: notification.icon,
    });

    // In production, use web-push library:
    // const webPush = require('web-push');
    // for (const sub of subscriptions) {
    //   try {
    //     await webPush.sendNotification({
    //       endpoint: sub.endpoint,
    //       keys: { p256dh: sub.p256dh, auth: sub.auth }
    //     }, JSON.stringify({
    //       title: notification.title,
    //       body: notification.message,
    //       icon: notification.icon,
    //       data: { actionUrl: notification.actionUrl }
    //     }));
    //   } catch (error) {
    //     console.error('Push failed:', error);
    //     // Mark subscription as inactive if it failed
    //     await this.prisma.pushSubscription.update({
    //       where: { id: sub.id },
    //       data: { isActive: false }
    //     });
    //   }
    // }
  }

  /**
   * Check if notification should be sent based on user preferences
   */
  private shouldSendNotification(type: NotificationType, preferences: any): boolean {
    switch (type) {
      case 'TASK_ASSIGNED':
        return preferences.taskAssignments;
      case 'TASK_DUE_SOON':
      case 'TASK_OVERDUE':
        return preferences.taskReminders;
      case 'TASK_COMPLETED':
        return preferences.taskCompletions;
      case 'CHORE_ROTATION':
        return preferences.choreRotations;
      case 'FAVOR_REQUEST':
      case 'FAVOR_ACCEPTED':
        return preferences.favorRequests;
      case 'ACHIEVEMENT':
      case 'LEVEL_UP':
      case 'STREAK_MILESTONE':
        return preferences.achievements;
      case 'ANNOUNCEMENT':
        return preferences.announcements;
      case 'SYSTEM':
        return true; // Always send system notifications
      default:
        return true;
    }
  }

  /**
   * Check if current time is within quiet hours
   */
  private isInQuietHours(preferences: any): boolean {
    if (!preferences.enableQuietHours || !preferences.quietHoursStart || !preferences.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const start = preferences.quietHoursStart;
    const end = preferences.quietHoursEnd;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    }

    // Normal quiet hours (e.g., 13:00 to 15:00)
    return currentTime >= start && currentTime <= end;
  }

  /**
   * Get default icon for notification type
   */
  private getDefaultIcon(type: NotificationType): string {
    const icons = {
      TASK_ASSIGNED: '📋',
      TASK_DUE_SOON: '⏰',
      TASK_OVERDUE: '🚨',
      TASK_COMPLETED: '✅',
      CHORE_ROTATION: '🔄',
      FAVOR_REQUEST: '🤝',
      FAVOR_ACCEPTED: '👍',
      ACHIEVEMENT: '🏆',
      LEVEL_UP: '⬆️',
      STREAK_MILESTONE: '🔥',
      ANNOUNCEMENT: '📢',
      SYSTEM: '🔔',
    };

    return icons[type] || '🔔';
  }

  /**
   * Cleanup expired notifications (can be called by cron job)
   */
  async cleanupExpiredNotifications() {
    const result = await this.prisma.notification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(`Cleaned up ${result.count} expired notifications`);
    return result;
  }
}
