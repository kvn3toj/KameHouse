import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface TaskPresetsStepProps {
  householdId: string;
  selectedRooms: string[];
  onNext: (createdRooms: any[]) => void;
  onBack: () => void;
}

const roomTypeMap: Record<string, string> = {
  'kitchen': 'KITCHEN',
  'living-room': 'LIVING_ROOM',
  'bathroom': 'BATHROOM',
  'bedroom': 'BEDROOM',
  'dining-room': 'DINING_ROOM',
  'laundry': 'LAUNDRY_ROOM',
  'garage': 'GARAGE',
  'backyard': 'BACKYARD',
  'office': 'HOME_OFFICE',
  'entryway': 'ENTRYWAY',
};

const roomNameMap: Record<string, string> = {
  'kitchen': 'Cocina',
  'living-room': 'Sala',
  'bathroom': 'Baño',
  'bedroom': 'Recámara',
  'dining-room': 'Comedor',
  'laundry': 'Lavandería',
  'garage': 'Garage',
  'backyard': 'Jardín',
  'office': 'Oficina',
  'entryway': 'Entrada',
};

const roomIconMap: Record<string, string> = {
  'kitchen': '🍳',
  'living-room': '🛋️',
  'bathroom': '🚿',
  'bedroom': '🛏️',
  'dining-room': '🍽️',
  'laundry': '🧺',
  'garage': '🚗',
  'backyard': '🌳',
  'office': '💼',
  'entryway': '🚪',
};

export default function TaskPresetsStep({
  householdId,
  selectedRooms,
  onNext,
  onBack,
}: TaskPresetsStepProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentRoom, setCurrentRoom] = useState('');
  const [createdRooms, setCreatedRooms] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    createRoomsWithPresets();
  }, []);

  const createRoomsWithPresets = async () => {
    setLoading(true);
    setError(null);
    const rooms: any[] = [];

    try {
      const token = localStorage.getItem('auth_token');

      for (let i = 0; i < selectedRooms.length; i++) {
        const roomId = selectedRooms[i];
        setCurrentRoom(roomNameMap[roomId]);
        setProgress(((i + 1) / selectedRooms.length) * 100);

        // Create room
        const roomResponse = await fetch('http://localhost:3000/api/rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            householdId,
            name: roomNameMap[roomId],
            type: roomTypeMap[roomId],
            icon: roomIconMap[roomId],
            order: i,
          }),
        });

        if (!roomResponse.ok) {
          throw new Error(`Failed to create room: ${roomNameMap[roomId]}`);
        }

        const room = await roomResponse.json();
        rooms.push(room);

        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setCreatedRooms(rooms);
      setCompleted(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Error al crear espacios');
      setLoading(false);
    }
  };

  const handleNext = () => {
    onNext(createdRooms);
  };

  return (
    <Box sx={{ py: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Configurando tus Espacios
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Estamos cargando las tareas pre-configuradas para cada habitación...
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
        {loading && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <CircularProgress size={60} />
            </Box>
            <Typography variant="body1" color="primary" fontWeight={600} sx={{ mb: 2 }}>
              Creando: {currentRoom}
            </Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
            <Typography variant="caption" color="text.secondary">
              {Math.round(progress)}% completado
            </Typography>
          </>
        )}

        {completed && !error && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            <Box>
              <CheckCircleIcon
                sx={{ fontSize: 80, color: 'success.main', mb: 2 }}
              />
              <Typography variant="h5" fontWeight={600} color="success.main" gutterBottom>
                ¡Espacios Creados!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {createdRooms.length} espacios configurados con tareas listas para usar
              </Typography>

              <Box sx={{ textAlign: 'left', maxWidth: 300, mx: 'auto' }}>
                {createdRooms.map((room, index) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        py: 1,
                      }}
                    >
                      <Typography sx={{ fontSize: 24 }}>{room.icon}</Typography>
                      <Typography variant="body1">{room.name}</Typography>
                      <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main', ml: 'auto' }} />
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </Box>
          </motion.div>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button onClick={onBack} disabled={loading} size="large">
          Atrás
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!completed || loading}
          size="large"
        >
          Continuar
        </Button>
      </Box>
    </Box>
  );
}
