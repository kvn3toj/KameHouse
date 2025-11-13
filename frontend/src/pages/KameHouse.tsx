import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Home as HouseIcon,
  Add as AddIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { householdApi } from '@/lib/household-api';
import { roomsApi, type Room } from '@/lib/rooms-api';
import RoomCard from '@/components/RoomCard';
import type { Household } from '@/types/household';

export default function KameHouse() {
  const navigate = useNavigate();

  const [household, setHousehold] = useState<Household | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const householdData = await householdApi.getMy();
      setHousehold(householdData);

      if (householdData?.id) {
        const roomsData = await roomsApi.findByHousehold(householdData.id);
        setRooms(roomsData);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar KameHouse');
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

  if (!household) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            No tienes un hogar configurado aún
          </Alert>
          <Button
            variant="contained"
            startIcon={<HouseIcon />}
            onClick={() => navigate('/dashboard')}
          >
            Volver al Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <HouseIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" fontWeight={700} gutterBottom>
                  {household.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<PeopleIcon />}
                    label={`${household.memberCount} Miembros`}
                    variant="outlined"
                  />
                  <Chip label={`${rooms.length} Espacios`} color="primary" />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => navigate('/settings/household')}
                >
                  Settings
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
              </Box>
            </Box>

            {household.description && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {household.description}
              </Typography>
            )}
          </motion.div>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Rooms Grid */}
        {rooms.length > 0 ? (
          <>
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
              🏠 Tus Espacios
            </Typography>
            <Grid container spacing={3}>
              {rooms.map((room, index) => (
                <Grid item xs={12} sm={6} md={4} key={room.id}>
                  <RoomCard room={room} index={index} />
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Card
            sx={{
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.success.main}15 100%)`,
              border: '2px dashed',
              borderColor: 'primary.main',
            }}
          >
            <CardContent sx={{ py: 6, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 60, mb: 2 }}>🏠</Typography>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                No hay espacios configurados
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                Completa el onboarding para configurar los espacios de tu hogar y comenzar a organizar tus tareas por habitación.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => {
                  // Trigger onboarding again
                  localStorage.setItem('household-just-created', 'true');
                  localStorage.removeItem('kh_onboarding_complete');
                  navigate('/dashboard');
                }}
              >
                Configurar Espacios
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={() => navigate('/family')}
                sx={{ py: 2 }}
              >
                Ver Leaderboard
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={() => navigate('/templo')}
                sx={{ py: 2 }}
              >
                LETS Economy
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={() => navigate('/bulletin')}
                sx={{ py: 2 }}
              >
                Tablón de Anuncios
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
