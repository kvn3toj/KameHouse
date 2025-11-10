import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Badge,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Home as HomeIcon,
  CheckCircle as HabitsIcon,
  EmojiEvents as AchievementsIcon,
  People as FamilyIcon,
  CleaningServices as ChoresIcon,
  Campaign as BulletinIcon,
  AttachMoney as MarketplaceIcon,
  Menu as MenuIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { achievementsApi } from '@/lib/achievements-api';

/**
 * Persistent navigation bar with notification badges
 * Shows across all authenticated pages
 */
export default function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const [newAchievementsCount, setNewAchievementsCount] = useState(0);

  useEffect(() => {
    loadNotificationCounts();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotificationCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotificationCounts = async () => {
    try {
      // Check for unseen achievements
      const achievements = await achievementsApi.getAll();
      const unseenCount = achievements.filter(a => a.unlocked && !a.seen).length;
      setNewAchievementsCount(unseenCount);
    } catch (error) {
      console.error('Failed to load notification counts:', error);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuAnchor(null);
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: <HomeIcon />, color: 'default' },
    { path: '/habits', label: 'My Habits', icon: <HabitsIcon />, color: 'personal' },
    {
      path: '/achievements',
      label: 'Achievements',
      icon: <AchievementsIcon />,
      badge: newAchievementsCount,
      color: 'personal',
    },
    { path: '/kamehouse', label: 'Family Hub', icon: <FamilyIcon />, color: 'household' },
    { path: '/chores', label: 'House Tasks', icon: <ChoresIcon />, color: 'household' },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={2}
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        // Mobile polish: rounded bottom corners and backdrop blur
        borderBottomLeftRadius: { xs: 16, md: 0 },
        borderBottomRightRadius: { xs: 16, md: 0 },
        backdropFilter: { xs: 'blur(10px)', md: 'none' },
        backgroundColor: { xs: 'rgba(102, 126, 234, 0.95)', md: 'transparent' },
      }}
    >
      <Toolbar>
        {/* Logo/Title */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: isMobile ? 1 : 0,
            mr: 4,
            fontWeight: 700,
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          🏠 KameHouse
        </Typography>

        {/* Desktop Navigation */}
        {!isMobile && (
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            {navItems.map((item) => (
              <Badge
                key={item.path}
                badgeContent={item.badge}
                color="error"
                overlap="rectangular"
                sx={{
                  '& .MuiBadge-badge': {
                    right: 8,
                    top: 8,
                  },
                }}
              >
                <Button
                  color="inherit"
                  onClick={() => handleNavigate(item.path)}
                  startIcon={item.icon}
                  sx={{
                    fontWeight: isActive(item.path) ? 700 : 400,
                    bgcolor: isActive(item.path)
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'transparent',
                    borderBottom: isActive(item.path) ? '3px solid white' : '3px solid transparent',
                    borderRadius: '4px 4px 0 0',
                    px: 2,
                    // Subtle color-coding: purple tint for personal, blue tint for household
                    ...(item.color === 'personal' && !isActive(item.path) && {
                      '&:hover': {
                        bgcolor: 'rgba(186, 104, 200, 0.15)',
                      },
                    }),
                    ...(item.color === 'household' && !isActive(item.path) && {
                      '&:hover': {
                        bgcolor: 'rgba(66, 165, 245, 0.15)',
                      },
                    }),
                    ...((item.color === 'default' || !item.color) && {
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.15)',
                      },
                    }),
                  }}
                >
                  {item.label}
                </Button>
              </Badge>
            ))}
          </Box>
        )}

        {/* Desktop Logout */}
        {!isMobile && (
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        )}

        {/* Mobile Menu */}
        {isMobile && (
          <>
            <IconButton
              color="inherit"
              edge="end"
              onClick={(e) => setMobileMenuAnchor(e.currentTarget)}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={() => setMobileMenuAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {navItems.map((item) => (
                <MenuItem
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  selected={isActive(item.path)}
                  sx={{
                    fontWeight: isActive(item.path) ? 700 : 400,
                    bgcolor: isActive(item.path) ? 'action.selected' : 'transparent',
                  }}
                >
                  <Badge badgeContent={item.badge} color="error" sx={{ mr: 2, ml: 1 }}>
                    {item.icon}
                  </Badge>
                  {item.label}
                </MenuItem>
              ))}
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 2, ml: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
