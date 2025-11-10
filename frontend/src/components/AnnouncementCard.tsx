import { Card, CardContent, CardActions, Typography, Box, Chip, Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import {
  PushPin as PinIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Event as EventIcon,
  Notifications as ReminderIcon,
  Poll as PollIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import type { Announcement } from '@/lib/bulletin-api';

interface AnnouncementCardProps {
  announcement: Announcement;
  currentUserId?: string;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onReact?: (id: string, emoji: string) => void;
}

const typeConfig = {
  INFO: { color: '#2196f3', icon: InfoIcon, label: 'Info' },
  URGENT: { color: '#f44336', icon: WarningIcon, label: 'Urgent' },
  EVENT: { color: '#9c27b0', icon: EventIcon, label: 'Event' },
  REMINDER: { color: '#ff9800', icon: ReminderIcon, label: 'Reminder' },
  POLL: { color: '#4caf50', icon: PollIcon, label: 'Poll' },
};

export default function AnnouncementCard({
  announcement,
  currentUserId,
  onEdit,
  onDelete,
  onTogglePin,
  onReact
}: AnnouncementCardProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const config = typeConfig[announcement.type];
  const TypeIcon = config.icon;
  const isAuthor = currentUserId === announcement.authorId;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    onEdit?.(announcement);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete?.(announcement.id);
    handleMenuClose();
  };

  const handleTogglePin = () => {
    onTogglePin?.(announcement.id);
    handleMenuClose();
  };

  const handleReact = (emoji: string) => {
    onReact?.(announcement.id, emoji);
  };

  // Group reactions by emoji and count
  const reactionSummary = announcement.reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = { count: 0, hasUserReacted: false };
    }
    acc[reaction.emoji].count++;
    if (reaction.userId === currentUserId) {
      acc[reaction.emoji].hasUserReacted = true;
    }
    return acc;
  }, {} as Record<string, { count: number; hasUserReacted: boolean }>);

  const availableEmojis = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

  return (
    <Card
      sx={{
        mb: 2,
        position: 'relative',
        borderLeft: 4,
        borderLeftColor: config.color,
        ...(announcement.isPinned && {
          boxShadow: 3,
          border: '2px solid',
          borderColor: 'primary.main',
        })
      }}
    >
      {announcement.isPinned && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'primary.main',
          }}
        >
          <PinIcon />
        </Box>
      )}

      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar
            src={announcement.author.avatar}
            alt={announcement.author.displayName}
            sx={{ mr: 2, bgcolor: config.color }}
          >
            {announcement.author.displayName[0]}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {announcement.author.displayName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(announcement.createdAt).toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={<TypeIcon />}
                label={config.label}
                size="small"
                sx={{
                  bgcolor: `${config.color}20`,
                  color: config.color,
                  fontWeight: 'bold',
                }}
              />
              {announcement.expiresAt && (
                <Typography variant="caption" color="text.secondary">
                  Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </Box>
          {isAuthor && (
            <IconButton onClick={handleMenuOpen} size="small">
              <MoreIcon />
            </IconButton>
          )}
        </Box>

        <Typography variant="h6" gutterBottom>
          {announcement.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
          {announcement.content}
        </Typography>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, flexWrap: 'wrap', gap: 1 }}>
        {availableEmojis.map((emoji) => (
          <Chip
            key={emoji}
            label={`${emoji} ${reactionSummary[emoji]?.count || 0}`}
            size="small"
            onClick={() => handleReact(emoji)}
            variant={reactionSummary[emoji]?.hasUserReacted ? 'filled' : 'outlined'}
            color={reactionSummary[emoji]?.hasUserReacted ? 'primary' : 'default'}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </CardActions>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleTogglePin}>
          <PinIcon sx={{ mr: 1 }} fontSize="small" />
          {announcement.isPinned ? 'Unpin' : 'Pin'}
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
}
