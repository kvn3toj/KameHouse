import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Chip,
  Grid,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { habitsApi } from '@/lib/habits-api';
import type { Habit } from '@/types/habit';

interface TodayHabitsProps {
  onComplete: (habitId: string) => void;
  onUpdate: () => void;
}

export default function TodayHabits({ onComplete, onUpdate }: TodayHabitsProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const data = await habitsApi.getAll();
      setHabits(data.filter((h) => h.isActive));
    } catch (error) {
      console.error('Failed to load habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (habitId: string) => {
    setCompleting(habitId);
    try {
      await onComplete(habitId);
      await loadHabits();
      onUpdate();
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Today's Habits
      </Typography>
      {habits.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          No active habits. Create some in the Habits page!
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {habits.map((habit) => (
            <Grid item xs={12} sm={6} md={4} key={habit.id}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body1" fontWeight="medium" noWrap>
                    {habit.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                    <Chip label={`+${habit.xpReward} XP`} size="small" color="primary" />
                    <Chip label={`Streak: ${habit.currentStreak}`} size="small" variant="outlined" />
                  </Box>
                </Box>
                <IconButton
                  color="success"
                  onClick={() => handleComplete(habit.id)}
                  disabled={completing === habit.id}
                  size="large"
                >
                  {completing === habit.id ? (
                    <CircularProgress size={24} />
                  ) : (
                    <AddIcon fontSize="large" />
                  )}
                </IconButton>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
}
