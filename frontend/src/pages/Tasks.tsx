import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Snackbar,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  CheckCircle as HabitIcon,
  CleaningServices as ChoreIcon,
  Handshake as FavorIcon,
  LocalFireDepartment as UrgentIcon,
  AccessTime as ClockIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { habitsApi } from '@/lib/habits-api';
import { getMyChores } from '@/lib/chores-api';
import { transactionsApi } from '@/lib/transactions-api';
import { householdApi } from '@/lib/household-api';
import { roomsApi } from '@/lib/rooms-api';
import { achievementsApi } from '@/lib/achievements-api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Habit } from '@/types/habit';
import type { ChoreAssignment } from '@/lib/chores-api';
import type { Transaction } from '@/types/transaction';

interface AggregatedTask {
  id: string;
  type: 'habit' | 'chore' | 'favor' | 'room-task';
  title: string;
  description?: string;
  urgency: 'high' | 'medium' | 'low';
  dueInfo?: string;
  roomName?: string;
  isAssigned?: boolean;
  reward: {
    xp?: number;
    gold?: number;
    credits?: number;
  };
  metadata: any;
  isCompleted?: boolean;
}

/**
 * Tasks Page - Unified view of all actionable items
 * Implements Moksart UX recommendation for centralized task management
 * Aggregates habits, chores, and favors with smart filtering and prioritization
 */
export default function Tasks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<AggregatedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0=All, 1=Habits, 2=Chores, 3=Favors
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadAllTasks();
  }, []);

  const loadAllTasks = async () => {
    try {
      setLoading(true);

      // Load habits, chores, and household in parallel
      const [habits, chores, household] = await Promise.all([
        habitsApi.getAll().catch(() => []),
        getMyChores().catch(() => []),
        householdApi.getMy().catch(() => null),
      ]);

      let transactions: Transaction[] = [];
      let rooms: any[] = [];
      let roomTasks: any[] = [];

      if (household) {
        setHouseholdId(household.id);

        // Load transactions and rooms
        const [trans, houseRooms] = await Promise.all([
          transactionsApi.getAll(household.id).catch(() => []),
          roomsApi.findByHousehold(household.id).catch(() => []),
        ]);
        transactions = trans;
        rooms = houseRooms;

        // Load tasks from all rooms
        const roomTasksPromises = rooms.map((room) =>
          roomsApi.getRoomTasks(room.id).catch(() => [])
        );
        const roomTasksArrays = await Promise.all(roomTasksPromises);

        // Flatten and attach room names
        roomTasks = roomTasksArrays.flatMap((tasks, index) =>
          tasks.map((task: any) => ({ ...task, roomName: rooms[index].name }))
        );
      }

      const aggregated = aggregateTasks(habits, chores, transactions, roomTasks);
      setTasks(aggregated);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setSnackbar({ open: true, message: 'Failed to load tasks', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const aggregateTasks = (
    habits: Habit[],
    chores: ChoreAssignment[],
    transactions: Transaction[],
    roomTasks: any[]
  ): AggregatedTask[] => {
    const now = new Date();
    const aggregated: AggregatedTask[] = [];

    // Add all habits (completed and incomplete)
    habits.forEach((habit) => {
      const baseXP = 10 + habit.difficulty * 5;
      const baseGold = 5 + habit.difficulty * 2;

      aggregated.push({
        id: habit.id,
        type: 'habit',
        title: habit.title,
        description: habit.description,
        urgency: habit.currentStreak >= 7 ? 'high' : 'medium',
        dueInfo: habit.currentStreak > 0 ? `🔥 ${habit.currentStreak} day streak` : undefined,
        reward: {
          xp: baseXP,
          gold: baseGold,
        },
        metadata: habit,
        isCompleted: habit.completedToday,
      });
    });

    // Add all chores (completed and incomplete)
    chores.forEach((chore) => {
      const dueDate = new Date(chore.dueDate);
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      aggregated.push({
        id: chore.id,
        type: 'chore',
        title: chore.template.title,
        description: chore.template.description,
        urgency: hoursUntilDue < 6 ? 'high' : hoursUntilDue < 24 ? 'medium' : 'low',
        dueInfo:
          hoursUntilDue < 24
            ? `⏰ Due in ${Math.floor(hoursUntilDue)}h`
            : `Due ${dueDate.toLocaleDateString()}`,
        reward: {
          xp: chore.template.xpReward,
          gold: chore.template.goldReward,
          credits: chore.template.letsCredit,
        },
        metadata: chore,
        isCompleted: chore.isCompleted,
      });
    });

    // Add available and assigned favors
    const relevantFavors = transactions.filter(
      (t) => t.canAccept || t.assigneeId === user?.id
    );

    relevantFavors.forEach((favor) => {
      const isCompleted = favor.status === 'COMPLETED';

      aggregated.push({
        id: favor.id,
        type: 'favor',
        title: favor.title,
        description: favor.description,
        urgency: favor.assigneeId === user?.id ? 'medium' : 'low',
        dueInfo:
          favor.assigneeId === user?.id
            ? `Assigned to you`
            : `Requested by ${favor.requesterName}`,
        reward: {
          credits: favor.credits,
        },
        metadata: favor,
        isCompleted,
      });
    });

    // Add room tasks (show both assigned and unassigned)
    roomTasks.forEach((task) => {
      const isAssigned = task.assignments && task.assignments.length > 0;
      const assignedUser = isAssigned ? task.assignments[0].user : null;

      aggregated.push({
        id: task.id,
        type: 'room-task',
        title: task.title,
        description: task.description,
        urgency: isAssigned ? 'medium' : 'low',
        dueInfo: isAssigned
          ? `Assigned to ${assignedUser.displayName || assignedUser.username}`
          : '🆓 Available to claim',
        roomName: task.roomName,
        isAssigned,
        reward: {
          xp: task.xpReward,
          gold: task.goldReward,
        },
        metadata: task,
        isCompleted: false, // Room tasks don't track completion in this view
      });
    });

    // Sort by completion status first, then urgency
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    aggregated.sort((a, b) => {
      // Incomplete tasks first
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      // Then by urgency
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });

    return aggregated;
  };

  const getFilteredTasks = () => {
    if (activeTab === 0) return tasks; // All
    if (activeTab === 1) return tasks.filter((t) => t.type === 'habit');
    if (activeTab === 2) return tasks.filter((t) => t.type === 'chore');
    if (activeTab === 3) return tasks.filter((t) => t.type === 'favor');
    if (activeTab === 4) return tasks.filter((t) => t.type === 'room-task');
    return tasks;
  };

  const handleCompleteHabit = async (habitId: string) => {
    try {
      const result = await habitsApi.complete(habitId);
      const { rewards } = result;

      let message = `+${rewards.xp} XP, +${rewards.gold} Gold`;
      if (rewards.levelUp) {
        message += ` 🎉 Level Up! You're now level ${rewards.newLevel}!`;
      }

      // Check for achievements
      const newAchievements = await achievementsApi.checkUnlocks();
      if (newAchievements.length > 0) {
        const achievementNames = newAchievements.map((a) => a.name).join(', ');
        message += `\n🏆 New Achievement: ${achievementNames}!`;
      }

      setSnackbar({ open: true, message, severity: 'success' });
      loadAllTasks();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to complete habit', severity: 'error' });
    }
  };

  const handleAcceptFavor = async (favorId: string) => {
    if (!householdId) return;

    try {
      await transactionsApi.accept(householdId, favorId);
      setSnackbar({ open: true, message: 'Favor accepted!', severity: 'success' });
      loadAllTasks();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to accept favor', severity: 'error' });
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'habit':
        return 'rgba(103, 58, 183, 0.1)';
      case 'chore':
        return 'rgba(33, 150, 243, 0.1)';
      case 'favor':
        return 'rgba(76, 175, 80, 0.1)';
      default:
        return 'transparent';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'habit':
        return <HabitIcon />;
      case 'chore':
        return <ChoreIcon />;
      case 'favor':
        return <FavorIcon />;
      case 'room-task':
        return <ChoreIcon />;
      default:
        return <HabitIcon />;
    }
  };

  const filteredTasks = getFilteredTasks();
  const incompleteTasks = filteredTasks.filter((t) => !t.isCompleted);
  const completedTasks = filteredTasks.filter((t) => t.isCompleted);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              📋 My Tasks
            </Typography>
            <Typography variant="body1" color="text.secondary">
              All your daily priorities in one place
            </Typography>
          </Box>
          <IconButton onClick={loadAllTasks} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* Stats Summary */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Chip
            icon={<UrgentIcon />}
            label={`${incompleteTasks.length} To Do`}
            color="primary"
            sx={{ fontWeight: 700 }}
          />
          <Chip
            label={`${completedTasks.length} Completed`}
            color="success"
            variant="outlined"
          />
          <Chip
            label={`${tasks.filter((t) => t.type === 'habit').length} Habits`}
            variant="outlined"
          />
          <Chip
            label={`${tasks.filter((t) => t.type === 'chore').length} Chores`}
            variant="outlined"
          />
          <Chip
            label={`${tasks.filter((t) => t.type === 'favor').length} Favors`}
            variant="outlined"
          />
          <Chip
            label={`${tasks.filter((t) => t.type === 'room-task').length} Room Tasks`}
            variant="outlined"
          />
        </Box>

        {/* Filter Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
            <Tab label="All Tasks" />
            <Tab label="Habits" />
            <Tab label="Chores" />
            <Tab label="Favors" />
            <Tab label="Room Tasks" />
          </Tabs>
        </Box>

        {/* Tasks Grid */}
        {incompleteTasks.length === 0 && completedTasks.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No tasks found. Try changing the filter or add new habits!
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {/* To Do Column */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  📌 To Do ({incompleteTasks.length})
                </Typography>
              </Box>

              {incompleteTasks.length === 0 ? (
                <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'success.light' }}>
                  <Typography variant="h6">✨ All Done!</Typography>
                  <Typography color="text.secondary">You've completed all tasks in this category</Typography>
                </Card>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {incompleteTasks.map((task) => (
                    <Card
                      key={task.id}
                      sx={{
                        border: '2px solid',
                        borderColor: task.urgency === 'high' ? 'error.main' : 'divider',
                        bgcolor: getTaskTypeColor(task.type),
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 3,
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, mb: 1 }}>
                          {task.urgency === 'high' && (
                            <Chip
                              icon={<UrgentIcon />}
                              label="URGENT"
                              size="small"
                              color="error"
                              sx={{ fontWeight: 700 }}
                            />
                          )}
                          <Chip
                            icon={getTaskIcon(task.type)}
                            label={task.type.toUpperCase()}
                            size="small"
                            variant="outlined"
                          />
                        </Box>

                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {task.title}
                        </Typography>

                        {task.roomName && (
                          <Chip
                            label={`📍 ${task.roomName}`}
                            size="small"
                            sx={{ mb: 1, bgcolor: 'primary.light', color: 'primary.contrastText' }}
                          />
                        )}

                        {task.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {task.description}
                          </Typography>
                        )}

                        {task.dueInfo && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <ClockIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {task.dueInfo}
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                          {task.reward.xp && (
                            <Chip label={`+${task.reward.xp} XP`} size="small" color="success" />
                          )}
                          {task.reward.gold && (
                            <Chip label={`+${task.reward.gold} Gold`} size="small" color="warning" />
                          )}
                          {task.reward.credits && (
                            <Chip label={`+${task.reward.credits} Credits`} size="small" color="primary" />
                          )}
                        </Box>

                        {task.type === 'habit' && (
                          <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            onClick={() => handleCompleteHabit(task.id)}
                          >
                            Complete Habit
                          </Button>
                        )}

                        {task.type === 'chore' && (
                          <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            onClick={() => navigate('/chores')}
                          >
                            Go to Chores
                          </Button>
                        )}

                        {task.type === 'favor' && task.metadata.canAccept && (
                          <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            onClick={() => handleAcceptFavor(task.id)}
                          >
                            Accept Favor
                          </Button>
                        )}

                        {task.type === 'favor' && task.metadata.assigneeId === user?.id && (
                          <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            onClick={() => navigate('/kamehouse')}
                          >
                            Go to Family Hub
                          </Button>
                        )}

                        {task.type === 'room-task' && (
                          <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            onClick={() => navigate('/kamehouse')}
                          >
                            Go to Room
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Grid>

            {/* Completed Column */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  ✅ Completed ({completedTasks.length})
                </Typography>
              </Box>

              {completedTasks.length === 0 ? (
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">No completed tasks yet</Typography>
                </Card>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {completedTasks.map((task) => (
                    <Card
                      key={task.id}
                      sx={{
                        opacity: 0.7,
                        bgcolor: 'action.hover',
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Chip
                            icon={getTaskIcon(task.type)}
                            label={task.type.toUpperCase()}
                            size="small"
                            variant="outlined"
                          />
                        </Box>

                        <Typography variant="h6" fontWeight={600} sx={{ textDecoration: 'line-through' }}>
                          {task.title}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          {task.reward.xp && (
                            <Chip label={`+${task.reward.xp} XP`} size="small" />
                          )}
                          {task.reward.gold && (
                            <Chip label={`+${task.reward.gold} Gold`} size="small" />
                          )}
                          {task.reward.credits && (
                            <Chip label={`+${task.reward.credits} Credits`} size="small" />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        )}
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
