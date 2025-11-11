import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Badge,
} from '@mui/material';
import {
  TrendingUp as HabitsIcon,
  Person as PersonIcon,
  BarChart as StatsIcon,
  Settings as SettingsIcon,
  EmojiEvents as AchievementsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface MeDrawerProps {
  open: boolean;
  onClose: () => void;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  newAchievementsCount?: number;
}

/**
 * MeDrawer - Personal space drawer for habits, profile, stats, and settings
 * Implements Aria's UX design for Phase 4A navigation restructure
 */
export default function MeDrawer({
  open,
  onClose,
  anchor = 'right',
  newAchievementsCount = 0
}: MeDrawerProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 360 },
          borderTopLeftRadius: { xs: 16, sm: 0 },
          borderTopRightRadius: { xs: 16, sm: 0 },
        }
      }}
    >
      {/* Drawer Handle (mobile) */}
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          justifyContent: 'center',
          py: 1.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 4,
            bgcolor: 'divider',
            borderRadius: 2,
          }}
        />
      </Box>

      {/* User Profile Header */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Avatar
          src={user?.avatar || undefined}
          sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
        >
          {user?.displayName?.[0] || user?.username?.[0] || '?'}
        </Avatar>
        <Typography variant="h6" fontWeight="bold">
          {user?.displayName || user?.username}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Level {user?.level || 1} • {user?.xp || 0} XP
        </Typography>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List>
        <ListItemButton onClick={() => handleNavigation('/habits')}>
          <ListItemIcon>
            <HabitsIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="My Habits"
            secondary="Personal tracking"
          />
        </ListItemButton>

        <ListItemButton onClick={() => handleNavigation('/achievements')}>
          <ListItemIcon>
            <Badge badgeContent={newAchievementsCount} color="error">
              <AchievementsIcon color="primary" />
            </Badge>
          </ListItemIcon>
          <ListItemText
            primary="Achievements"
            secondary={newAchievementsCount > 0 ? `${newAchievementsCount} new!` : "View your progress"}
          />
        </ListItemButton>

        <ListItemButton onClick={() => handleNavigation('/profile')}>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText
            primary="My Profile"
            secondary="Personal information"
          />
        </ListItemButton>

        <ListItemButton onClick={() => handleNavigation('/stats')}>
          <ListItemIcon>
            <StatsIcon />
          </ListItemIcon>
          <ListItemText
            primary="My Stats"
            secondary="Progress and metrics"
          />
        </ListItemButton>

        <Divider sx={{ my: 1 }} />

        <ListItemButton onClick={() => handleNavigation('/settings')}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText
            primary="Settings"
            secondary="Personal preferences"
          />
        </ListItemButton>
      </List>

      {/* Footer Info */}
      <Box sx={{ px: 3, py: 2, mt: 'auto' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Your personal space for habits, achievements, and settings
        </Typography>
      </Box>
    </Drawer>
  );
}
