import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Stack,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Notifications as BellIcon,
} from '@mui/icons-material';
import { notificationsApi, type NotificationPreferences } from '@/lib/notifications-api';

export default function NotificationSettings() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getPreferences();
      setPreferences(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar preferencias');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      setError(null);
      await notificationsApi.updatePreferences(preferences);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar preferencias');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (field: keyof NotificationPreferences) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [field]: !preferences[field],
    });
  };

  const handleTimeChange = (field: 'quietHoursStart' | 'quietHoursEnd' | 'digestTime', value: string) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [field]: value,
    });
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (!preferences) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">Error al cargar preferencias de notificaciones</Alert>
          <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
            Volver
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
            Volver
          </Button>

          <Typography variant="h3" fontWeight={700} gutterBottom>
            🔔 Configuración de Notificaciones
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Personaliza cómo y cuándo recibes notificaciones
          </Typography>
        </Box>

        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Preferencias guardadas correctamente
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Notification Channels */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📡 Canales de Notificación
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Elige cómo quieres recibir notificaciones
          </Typography>

          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.enableInApp}
                  onChange={() => handleToggle('enableInApp')}
                  color="primary"
                />
              }
              label="Notificaciones en la app"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.enablePush}
                  onChange={() => handleToggle('enablePush')}
                  color="primary"
                />
              }
              label="Notificaciones push del navegador"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.enableEmail}
                  onChange={() => handleToggle('enableEmail')}
                  color="primary"
                  disabled
                />
              }
              label="Notificaciones por email (próximamente)"
            />
          </FormGroup>
        </Paper>

        {/* Notification Types */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📋 Tipos de Notificación
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selecciona qué tipos de notificaciones quieres recibir
          </Typography>

          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.taskAssignments}
                  onChange={() => handleToggle('taskAssignments')}
                  color="primary"
                />
              }
              label="Asignación de tareas nuevas"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.taskReminders}
                  onChange={() => handleToggle('taskReminders')}
                  color="primary"
                />
              }
              label="Recordatorios de tareas (vencimiento próximo/vencidas)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.taskCompletions}
                  onChange={() => handleToggle('taskCompletions')}
                  color="primary"
                />
              }
              label="Tareas completadas"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.choreRotations}
                  onChange={() => handleToggle('choreRotations')}
                  color="primary"
                />
              }
              label="Rotación semanal de tareas"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.favorRequests}
                  onChange={() => handleToggle('favorRequests')}
                  color="primary"
                />
              }
              label="Solicitudes de favores (LETS)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.achievements}
                  onChange={() => handleToggle('achievements')}
                  color="primary"
                />
              }
              label="Logros y subidas de nivel"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.announcements}
                  onChange={() => handleToggle('announcements')}
                  color="primary"
                />
              }
              label="Anuncios del hogar"
            />
          </FormGroup>
        </Paper>

        {/* Quiet Hours */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            🌙 Horas de Silencio
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Define un período en el que no recibirás notificaciones
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={preferences.enableQuietHours}
                onChange={() => handleToggle('enableQuietHours')}
                color="primary"
              />
            }
            label="Activar horas de silencio"
            sx={{ mb: 2 }}
          />

          {preferences.enableQuietHours && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Inicio"
                type="time"
                value={preferences.quietHoursStart || '22:00'}
                onChange={(e) => handleTimeChange('quietHoursStart', e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
              <TextField
                label="Fin"
                type="time"
                value={preferences.quietHoursEnd || '08:00'}
                onChange={(e) => handleTimeChange('quietHoursEnd', e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
            </Box>
          )}
        </Paper>

        {/* Daily Digest */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📬 Resumen Diario
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Recibe un resumen de notificaciones una vez al día
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={preferences.enableDailyDigest}
                onChange={() => handleToggle('enableDailyDigest')}
                color="primary"
                disabled
              />
            }
            label="Activar resumen diario (próximamente)"
            sx={{ mb: 2 }}
          />

          {preferences.enableDailyDigest && (
            <TextField
              label="Hora del resumen"
              type="time"
              value={preferences.digestTime || '09:00'}
              onChange={(e) => handleTimeChange('digestTime', e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              disabled
            />
          )}
        </Paper>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            Guardar Cambios
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
