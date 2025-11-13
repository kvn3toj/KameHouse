import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  AccessTime as TimeIcon,
  TrendingUp as DifficultyIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { roomsApi, type TaskPreset } from '@/lib/rooms-api';

interface TaskPresetBrowserProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  roomType: string;
  onTaskAdded?: () => void;
}

export default function TaskPresetBrowser({
  open,
  onClose,
  roomId,
  roomType,
  onTaskAdded,
}: TaskPresetBrowserProps) {
  const [presets, setPresets] = useState<TaskPreset[]>([]);
  const [filteredPresets, setFilteredPresets] = useState<TaskPreset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addingPresetId, setAddingPresetId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadPresets();
    }
  }, [open, roomType]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = presets.filter(
        (preset) =>
          preset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          preset.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPresets(filtered);
    } else {
      setFilteredPresets(presets);
    }
  }, [searchQuery, presets]);

  const loadPresets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomsApi.getPresetsByRoomType(roomType);
      setPresets(data);
      setFilteredPresets(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar plantillas');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (presetId: string) => {
    try {
      setAddingPresetId(presetId);
      await roomsApi.createTaskFromPreset(roomId, presetId);

      if (onTaskAdded) {
        onTaskAdded();
      }

      // Show success feedback
      setTimeout(() => {
        setAddingPresetId(null);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error al agregar tarea');
      setAddingPresetId(null);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      CLEANING: 'primary',
      ORGANIZING: 'success',
      MAINTENANCE: 'warning',
      PLANTS: 'success',
      LAUNDRY: 'info',
      GARBAGE: 'error',
    };
    return colors[category] || 'default';
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" fontWeight={700}>
          Plantillas de Tareas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Selecciona tareas pre-configuradas para agregar a este espacio
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Search */}
        <TextField
          fullWidth
          placeholder="Buscar tareas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredPresets.length === 0 ? (
          <Alert severity="info">
            {searchQuery
              ? 'No se encontraron tareas con ese criterio de búsqueda'
              : 'No hay plantillas disponibles para este tipo de espacio'}
          </Alert>
        ) : (
          <Grid container spacing={2}>
            <AnimatePresence>
              {filteredPresets.map((preset, index) => (
                <Grid item xs={12} sm={6} key={preset.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        transition: 'all 0.2s',
                        border: addingPresetId === preset.id ? '2px solid' : '1px solid',
                        borderColor:
                          addingPresetId === preset.id ? 'success.main' : 'divider',
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'start', gap: 2, mb: 2 }}>
                          <Typography sx={{ fontSize: 32 }}>{preset.icon}</Typography>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                              {preset.title}
                            </Typography>
                            {preset.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {preset.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                          <Chip
                            label={getFrequencyLabel(preset.frequency)}
                            size="small"
                            color={getCategoryColor(preset.category) as any}
                          />
                          <Chip
                            icon={<TimeIcon />}
                            label={`${preset.estimatedMinutes} min`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            icon={<DifficultyIcon />}
                            label={`Dificultad ${preset.difficulty}`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip label={`+${preset.xpReward} XP`} size="small" color="primary" />
                            <Chip label={`+${preset.goldReward} Gold`} size="small" color="warning" />
                          </Box>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={addingPresetId === preset.id ? null : <AddIcon />}
                            onClick={() => handleAddTask(preset.id)}
                            disabled={!!addingPresetId}
                          >
                            {addingPresetId === preset.id ? '✓ Agregada' : 'Agregar'}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} size="large">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
