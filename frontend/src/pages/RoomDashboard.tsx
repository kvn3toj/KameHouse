import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Alert,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  EmojiEvents as TrophyIcon,
  CheckCircle as CheckIcon,
  Add as AddIcon,
  ViewList as ListIcon,
  CalendarMonth as CalendarIcon,
  LibraryBooks as TemplatesIcon,
  DoneAll as BulkIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { roomsApi, type Room, type RoomStats } from '@/lib/rooms-api';
import TaskPresetBrowser from '@/components/TaskPresetBrowser';
import TaskList from '@/components/TaskList';
import TaskEditor from '@/components/TaskEditor';
import TaskCalendarView from '@/components/TaskCalendarView';
import { RoomTemplatesLibrary } from '@/components/RoomTemplates/RoomTemplatesLibrary';
import { BulkOperationsDialog } from '@/components/BulkOperations/BulkOperationsDialog';
import { CategoryManager } from '@/components/Categories/CategoryManager';

export default function RoomDashboard() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  const [room, setRoom] = useState<Room | null>(null);
  const [stats, setStats] = useState<RoomStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPresetBrowser, setShowPresetBrowser] = useState(false);
  const [showTaskEditor, setShowTaskEditor] = useState(false);
  const [showTemplatesLibrary, setShowTemplatesLibrary] = useState(false);
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    loadRoomData();
  }, [roomId]);

  const loadRoomData = async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      setError(null);

      const [roomData, statsData] = await Promise.all([
        roomsApi.findOne(roomId),
        roomsApi.getStats(roomId),
      ]);

      setRoom(roomData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos del espacio');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error || !room || !stats) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'No se encontró el espacio'}
          </Alert>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/kamehouse')}
          >
            Volver a KameHouse
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      <Box sx={{ minHeight: '100vh', py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/kamehouse')}
            sx={{ mb: 2 }}
          >
            Volver a KameHouse
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
            <Typography sx={{ fontSize: 80 }}>{room.icon}</Typography>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" fontWeight={700} gutterBottom>
                {room.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<TrophyIcon />}
                  label={`Nivel ${stats.level}`}
                  color="primary"
                  sx={{ fontWeight: 700 }}
                />
                <Chip
                  label={`${stats.xp} XP`}
                  variant="outlined"
                  color="primary"
                />
                <Chip
                  label={`${stats.completionRate}% Completado`}
                  sx={{
                    bgcolor: 'success.light',
                    color: 'success.dark',
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* XP Progress */}
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  Progreso al Nivel {stats.level + 1}
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {stats.xp} / {stats.xpForNextLevel} XP
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={stats.progressToNextLevel}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 6,
                    bgcolor: 'white',
                  },
                }}
              />
              <Typography variant="caption" sx={{ mt: 0.5, display: 'block', opacity: 0.9 }}>
                {stats.progressToNextLevel.toFixed(1)}% completo
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={700} color="primary">
                  {stats.totalTasks}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Tareas Totales
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={700} color="success.main">
                  {stats.completedTasks}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Completadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={700} color="warning.main">
                  {stats.level}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Nivel Actual
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={700} color="error.main">
                  {stats.xp}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  XP Total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Category Manager */}
        {room && (
          <Box sx={{ mb: 4 }}>
            <CategoryManager householdId={room.householdId} />
          </Box>
        )}

        {/* Task Management Section */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" fontWeight={700}>
              📋 Tareas del Espacio
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {/* View Mode Toggle */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="list" aria-label="vista de lista">
                  <ListIcon />
                </ToggleButton>
                <ToggleButton value="calendar" aria-label="vista de calendario">
                  <CalendarIcon />
                </ToggleButton>
              </ToggleButtonGroup>

              <Button
                variant="outlined"
                size="small"
                startIcon={<BulkIcon />}
                onClick={() => setShowBulkOperations(true)}
              >
                Bulk Ops
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<TemplatesIcon />}
                onClick={() => setShowTemplatesLibrary(true)}
              >
                Templates
              </Button>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowTaskEditor(true)}
              >
                Crear Tarea
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowPresetBrowser(true)}
              >
                Desde Plantillas
              </Button>
            </Box>
          </Box>

          {/* Conditional View Rendering */}
          {viewMode === 'list' ? (
            <TaskList
              roomId={roomId!}
              householdId={room.householdId}
              onTaskComplete={() => {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);
                loadRoomData();
              }}
              onAddTask={() => setShowPresetBrowser(true)}
            />
          ) : (
            <TaskCalendarView roomId={roomId!} />
          )}
        </Box>
      </Box>

      {/* Task Preset Browser */}
      {room && (
        <TaskPresetBrowser
          open={showPresetBrowser}
          onClose={() => setShowPresetBrowser(false)}
          roomId={room.id}
          roomType={room.type}
          onTaskAdded={() => {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
            loadRoomData(); // Reload stats
          }}
        />
      )}

      {/* Task Editor */}
      {room && (
        <TaskEditor
          open={showTaskEditor}
          onClose={() => setShowTaskEditor(false)}
          roomId={room.id}
          householdId={room.householdId}
          onTaskCreated={() => {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
            loadRoomData(); // Reload stats
          }}
        />
      )}

      {/* Room Templates Library Dialog */}
      <Dialog
        open={showTemplatesLibrary}
        onClose={() => setShowTemplatesLibrary(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Room Templates Library</DialogTitle>
        <DialogContent>
          {room && (
            <RoomTemplatesLibrary
              householdId={room.householdId}
              onTemplateApplied={() => {
                setShowTemplatesLibrary(false);
                loadRoomData();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Operations Dialog */}
      {room && (
        <BulkOperationsDialog
          open={showBulkOperations}
          onClose={() => setShowBulkOperations(false)}
          householdId={room.householdId}
          onComplete={() => {
            setShowBulkOperations(false);
            loadRoomData();
          }}
        />
      )}
    </Container>
  );
}
