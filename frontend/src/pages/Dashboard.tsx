import { useState, useEffect } from 'react';
import { Box, Button, Container, Typography, Grid, Snackbar, Alert, IconButton, Tooltip, Fab, Card, CardContent, Avatar, Chip } from '@mui/material';
import { Help as HelpIcon, Home as HouseIcon, ArrowForward as ArrowIcon, People as PeopleIcon } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { habitsApi } from '@/lib/habits-api';
import { achievementsApi } from '@/lib/achievements-api';
import { questsApi } from '@/lib/quests-api';
import { householdApi } from '@/lib/household-api';
import TodayHabits from '@/components/TodayHabits';
import StatsCards from '@/components/StatsCards';
import ProgressBar from '@/components/ProgressBar';
import HelpDrawer from '@/components/HelpDrawer';
import QuestCard from '@/components/QuestCard';
import TodayTasksWidget from '@/components/TodayTasksWidget';
import type { UserQuest } from '@/types/quest';
import type { Household } from '@/types/household';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [quests, setQuests] = useState<UserQuest[]>([]);
  const [loadingQuests, setLoadingQuests] = useState(true);
  const [household, setHousehold] = useState<Household | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadQuests();
    loadHousehold();
  }, []);

  const loadHousehold = async () => {
    try {
      const data = await householdApi.getMy();
      setHousehold(data);
    } catch (error) {
      console.error('Failed to load household:', error);
      // Don't show error - user may not have household yet
    }
  };

  const loadQuests = async () => {
    try {
      setLoadingQuests(true);
      const dailyQuests = await questsApi.getDailyQuests();
      setQuests(dailyQuests);
    } catch (error) {
      console.error('Failed to load quests:', error);
    } finally {
      setLoadingQuests(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleComplete = async (habitId: string) => {
    try {
      const result = await habitsApi.complete(habitId);
      const { rewards } = result;

      let message = `+${rewards.xp} XP, +${rewards.gold} Gold`;
      if (rewards.levelUp) {
        message += ` 🎉 Level Up! You're now level ${rewards.newLevel}!`;
      }

      // Check for newly unlocked achievements
      try {
        const newAchievements = await achievementsApi.checkUnlocks();
        if (newAchievements.length > 0) {
          const achievementNames = newAchievements.map(a => a.name).join(', ');
          message += `\n🏆 New Achievement${newAchievements.length > 1 ? 's' : ''}: ${achievementNames}!`;
        }
      } catch (error) {
        console.error('Failed to check achievements:', error);
      }

      setSnackbar({ open: true, message, severity: 'success' });

      // Refresh user data
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to complete habit',
        severity: 'error',
      });
    }
  };

  const handleUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleQuestComplete = async (questId: string) => {
    try {
      const result = await questsApi.completeQuest(questId);
      const { rewards } = result;

      let message = `Quest Complete! +${rewards.xp} XP, +${rewards.gold} Gold`;
      if (rewards.gems > 0) {
        message += `, +${rewards.gems} Gems`;
      }
      if (rewards.levelUp) {
        message += ` 🎉 Level Up! You're now level ${rewards.newLevel}!`;
      }

      setSnackbar({ open: true, message, severity: 'success' });

      // Reload quests and user data
      loadQuests();
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to complete quest',
        severity: 'error',
      });
    }
  };

  if (!user) return null;

  const nextLevelXP = (user.level + 1) * 100;

  return (
    <Container maxWidth="lg">
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome back, {user.displayName || user.username}! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Ready to build some habits today?
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Quick Start Guide">
              <IconButton onClick={() => setHelpOpen(true)} color="primary" size="large">
                <HelpIcon />
              </IconButton>
            </Tooltip>
            <Button variant="contained" onClick={() => navigate('/habits')}>
              All Habits
            </Button>
            <Button variant="outlined" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ mb: 3 }}>
          <StatsCards user={user} />
        </Box>

        {/* KameHouse Card - Prominent Feature */}
        {household && (
          <Card
            sx={{
              mb: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              },
            }}
            onClick={() => navigate('/kamehouse')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        width: 56,
                        height: 56,
                      }}
                    >
                      <HouseIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        🏠 {household.name}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Your Family Hub
                      </Typography>
                    </Box>
                  </Box>

                  {household.description && (
                    <Typography variant="body1" sx={{ mb: 2, opacity: 0.95 }}>
                      {household.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      icon={<PeopleIcon />}
                      label={`${household.memberCount} Members`}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        '& .MuiChip-icon': { color: 'white' },
                      }}
                    />
                    <Chip
                      label="Leaderboard"
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                      }}
                    />
                    <Chip
                      label="LETS Economy"
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                      }}
                    />
                    <Chip
                      label="Bulletin"
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                      }}
                    />
                  </Box>

                  <Button
                    variant="contained"
                    endIcon={<ArrowIcon />}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                      },
                    }}
                  >
                    Go to KameHouse
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* No Household CTA */}
        {!household && (
          <Card
            sx={{
              mb: 3,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              },
            }}
            onClick={() => navigate('/kamehouse')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    width: 56,
                    height: 56,
                  }}
                >
                  <HouseIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    Create Your KameHouse
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Start tracking habits with your family!
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body1" sx={{ mb: 2, opacity: 0.95 }}>
                KameHouse is the hub for your family's habit journey. Create or join a household to compete on leaderboards, exchange favors with LETS Economy, and stay connected with the Bulletin Board.
              </Typography>

              <Button
                variant="contained"
                endIcon={<ArrowIcon />}
                sx={{
                  bgcolor: 'white',
                  color: '#f5576c',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Progress to Next Level */}
        <Box sx={{ mb: 3 }}>
          <ProgressBar
            current={user.xp % 100}
            max={100}
            label={`Progress to Level ${user.level + 1}`}
            color="success"
          />
        </Box>

        {/* Today's Tasks Widget - Moksart UX Enhancement */}
        <TodayTasksWidget />

        {/* Daily Quests */}
        {!loadingQuests && quests && quests.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" fontWeight={700} sx={{ mb: 2 }}>
              🎯 Daily Quests
            </Typography>
            <Grid container spacing={2}>
              {quests.map((userQuest) => (
                <Grid item xs={12} sm={6} md={3} key={userQuest.id}>
                  <QuestCard userQuest={userQuest} onComplete={handleQuestComplete} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Today's Habits */}
        <Box sx={{ mb: 3 }}>
          <TodayHabits key={refreshKey} onComplete={handleComplete} onUpdate={handleUpdate} />
        </Box>

        {/* Quick Actions */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={() => navigate('/habits')}
              sx={{ py: 2 }}
            >
              Manage Habits
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={() => navigate('/achievements')}
              sx={{ py: 2 }}
            >
              View Achievements
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={() => navigate('/family')}
              sx={{ py: 2 }}
            >
              Family Household
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Help Button */}
      <Fab
        color="primary"
        aria-label="help"
        onClick={() => setHelpOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
          },
        }}
      >
        <HelpIcon />
      </Fab>

      {/* Help Drawer */}
      <HelpDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />
    </Container>
  );
}
