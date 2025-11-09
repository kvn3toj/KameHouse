import { useState, useEffect } from 'react';
import { Box, Button, Container, Typography, Grid, Snackbar, Alert } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { habitsApi } from '@/lib/habits-api';
import { achievementsApi } from '@/lib/achievements-api';
import TodayHabits from '@/components/TodayHabits';
import StatsCards from '@/components/StatsCards';
import ProgressBar from '@/components/ProgressBar';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

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

        {/* Progress to Next Level */}
        <Box sx={{ mb: 3 }}>
          <ProgressBar
            current={user.xp % 100}
            max={100}
            label={`Progress to Level ${user.level + 1}`}
            color="success"
          />
        </Box>

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
    </Container>
  );
}
