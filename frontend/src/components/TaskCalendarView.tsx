import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
} from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import { roomsApi } from '@/lib/rooms-api';

interface Task {
  id: string;
  title: string;
  icon: string;
  status: string;
  scheduledAt?: string;
  dueDate?: string;
  xpReward: number;
  goldReward: number;
}

interface TaskCalendarViewProps {
  roomId: string;
}

export default function TaskCalendarView({ roomId }: TaskCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [currentMonth, roomId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const startDate = currentMonth.startOf('month').toISOString();
      const endDate = currentMonth.endOf('month').toISOString();

      const data = await roomsApi.getScheduledTasks(roomId, startDate, endDate);
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'));
  };

  const getTasksForDate = (date: Dayjs): Task[] => {
    return tasks.filter((task) => {
      if (!task.scheduledAt) return false;
      const taskDate = dayjs(task.scheduledAt);
      return taskDate.isSame(date, 'day');
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'overdue':
        return 'error';
      case 'in_progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  const renderCalendarDays = () => {
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');
    const startDate = startOfMonth.startOf('week');
    const endDate = endOfMonth.endOf('week');

    const days: JSX.Element[] = [];
    let currentDate = startDate;

    while (currentDate.isBefore(endDate)) {
      const date = currentDate;
      const isCurrentMonth = date.month() === currentMonth.month();
      const isToday = date.isSame(dayjs(), 'day');
      const dayTasks = getTasksForDate(date);
      const hasTask = dayTasks.length > 0;

      days.push(
        <Grid item xs={12 / 7} key={date.format('YYYY-MM-DD')}>
          <Card
            onClick={() => setSelectedDate(date)}
            sx={{
              minHeight: 80,
              cursor: 'pointer',
              bgcolor: isCurrentMonth ? 'background.paper' : 'grey.50',
              border: isToday ? 2 : 0,
              borderColor: 'primary.main',
              '&:hover': {
                boxShadow: 2,
              },
            }}
          >
            <CardContent sx={{ p: 1 }}>
              <Typography
                variant="body2"
                fontWeight={isToday ? 700 : 400}
                color={isCurrentMonth ? 'text.primary' : 'text.disabled'}
              >
                {date.date()}
              </Typography>
              {hasTask && (
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={dayTasks.length}
                    size="small"
                    color="primary"
                    sx={{ height: 16, fontSize: 10 }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      );

      currentDate = currentDate.add(1, 'day');
    }

    return days;
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <Box>
      {/* Calendar Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <IconButton onClick={handlePrevMonth}>
          <PrevIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          {currentMonth.format('MMMM YYYY')}
        </Typography>
        <IconButton onClick={handleNextMonth}>
          <NextIcon />
        </IconButton>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Day Headers */}
          <Grid container spacing={1} sx={{ mb: 1 }}>
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <Grid item xs={12 / 7} key={day}>
                <Typography variant="caption" fontWeight={600} sx={{ display: 'block', textAlign: 'center' }}>
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Calendar Grid */}
          <Grid container spacing={1}>
            {renderCalendarDays()}
          </Grid>

          {/* Selected Date Tasks */}
          {selectedDate && (
            <Paper elevation={2} sx={{ mt: 3, p: 2 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                📋 Tareas para {selectedDate.format('D [de] MMMM')}
              </Typography>

              {selectedDateTasks.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No hay tareas programadas para este día
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {selectedDateTasks.map((task) => (
                    <Card key={task.id} variant="outlined">
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                          <Typography sx={{ fontSize: 24 }}>{task.icon}</Typography>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight={600}>
                              {task.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Chip
                                label={task.status}
                                size="small"
                                color={getStatusColor(task.status) as any}
                              />
                              <Chip label={`+${task.xpReward} XP`} size="small" color="primary" />
                              <Chip label={`+${task.goldReward} Gold`} size="small" color="warning" />
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}
