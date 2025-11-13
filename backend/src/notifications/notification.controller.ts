import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotificationService } from './notification.service';
import type { CreateNotificationDto, NotificationPreferenceDto, PushSubscriptionDto } from './notification.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Get all notifications for the current user
   */
  @Get()
  async getUserNotifications(@Request() req, @Query('limit') limit?: string) {
    const userId = req.user.userId;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.notificationService.getUserNotifications(userId, limitNum);
  }

  /**
   * Get unread notification count
   */
  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const userId = req.user.userId;
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  /**
   * Mark notification as read
   */
  @Patch(':id/read')
  async markAsRead(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.notificationService.markAsRead(id, userId);
  }

  /**
   * Mark all notifications as read
   */
  @Patch('mark-all-read')
  async markAllAsRead(@Request() req) {
    const userId = req.user.userId;
    return this.notificationService.markAllAsRead(userId);
  }

  /**
   * Delete a notification
   */
  @Delete(':id')
  async deleteNotification(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.notificationService.deleteNotification(id, userId);
  }

  /**
   * Delete all read notifications
   */
  @Delete('read/all')
  async deleteAllRead(@Request() req) {
    const userId = req.user.userId;
    return this.notificationService.deleteAllRead(userId);
  }

  /**
   * Get user notification preferences
   */
  @Get('preferences')
  async getPreferences(@Request() req) {
    const userId = req.user.userId;
    return this.notificationService.getOrCreatePreferences(userId);
  }

  /**
   * Update user notification preferences
   */
  @Patch('preferences')
  async updatePreferences(@Request() req, @Body() data: NotificationPreferenceDto) {
    const userId = req.user.userId;
    return this.notificationService.updatePreferences(userId, data);
  }

  /**
   * Subscribe to push notifications
   */
  @Post('push/subscribe')
  async subscribeToPush(@Request() req, @Body() subscription: PushSubscriptionDto) {
    const userId = req.user.userId;
    return this.notificationService.subscribeToPush(userId, subscription);
  }

  /**
   * Unsubscribe from push notifications
   */
  @Delete('push/unsubscribe')
  async unsubscribeFromPush(@Body() data: { endpoint: string }) {
    return this.notificationService.unsubscribeFromPush(data.endpoint);
  }
}
