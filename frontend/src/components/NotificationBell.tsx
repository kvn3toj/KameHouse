import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  Button,
  Paper,
  Stack,
  Chip,
} from '@mui/material';
import {
  Notifications as BellIcon,
  CheckCircle as ReadIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  DeleteSweep as ClearIcon,
} from '@mui/icons-material';
import { notificationsApi, type Notification } from '@/lib/notifications-api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

dayjs.extend(relativeTime);
dayjs.locale('es');

export default function NotificationBell() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);

  useEffect(() => {
    loadUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getNotifications(20);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    loadNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      await notificationsApi.markAsRead(notification.id);
      await loadUnreadCount();
      await loadNotifications();
    }

    // Navigate if actionUrl exists
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }

    handleClose();
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      await loadUnreadCount();
      await loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteRead = async () => {
    try {
      await notificationsApi.deleteAllRead();
      await loadNotifications();
      await loadUnreadCount();
    } catch (error) {
      console.error('Error deleting read notifications:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await notificationsApi.deleteNotification(notificationId);
      await loadNotifications();
      await loadUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <BellIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 600,
            overflow: 'visible',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              🔔 Notificaciones
            </Typography>
            <Box>
              <IconButton size="small" onClick={handleMarkAllAsRead} title="Marcar todas como leídas">
                <ReadIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleDeleteRead} title="Borrar leídas">
                <ClearIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => {
                  navigate('/settings/notifications');
                  handleClose();
                }}
                title="Configuración"
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Notifications List */}
        <Box sx={{ maxHeight: 450, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Cargando...
              </Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No tienes notificaciones
              </Typography>
            </Box>
          ) : (
            <Stack spacing={0}>
              {notifications.map((notification) => (
                <MenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                    borderBottom: 1,
                    borderColor: 'divider',
                    alignItems: 'flex-start',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: 20 }}>{notification.icon}</Typography>
                        <Typography variant="body2" fontWeight={notification.isRead ? 400 : 600}>
                          {notification.title}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {notification.message}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip
                        label={notification.priority}
                        size="small"
                        color={getPriorityColor(notification.priority) as any}
                        sx={{ height: 20, fontSize: 10 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(notification.createdAt).fromNow()}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Stack>
          )}
        </Box>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button
                size="small"
                fullWidth
                onClick={() => {
                  navigate('/notifications');
                  handleClose();
                }}
              >
                Ver todas las notificaciones
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
}
