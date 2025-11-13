import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  CheckCircle as HabitIcon,
  CleaningServices as ChoreIcon,
  Handshake as FavorIcon,
  ArrowForward as ArrowIcon,
  AccessTime as ClockIcon,
  LocalFireDepartment as UrgentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { habitsApi } from '@/lib/habits-api';
import { getMyChores } from '@/lib/chores-api';
import { transactionsApi } from '@/lib/transactions-api';
import { householdApi } from '@/lib/household-api';
import { roomsApi } from '@/lib/rooms-api';
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
  metadata?: any;
}

/**
 * TodayTasksWidget - Unified view of daily priorities
 * Aggregates habits (due today), chores (assigned & incomplete), and favors (available)
 * Implements Moksart UX recommendations for task visibility
 */
export default function TodayTasksWidget() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<AggregatedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllTasks();
  }, []);

  const loadAllTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load habits, chores, household, and rooms in parallel
      const [habits, chores, household] = await Promise.all([
        habitsApi.getAll().catch(() => []),
        getMyChores().catch(() => []),
        householdApi.getMy().catch(() => null),
      ]);

      let transactions: Transaction[] = [];
      let rooms: any[] = [];
      let roomTasks: any[] = [];

      if (household) {
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

      // Aggregate and prioritize tasks
      const aggregated = aggregateTasks(habits, chores, transactions, roomTasks);
      setTasks(aggregated);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('Failed to load tasks');
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

    // Safety check - ensure all inputs are arrays
    const safeHabits = Array.isArray(habits) ? habits : [];
    const safeChores = Array.isArray(chores) ? chores : [];
    const safeTransactions = Array.isArray(transactions) ? transactions : [];
    const safeRoomTasks = Array.isArray(roomTasks) ? roomTasks : [];

    // Add today's incomplete habits
    const todayHabits = safeHabits.filter((habit) => {
      // Only show habits not completed today
      if (habit.completedToday) return false;
      return true;
    });

    todayHabits.forEach((habit) => {
      const baseXP = 10 + habit.difficulty * 5;
      const baseGold = 5 + habit.difficulty * 2;

      aggregated.push({
        id: habit.id,
        type: 'habit',
        title: habit.title,
        description: habit.description,
        urgency: habit.currentStreak >= 7 ? 'high' : 'medium', // High priority if maintaining streak
        dueInfo: habit.currentStreak > 0 ? `🔥 ${habit.currentStreak} day streak` : undefined,
        reward: {
          xp: baseXP,
          gold: baseGold,
        },
        metadata: habit,
      });
    });

    // Add incomplete chores
    const activeChores = safeChores.filter((chore) => !chore.isCompleted && chore.template);
    activeChores.forEach((chore) => {
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
          xp: chore.template.xpReward || 0,
          gold: chore.template.goldReward || 0,
          credits: chore.template.letsCredit || 0,
        },
        metadata: chore,
      });
    });

    // Add available favors (not assigned to user)
    const availableFavors = safeTransactions.filter((t) => t.canAccept);
    availableFavors.slice(0, 2).forEach((favor) => {
      // Only show top 2 to avoid overwhelming
      aggregated.push({
        id: favor.id,
        type: 'favor',
        title: favor.title,
        description: favor.description,
        urgency: 'low',
        dueInfo: `Requested by ${favor.requesterName}`,
        reward: {
          credits: favor.credits,
        },
        metadata: favor,
      });
    });

    // Add room tasks (show both assigned and unassigned)
    safeRoomTasks.forEach((task) => {
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
      });
    });

    // Sort by urgency: high → medium → low
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    aggregated.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    return aggregated.slice(0, 10); // Show top 10 tasks
  };

  const handleTaskAction = async (task: AggregatedTask) => {
    // Navigate to unified Tasks page for all task types
    navigate('/tasks');
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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
          color: 'white',
        }}
      >
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              ✨ You're All Caught Up!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              No tasks scheduled for today. Great job staying on top of things!
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
              <Button
                variant="contained"
                sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                onClick={() => navigate('/habits')}
              >
                Browse Habits
              </Button>
              <Button
                variant="outlined"
                sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'rgba(255,255,255,0.7)' } }}
                onClick={() => navigate('/kamehouse')}
              >
                Check Family Tasks
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        mb: 3,
        border: '2px solid',
        borderColor: 'primary.main',
        boxShadow: 3,
      }}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" component="h2" fontWeight={700}>
              🎯 Today's Priorities
            </Typography>
            <Chip
              label={`${tasks.length} tasks`}
              size="small"
              color="primary"
              sx={{ fontWeight: 700 }}
            />
          </Box>
          <Button
            variant="text"
            endIcon={<ArrowIcon />}
            onClick={() => navigate('/tasks')}
            sx={{ fontWeight: 600 }}
          >
            View All
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Complete these tasks to maintain your streaks and help your family
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Task List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tasks.map((task, index) => (
            <Box
              key={task.id}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: task.urgency === 'high' ? 'error.main' : 'divider',
                bgcolor: task.urgency === 'high' ? 'error.light' : 'background.paper',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateX(4px)',
                  boxShadow: 2,
                  borderColor: 'primary.main',
                },
                cursor: 'pointer',
              }}
              onClick={() => handleTaskAction(task)}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                {/* Left: Task Info */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {/* Urgency Badge */}
                    {task.urgency === 'high' && (
                      <Chip
                        icon={<UrgentIcon />}
                        label="URGENT"
                        size="small"
                        color="error"
                        sx={{ fontWeight: 700 }}
                      />
                    )}

                    {/* Type Badge */}
                    <Chip
                      icon={getTaskIcon(task.type)}
                      label={task.type.toUpperCase()}
                      size="small"
                      variant="outlined"
                      sx={{
                        bgcolor:
                          task.type === 'habit'
                            ? 'rgba(103, 58, 183, 0.1)'
                            : task.type === 'chore'
                            ? 'rgba(33, 150, 243, 0.1)'
                            : 'rgba(76, 175, 80, 0.1)',
                        borderColor:
                          task.type === 'habit'
                            ? 'primary.main'
                            : task.type === 'chore'
                            ? 'info.main'
                            : 'success.main',
                      }}
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

                  {/* Due Info / Streak */}
                  {task.dueInfo && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <ClockIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {task.dueInfo}
                      </Typography>
                    </Box>
                  )}

                  {/* Rewards */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {task.reward.xp && (
                      <Chip
                        label={`+${task.reward.xp} XP`}
                        size="small"
                        sx={{ bgcolor: 'success.light', fontWeight: 600 }}
                      />
                    )}
                    {task.reward.gold && (
                      <Chip
                        label={`+${task.reward.gold} Gold`}
                        size="small"
                        sx={{ bgcolor: 'warning.light', fontWeight: 600 }}
                      />
                    )}
                    {task.reward.credits && (
                      <Chip
                        label={`+${task.reward.credits} Credits`}
                        size="small"
                        sx={{ bgcolor: 'primary.light', fontWeight: 600 }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Right: Action Button */}
                <IconButton
                  color="primary"
                  sx={{
                    ml: 2,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTaskAction(task);
                  }}
                >
                  <ArrowIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Footer CTA */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            💡 Tip: Complete high-priority tasks first to maximize your daily impact
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
