// Hardcode for now since import.meta.env isn't working reliably
const API_URL = 'http://localhost:3000/api';

export interface Notification {
  id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  icon: string;
  actionUrl?: string;
  metadata?: any;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationPreferences {
  id: string;
  enableEmail: boolean;
  enablePush: boolean;
  enableInApp: boolean;
  taskAssignments: boolean;
  taskReminders: boolean;
  taskCompletions: boolean;
  choreRotations: boolean;
  favorRequests: boolean;
  achievements: boolean;
  announcements: boolean;
  enableQuietHours: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  enableDailyDigest: boolean;
  digestTime?: string;
}

export const notificationsApi = {
  /**
   * Get all notifications for current user
   */
  async getNotifications(limit: number = 50): Promise<Notification[]> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/notifications?limit=${limit}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch notifications');
    }

    return response.json();
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/notifications/unread-count`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch unread count');
    }

    const data = await response.json();
    return data.count;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to mark notification as read');
    }

    return response.json();
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/notifications/mark-all-read`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to mark all as read');
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete notification');
    }
  },

  /**
   * Delete all read notifications
   */
  async deleteAllRead(): Promise<void> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/notifications/read/all`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete read notifications');
    }
  },

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/notifications/preferences`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch preferences');
    }

    return response.json();
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/notifications/preferences`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update preferences');
    }

    return response.json();
  },

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(subscription: PushSubscription): Promise<void> {
    const token = localStorage.getItem('auth_token');

    // Convert PushSubscription to our format
    const subscriptionJson = subscription.toJSON();

    const response = await fetch(`${API_URL}/notifications/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        p256dh: subscriptionJson.keys?.p256dh || '',
        auth: subscriptionJson.keys?.auth || '',
        deviceName: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop',
        userAgent: navigator.userAgent,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to subscribe to push');
    }
  },

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(endpoint: string): Promise<void> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/notifications/push/unsubscribe`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to unsubscribe from push');
    }
  },
};
