import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { habitsApi } from '@/lib/habits-api';
import type { Habit, CreateHabitDto, HabitType } from '@/types/habit';
import type { Achievement } from '@/types/achievement';
import { useAuth } from '@/contexts/AuthContext';
import { useAchievements } from '@/hooks/useAchievements';
import { useContextualHints } from '@/hooks/useContextualHints';
import LoadingState from '@/components/LoadingState';
import AchievementModal from '@/components/AchievementModal';
import EmptyState from '@/components/EmptyState';
import StreakMilestoneToast from '@/components/StreakMilestoneToast';
import ContextualHint from '@/components/ContextualHint';

export default function Habits() {
  const { user } = useAuth();
  const { checkForNew, markSeen } = useAchievements();
  const { activeHint, showHint, dismissHint } = useContextualHints();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [achievementToShow, setAchievementToShow] = useState<Achievement | null>(null);
  const [streakMilestone, setStreakMilestone] = useState<{
    show: boolean;
    streak: number;
    habitName: string;
    bonusXP: number;
  }>({ show: false, streak: 0, habitName: '', bonusXP: 0 });

  const [newHabit, setNewHabit] = useState<CreateHabitDto>({
    title: '',
    description: '',
    type: 'POSITIVE' as HabitType,
    difficulty: 1,
  });

  useEffect(() => {
    loadHabits();
  }, []);

  // Show contextual hints based on state
  useEffect(() => {
    if (!loading) {
      showHint([
        { type: 'first-habit-created', condition: habits.length === 1 },
      ]);
    }
  }, [habits, loading, showHint]);

  const loadHabits = async () => {
    try {
      const data = await habitsApi.getAll();
      setHabits(data);
    } catch (error) {
      console.error('Failed to load habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (habitId: string) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      const isFirstCompletion = habits.every(h => h.totalCompletions === 0);
      const result = await habitsApi.complete(habitId);
      await loadHabits();

      const { rewards } = result;
      let message = `+${rewards.xp} XP, +${rewards.gold} Gold`;
      if (rewards.levelUp) {
        message += ` 🎉 Level Up! You're now level ${rewards.newLevel}!`;
      }

      setSnackbar({ open: true, message, severity: 'success' });

      // Show first-completion hint
      if (isFirstCompletion) {
        showHint([{ type: 'first-completion', condition: true }]);
      }

      // Check for streak milestones (3, 7, 14, 30 days)
      if (habit) {
        const newStreak = habit.currentStreak + 1;
        const isMilestone = newStreak === 3 || newStreak === 7 || newStreak === 14 || newStreak === 30;

        if (isMilestone) {
          const bonusXP = newStreak === 30 ? 200 : newStreak === 14 ? 100 : newStreak === 7 ? 50 : 25;
          setStreakMilestone({
            show: true,
            streak: newStreak,
            habitName: habit.title,
            bonusXP,
          });
        }
      }

      // Check for newly unlocked achievements
      const newAchievements = await checkForNew();
      if (newAchievements.length > 0) {
        // Show the first new achievement
        setAchievementToShow(newAchievements[0]);
        showHint([{ type: 'achievement-unlocked', condition: true }]);
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to complete habit',
        severity: 'error',
      });
    }
  };

  const handleAchievementClose = () => {
    if (achievementToShow) {
      markSeen(achievementToShow.id);
    }
    setAchievementToShow(null);
  };

  const handleUncomplete = async (habitId: string) => {
    try {
      await habitsApi.uncomplete(habitId);
      await loadHabits();
      setSnackbar({ open: true, message: 'Habit uncompleted', severity: 'success' });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to uncomplete habit',
        severity: 'error',
      });
    }
  };

  const handleCreateHabit = async () => {
    try {
      await habitsApi.create(newHabit);
      await loadHabits();
      setOpenDialog(false);
      setNewHabit({ title: '', description: '', type: 'POSITIVE' as HabitType, difficulty: 1 });
      setSnackbar({ open: true, message: 'Habit created!', severity: 'success' });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to create habit',
        severity: 'error',
      });
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;

    try {
      await habitsApi.delete(habitId);
      await loadHabits();
      setSnackbar({ open: true, message: 'Habit deleted', severity: 'success' });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete habit',
        severity: 'error',
      });
    }
  };

  const getHabitColor = (type: HabitType) => {
    switch (type) {
      case 'POSITIVE':
        return 'success';
      case 'NEGATIVE':
        return 'error';
      case 'DAILY':
        return 'primary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <LoadingState type="habits" count={3} fullPage />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">My Habits</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            New Habit
          </Button>
        </Box>

        {habits.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No Habits Yet"
            description="Create your first habit to start building good routines and earning rewards!"
            actionLabel="Create Habit"
            onAction={() => setOpenDialog(true)}
          />
        ) : (
          <Grid container spacing={2}>
            {habits.map((habit) => (
              <Grid item xs={12} key={habit.id}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6">{habit.title}</Typography>
                        <Chip label={habit.type} color={getHabitColor(habit.type)} size="small" />
                        <Chip label={`Level ${habit.difficulty}`} size="small" variant="outlined" />
                      </Box>
                      {habit.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {habit.description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Chip label={`Streak: ${habit.currentStreak}`} size="small" />
                        <Chip label={`Total: ${habit.totalCompletions}`} size="small" />
                        <Chip label={`+${habit.xpReward} XP`} size="small" color="primary" />
                        <Chip label={`+${habit.goldReward} Gold`} size="small" color="warning" />
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        color="error"
                        onClick={() => handleUncomplete(habit.id)}
                        title="Remove completion"
                      >
                        <RemoveIcon />
                      </IconButton>
                      <IconButton
                        color="success"
                        onClick={() => handleComplete(habit.id)}
                        title="Complete habit"
                      >
                        <AddIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteHabit(habit.id)}
                        title="Delete habit"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Habit</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              value={newHabit.title}
              onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={newHabit.description}
              onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newHabit.type}
                label="Type"
                onChange={(e) => setNewHabit({ ...newHabit, type: e.target.value as HabitType })}
              >
                <MenuItem value="POSITIVE">Positive (Build good habits)</MenuItem>
                <MenuItem value="NEGATIVE">Negative (Break bad habits)</MenuItem>
                <MenuItem value="DAILY">Daily (Daily tasks)</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={newHabit.difficulty}
                label="Difficulty"
                onChange={(e) => setNewHabit({ ...newHabit, difficulty: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5].map((level) => (
                  <MenuItem key={level} value={level}>
                    Level {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateHabit}
            variant="contained"
            disabled={!newHabit.title.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Achievement unlock modal */}
      <AchievementModal
        achievement={achievementToShow}
        open={achievementToShow !== null}
        onClose={handleAchievementClose}
      />

      {/* Streak milestone celebration */}
      <StreakMilestoneToast
        open={streakMilestone.show}
        onClose={() => setStreakMilestone({ ...streakMilestone, show: false })}
        streak={streakMilestone.streak}
        habitName={streakMilestone.habitName}
        bonusXP={streakMilestone.bonusXP}
      />

      {/* Contextual hints */}
      <ContextualHint type={activeHint} onDismiss={dismissHint} />
    </Container>
  );
}
