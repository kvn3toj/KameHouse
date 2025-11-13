import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Typography,
  Box,
  Grid,
  Alert,
  Avatar,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import { roomsApi } from '@/lib/rooms-api';
import { TagInput } from '@/components/Tags/TagInput';
import { api } from '@/lib/api';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface HouseholdMember {
  id: string;
  userId: string;
  username: string;
  displayName?: string;
  avatar?: string;
  role: string;
  nickname?: string;
}

interface TaskEditorProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  householdId?: string;
  onTaskCreated?: () => void;
}

const FREQUENCY_OPTIONS = [
  { value: 'DAILY', label: 'Diaria' },
  { value: 'WEEKLY', label: 'Semanal' },
  { value: 'MONTHLY', label: 'Mensual' },
  { value: 'SEASONAL', label: 'Estacional' },
];

const ICON_OPTIONS = ['🧹', '🧽', '🧺', '🗑️', '🧴', '🪥', '🚿', '🛁', '🍽️', '🍳', '🧊', '🌱', '💡', '🔧', '🪛'];

export default function TaskEditor({ open, onClose, roomId, householdId, onTaskCreated }: TaskEditorProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '🧹',
    frequency: 'WEEKLY',
    difficulty: 3,
    estimatedMinutes: 30,
    xpReward: 20,
    goldReward: 10,
  });
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (householdId && open) {
      loadHouseholdMembers();
    }
  }, [householdId, open]);

  const loadHouseholdMembers = async () => {
    if (!householdId) return;

    try {
      const response = await api.get<{ members: HouseholdMember[] }>(`/household/${householdId}`);
      setHouseholdMembers(response.members || []);
    } catch (err) {
      console.error('Failed to load household members:', err);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('El título es requerido');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const taskData = {
        ...formData,
        ...(selectedAssignee && { assignedTo: selectedAssignee }),
      };

      await roomsApi.createCustomTask(roomId, taskData);

      if (onTaskCreated) {
        onTaskCreated();
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        icon: '🧹',
        frequency: 'WEEKLY',
        difficulty: 3,
        estimatedMinutes: 30,
        xpReward: 20,
        goldReward: 10,
      });
      setSelectedTags([]);
      setSelectedAssignee('');

      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear tarea');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" fontWeight={700}>
          Crear Tarea Personalizada
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Ej: Limpiar el baño"
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                placeholder="Describe los detalles de la tarea..."
              />
            </Grid>

            {/* Tags */}
            {householdId && (
              <Grid item xs={12}>
                <TagInput
                  householdId={householdId}
                  selectedTags={selectedTags}
                  onChange={setSelectedTags}
                />
              </Grid>
            )}

            {/* Assigned To */}
            {householdId && householdMembers.length > 0 && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Responsable</InputLabel>
                  <Select
                    value={selectedAssignee}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                    label="Responsable"
                  >
                    <MenuItem value="">
                      <em>Sin asignar</em>
                    </MenuItem>
                    {householdMembers.map((member) => (
                      <MenuItem key={member.userId} value={member.userId}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {member.avatar && (
                            <Avatar
                              src={member.avatar}
                              sx={{ width: 24, height: 24 }}
                            />
                          )}
                          <Typography>
                            {member.displayName || member.nickname || member.username}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Icon */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Icono</InputLabel>
                <Select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  label="Icono"
                >
                  {ICON_OPTIONS.map((icon) => (
                    <MenuItem key={icon} value={icon}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: 24 }}>{icon}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Frequency */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Frecuencia</InputLabel>
                <Select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  label="Frecuencia"
                >
                  {FREQUENCY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Difficulty */}
            <Grid item xs={12}>
              <Typography gutterBottom>Dificultad: {formData.difficulty}/5</Typography>
              <Slider
                value={formData.difficulty}
                onChange={(_, value) => setFormData({ ...formData, difficulty: value as number })}
                min={1}
                max={5}
                marks
                step={1}
                valueLabelDisplay="auto"
              />
            </Grid>

            {/* Estimated Time */}
            <Grid item xs={12}>
              <Typography gutterBottom>Tiempo Estimado: {formData.estimatedMinutes} minutos</Typography>
              <Slider
                value={formData.estimatedMinutes}
                onChange={(_, value) => setFormData({ ...formData, estimatedMinutes: value as number })}
                min={5}
                max={120}
                step={5}
                valueLabelDisplay="auto"
              />
            </Grid>

            {/* XP Reward */}
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Recompensa XP: {formData.xpReward}</Typography>
              <Slider
                value={formData.xpReward}
                onChange={(_, value) => setFormData({ ...formData, xpReward: value as number })}
                min={10}
                max={100}
                step={5}
                valueLabelDisplay="auto"
                color="primary"
              />
            </Grid>

            {/* Gold Reward */}
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Recompensa Gold: {formData.goldReward}</Typography>
              <Slider
                value={formData.goldReward}
                onChange={(_, value) => setFormData({ ...formData, goldReward: value as number })}
                min={5}
                max={50}
                step={5}
                valueLabelDisplay="auto"
                color="warning"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creando...' : 'Crear Tarea'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
