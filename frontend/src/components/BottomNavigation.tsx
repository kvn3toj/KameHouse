import { useState, useEffect } from 'react';
import {
  Paper,
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  Badge,
} from '@mui/material';
import {
  Home as HomeIcon,
  AccountBalance as TemploIcon,
  Person as ProfileIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { achievementsApi } from '@/lib/achievements-api';
import MeDrawer from './MeDrawer';

/**
 * Mobile bottom navigation bar - Phase 4A: Templo Navigation
 * Shows on mobile devices with simplified 3-tab structure:
 * - Home: Dashboard with daily overview
 * - Templo: Sacred household center (formerly Family Hub)
 * - Me: Personal space drawer (habits, achievements, profile, settings)
 */
export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [newAchievementsCount, setNewAchievementsCount] = useState(0);
  const [meDrawerOpen, setMeDrawerOpen] = useState(false);

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
    if (path === '/templo') return 1; // Templo
    if (path === '/habits' || path === '/achievements' || path === '/profile' || path === '/stats' || path === '/settings') return 2; // Me (personal pages)
    return -1; // No selection for other pages
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 2) {
      // Open "Me" drawer for personal space
      setMeDrawerOpen(true);
    } else {
      const paths = ['/', '/templo'];
      navigate(paths[newValue]);
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
          <BottomNavigationAction label="Templo" icon={<TemploIcon />} />
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

      {/* Me Drawer */}
      <MeDrawer
        open={meDrawerOpen}
        onClose={() => setMeDrawerOpen(false)}
        anchor="bottom"
        newAchievementsCount={newAchievementsCount}
      />
    </>
  );
}
