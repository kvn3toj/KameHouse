import { useState, useEffect } from 'react';
import {
  Paper,
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Home as HomeIcon,
  CheckCircle as TasksIcon,
  People as HouseIcon,
  Person as ProfileIcon,
  CleaningServices as ChoresIcon,
  CheckCircle as HabitsIcon,
  EmojiEvents as AchievementsIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { achievementsApi } from '@/lib/achievements-api';

/**
 * Mobile bottom navigation bar - Moksart UX Redesign
 * Shows on mobile devices with intuitive 4-tab structure:
 * - Home: Dashboard with daily overview
 * - Tasks: Quick access to habits and chores (unified action hub)
 * - House: Family Hub (KameHouse) with social features
 * - Me: Personal profile, achievements, settings (drawer)
 */
export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [newAchievementsCount, setNewAchievementsCount] = useState(0);
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);

  useEffect(() => {
    loadNotificationCounts();
    const interval = setInterval(loadNotificationCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotificationCounts = async () => {
    try {
      const achievements = await achievementsApi.getAll();
      const unseenCount = achievements.filter(a => a.unlocked && !a.seen).length;
      setNewAchievementsCount(unseenCount);
    } catch (error) {
      console.error('Failed to load notification counts:', error);
    }
  };

  const getCurrentValue = () => {
    const path = location.pathname;
    if (path === '/') return 0; // Home
    if (path === '/tasks' || path === '/habits' || path === '/chores') return 1; // Tasks
    if (path === '/kamehouse') return 2; // House
    if (path === '/achievements') return 3; // Me (includes achievements, profile)
    return -1; // No selection for other pages
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 3) {
      // Open "Me" drawer for profile, achievements, settings
      setMoreDrawerOpen(true);
    } else {
      const paths = ['/', '/tasks', '/kamehouse'];
      navigate(paths[newValue]);
    }
  };

  const handleMoreItemClick = (path: string) => {
    setMoreDrawerOpen(false);
    if (path === 'logout') {
      logout();
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  return (
    <>
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          display: { xs: 'block', md: 'none' }, // Only show on mobile
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
        elevation={3}
      >
        <MuiBottomNavigation
          value={getCurrentValue()}
          onChange={handleChange}
          showLabels
          sx={{
            height: 70,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 12px 8px',
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              marginTop: '4px',
            },
            '& .Mui-selected': {
              color: 'primary.main',
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                fontWeight: 700,
              },
            },
          }}
        >
          <BottomNavigationAction label="Home" icon={<HomeIcon />} />
          <BottomNavigationAction label="Tasks" icon={<TasksIcon />} />
          <BottomNavigationAction label="House" icon={<HouseIcon />} />
          <BottomNavigationAction
            label="Me"
            icon={
              <Badge badgeContent={newAchievementsCount} color="error">
                <ProfileIcon />
              </Badge>
            }
          />
        </MuiBottomNavigation>
      </Paper>

      {/* More Drawer */}
      <Drawer
        anchor="bottom"
        open={moreDrawerOpen}
        onClose={() => setMoreDrawerOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          },
        }}
      >
        <Box sx={{ width: '100%', pb: 2 }}>
          {/* Drawer Handle */}
          <Box
            sx={{
              display: 'flex',
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

          {/* Drawer Header */}
          <Box sx={{ px: 3, pb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              My Profile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Personal settings and achievements
            </Typography>
          </Box>

          <Divider />

          {/* Menu Items */}
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleMoreItemClick('/achievements')}>
                <ListItemIcon>
                  <Badge badgeContent={newAchievementsCount} color="error">
                    <AchievementsIcon />
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary="Achievements"
                  secondary={newAchievementsCount > 0 ? `${newAchievementsCount} new!` : undefined}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => handleMoreItemClick('/habits')}>
                <ListItemIcon>
                  <HabitsIcon />
                </ListItemIcon>
                <ListItemText primary="My Habits" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => handleMoreItemClick('/chores')}>
                <ListItemIcon>
                  <ChoresIcon />
                </ListItemIcon>
                <ListItemText primary="My Chores" />
              </ListItemButton>
            </ListItem>

            <Divider sx={{ my: 1 }} />

            <ListItem disablePadding>
              <ListItemButton onClick={() => handleMoreItemClick('logout')}>
                <ListItemIcon>
                  <LogoutIcon color="error" />
                </ListItemIcon>
                <ListItemText primary="Logout" primaryTypographyProps={{ color: 'error' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
