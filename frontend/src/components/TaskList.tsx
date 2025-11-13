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
  Avatar,
  ToggleButtonGroup,
  ToggleButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Add as AddIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { roomsApi } from '@/lib/rooms-api';
import { TagFilter } from '@/components/Tags/TagFilter';
import { api } from '@/lib/api';

interface User {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
}

interface Assignment {
  id: string;
  assignedTo: string;
  user: User;
  isCompleted: boolean;
  weekStarting: string;
}

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
  assignments?: Assignment[];
}

interface TaskListProps {
  roomId: string;
  householdId?: string;
  onTaskComplete?: () => void;
  onAddTask?: () => void;
}

interface HouseholdMember {
  userId: string;
  username: string;
  displayName?: string;
  avatar?: string;
}

export default function TaskList({ roomId, householdId, onTaskComplete, onAddTask }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'mine'>('all');
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState<string>('all');
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [reassignMenuAnchor, setReassignMenuAnchor] = useState<{ element: HTMLElement | null; taskId: string | null }>({
    element: null,
    taskId: null,
  });
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    loadTasks();
    loadCurrentUser();
    if (householdId) {
      loadHouseholdMembers();
    }
  }, [roomId, householdId]);

  const loadCurrentUser = () => {
    const authUser = localStorage.getItem('auth_user');
    if (authUser) {
      try {
        const user = JSON.parse(authUser);
        setCurrentUserId(user.id);
      } catch (err) {
        console.error('Failed to parse auth_user:', err);
      }
    }
  };

  const loadHouseholdMembers = async () => {
    if (!householdId) return;
    try {
      const response = await api.get<{ members: HouseholdMember[] }>(`/household/${householdId}`);
      setHouseholdMembers(response.members || []);
    } catch (err) {
      console.error('Failed to load household members:', err);
    }
  };

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

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = async () => {
    if (!editingTask) return;

    try {
      await roomsApi.updateTask(roomId, editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
        icon: editingTask.icon,
        difficulty: editingTask.difficulty,
        estimatedTime: editingTask.estimatedTime,
        xpReward: editingTask.xpReward,
        goldReward: editingTask.goldReward,
        frequency: editingTask.frequency,
      });
      await loadTasks();
      handleCloseEditDialog();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar tarea');
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

  const handleReassignTask = async (taskId: string, newAssigneeId: string) => {
    try {
      // Get the current week's start date
      const now = new Date();
      const weekStarting = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());

      // Create assignment via backend API
      await api.post('/chores/assign/' + householdId, {
        assignments: [{
          choreId: taskId,
          userId: newAssigneeId,
          weekStarting: weekStarting.toISOString(),
        }],
      });

      // Reload tasks to reflect changes
      await loadTasks();
      setReassignMenuAnchor({ element: null, taskId: null });
    } catch (err: any) {
      setError(err.message || 'Error al reasignar tarea');
    }
  };

  const getFilteredTasks = () => {
    let filtered = tasks;

    // Filter by "My Tasks" view
    if (viewMode === 'mine' && currentUserId) {
      filtered = filtered.filter((task) =>
        task.assignments?.some((a) => a.assignedTo === currentUserId)
      );
    }

    // Filter by specific assignee
    if (selectedAssigneeFilter !== 'all') {
      if (selectedAssigneeFilter === 'unassigned') {
        filtered = filtered.filter((task) => !task.assignments || task.assignments.length === 0);
      } else {
        filtered = filtered.filter((task) =>
          task.assignments?.some((a) => a.assignedTo === selectedAssigneeFilter)
        );
      }
    }

    return filtered;
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

  const filteredTasks = getFilteredTasks();

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* View Mode Toggle & Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* My Tasks / All Tasks Toggle */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newMode) => newMode && setViewMode(newMode)}
          size="small"
        >
          <ToggleButton value="all">Todas las Tareas</ToggleButton>
          <ToggleButton value="mine">Mis Tareas</ToggleButton>
        </ToggleButtonGroup>

        {/* Assignee Filter */}
        {householdMembers.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filtrar por Responsable</InputLabel>
            <Select
              value={selectedAssigneeFilter}
              onChange={(e) => setSelectedAssigneeFilter(e.target.value)}
              label="Filtrar por Responsable"
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="unassigned">Sin Asignar</MenuItem>
              {householdMembers.map((member) => (
                <MenuItem key={member.userId} value={member.userId}>
                  {member.displayName || member.username}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

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
          {filteredTasks.map((task, index) => (
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
                          <IconButton size="small" color="primary" onClick={() => handleEditTask(task)}>
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

                      {/* Assigned Person */}
                      {task.assignments && task.assignments.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {task.assignments[0].user.avatar && (
                              <Avatar
                                src={task.assignments[0].user.avatar}
                                sx={{ width: 24, height: 24 }}
                              />
                            )}
                            <Typography variant="body2" color="text.secondary">
                              Asignado a: {task.assignments[0].user.displayName || task.assignments[0].user.username}
                            </Typography>
                          </Box>
                          {householdMembers.length > 0 && (
                            <IconButton
                              size="small"
                              onClick={(e) => setReassignMenuAnchor({ element: e.currentTarget, taskId: task.id })}
                            >
                              <PersonAddIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      )}
                      {(!task.assignments || task.assignments.length === 0) && householdMembers.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Sin asignar
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => setReassignMenuAnchor({ element: e.currentTarget, taskId: task.id })}
                          >
                            <PersonAddIcon fontSize="small" />
                          </IconButton>
                        </Box>
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

      {/* Reassignment Menu */}
      <Menu
        anchorEl={reassignMenuAnchor.element}
        open={Boolean(reassignMenuAnchor.element)}
        onClose={() => setReassignMenuAnchor({ element: null, taskId: null })}
      >
        <MenuItem disabled>
          <Typography variant="caption" color="text.secondary">
            Asignar a:
          </Typography>
        </MenuItem>
        {householdMembers.map((member) => (
          <MenuItem
            key={member.userId}
            onClick={() => {
              if (reassignMenuAnchor.taskId) {
                handleReassignTask(reassignMenuAnchor.taskId, member.userId);
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {member.avatar && (
                <Avatar src={member.avatar} sx={{ width: 24, height: 24 }} />
              )}
              <Typography>{member.displayName || member.username}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Edit Task Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Tarea</DialogTitle>
        <DialogContent>
          {editingTask && (
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Título"
                fullWidth
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              />
              <TextField
                label="Descripción"
                fullWidth
                multiline
                rows={3}
                value={editingTask.description || ''}
                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
              />
              <TextField
                label="Icono"
                fullWidth
                value={editingTask.icon}
                onChange={(e) => setEditingTask({ ...editingTask, icon: e.target.value })}
              />
              <Box>
                <Typography gutterBottom>Dificultad: {editingTask.difficulty}/5</Typography>
                <Slider
                  value={editingTask.difficulty}
                  onChange={(_, value) => setEditingTask({ ...editingTask, difficulty: value as number })}
                  min={1}
                  max={5}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>
              <TextField
                label="Tiempo Estimado (minutos)"
                type="number"
                fullWidth
                value={editingTask.estimatedTime || ''}
                onChange={(e) => setEditingTask({ ...editingTask, estimatedTime: parseInt(e.target.value) || 0 })}
              />
              <TextField
                label="Recompensa XP"
                type="number"
                fullWidth
                value={editingTask.xpReward}
                onChange={(e) => setEditingTask({ ...editingTask, xpReward: parseInt(e.target.value) || 0 })}
              />
              <TextField
                label="Recompensa Gold"
                type="number"
                fullWidth
                value={editingTask.goldReward}
                onChange={(e) => setEditingTask({ ...editingTask, goldReward: parseInt(e.target.value) || 0 })}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancelar</Button>
          <Button onClick={handleSaveTask} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
