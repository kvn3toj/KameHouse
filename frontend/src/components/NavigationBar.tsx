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
  Person as PersonIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { achievementsApi } from '@/lib/achievements-api';
import { householdApi } from '@/lib/household-api';
import MeDrawer from './MeDrawer';
import HouseSettingsDrawer from './HouseSettingsDrawer';

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
  const [meDrawerOpen, setMeDrawerOpen] = useState(false);
  const [houseSettingsDrawerOpen, setHouseSettingsDrawerOpen] = useState(false);
  const [household, setHousehold] = useState<any>(null);

  useEffect(() => {
    loadNotificationCounts();
    loadHousehold();
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

  const loadHousehold = async () => {
    try {
      const data = await householdApi.getMy();
      setHousehold(data);
    } catch (error) {
      console.error('Failed to load household:', error);
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

  // Phase 4A: Simplified navigation with Templo as centerpiece
  const navItems = [
    { path: '/templo', label: 'Templo', icon: '🏛️', color: 'household', primary: true },
    {
      path: '/achievements',
      label: 'Achievements',
      icon: <AchievementsIcon />,
      badge: newAchievementsCount,
      color: 'personal',
    },
  ];

  return (
    <>
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
                  startIcon={typeof item.icon === 'string' ? null : item.icon}
                  sx={{
                    fontWeight: isActive(item.path) ? 700 : 400,
                    bgcolor: isActive(item.path)
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'transparent',
                    borderBottom: isActive(item.path) ? '3px solid white' : '3px solid transparent',
                    borderRadius: '4px 4px 0 0',
                    px: 2,
                    fontSize: item.primary ? '1.1rem' : '1rem',
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
                  {typeof item.icon === 'string' && <span style={{ marginRight: 8 }}>{item.icon}</span>}
                  {item.label}
                </Button>
              </Badge>
            ))}
          </Box>
        )}

        {/* Desktop Drawer Buttons */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              color="inherit"
              onClick={() => setMeDrawerOpen(true)}
              aria-label="Open personal menu"
            >
              <Badge badgeContent={newAchievementsCount} color="error">
                <PersonIcon />
              </Badge>
            </IconButton>
            <IconButton
              color="inherit"
              onClick={() => setHouseSettingsDrawerOpen(true)}
              aria-label="Open house settings"
            >
              <SettingsIcon />
            </IconButton>
            <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
              Logout
            </Button>
          </Box>
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

      {/* Drawers */}
      <MeDrawer
        open={meDrawerOpen}
        onClose={() => setMeDrawerOpen(false)}
        newAchievementsCount={newAchievementsCount}
      />
      <HouseSettingsDrawer
        open={houseSettingsDrawerOpen}
        onClose={() => setHouseSettingsDrawerOpen(false)}
        household={household ? {
          id: household.id,
          name: household.name,
          inviteCode: household.inviteCode
        } : null}
      />
    </>
  );
}
