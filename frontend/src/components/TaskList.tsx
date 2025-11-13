import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { roomsApi } from '@/lib/rooms-api';
import { TagFilter } from '@/components/Tags/TagFilter';

interface Task {
  id: string;
  title: string;
  description?: string;
  icon: string;
  difficulty: number;
  estimatedTime?: number;
  xpReward: number;
  goldReward: number;
  frequency: string;
  isActive: boolean;
}

interface TaskListProps {
  roomId: string;
  householdId?: string;
  onTaskComplete?: () => void;
  onAddTask?: () => void;
}

export default function TaskList({ roomId, householdId, onTaskComplete, onAddTask }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  useEffect(() => {
    loadTasks();
  }, [roomId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomsApi.getRoomTasks(roomId);
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return;

    try {
      await roomsApi.deleteTask(roomId, taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err: any) {
      setError(err.message || 'Error al eliminar tarea');
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      DAILY: 'Diaria',
      WEEKLY: 'Semanal',
      MONTHLY: 'Mensual',
      SEASONAL: 'Estacional',
    };
    return labels[frequency] || frequency;
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'success';
    if (difficulty <= 3) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
        {error}
      </Alert>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Typography sx={{ fontSize: 60, mb: 2 }}>📝</Typography>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            No hay tareas en este espacio
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Agrega tareas desde las plantillas o crea tus propias tareas personalizadas
          </Typography>
          {onAddTask && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={onAddTask}>
              Agregar Tarea
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tag Filter */}
      {householdId && (
        <Box sx={{ mb: 3 }}>
          <TagFilter
            householdId={householdId}
            selectedTagIds={selectedTagIds}
            onChange={setSelectedTagIds}
          />
        </Box>
      )}

      <Stack spacing={2}>
        <AnimatePresence>
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                sx={{
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                    {/* Icon */}
                    <Typography sx={{ fontSize: 40 }}>{task.icon}</Typography>

                    {/* Content */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {task.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteTask(task.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      {task.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {task.description}
                        </Typography>
                      )}

                      {/* Chips */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        <Chip
                          label={getFrequencyLabel(task.frequency)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={`Dificultad ${task.difficulty}/5`}
                          size="small"
                          color={getDifficultyColor(task.difficulty) as any}
                          variant="outlined"
                        />
                        {task.estimatedTime && (
                          <Chip label={`${task.estimatedTime} min`} size="small" variant="outlined" />
                        )}
                      </Box>

                      {/* Rewards & Action */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip label={`+${task.xpReward} XP`} size="small" color="primary" />
                          <Chip label={`+${task.goldReward} Gold`} size="small" color="warning" />
                        </Box>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckIcon />}
                          onClick={() => {
                            // TODO: Implement task completion via chores API
                            if (onTaskComplete) onTaskComplete();
                          }}
                        >
                          Completar
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </Stack>
    </Box>
  );
}
