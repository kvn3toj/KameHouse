import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Checkbox,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';

interface RoomSelectionStepProps {
  onNext: (selectedRooms: string[]) => void;
  onBack: () => void;
}

interface RoomOption {
  id: string;
  name: string;
  icon: string;
  type: string;
  description: string;
}

const roomOptions: RoomOption[] = [
  {
    id: 'kitchen',
    name: 'Cocina',
    icon: '🍳',
    type: 'KITCHEN',
    description: '25 tareas disponibles',
  },
  {
    id: 'living-room',
    name: 'Sala',
    icon: '🛋️',
    type: 'LIVING_ROOM',
    description: '20 tareas disponibles',
  },
  {
    id: 'bathroom',
    name: 'Baño',
    icon: '🚿',
    type: 'BATHROOM',
    description: '20 tareas disponibles',
  },
  {
    id: 'bedroom',
    name: 'Recámara',
    icon: '🛏️',
    type: 'BEDROOM',
    description: '20 tareas disponibles',
  },
  {
    id: 'dining-room',
    name: 'Comedor',
    icon: '🍽️',
    type: 'DINING_ROOM',
    description: 'Personalizable',
  },
  {
    id: 'laundry',
    name: 'Lavandería',
    icon: '🧺',
    type: 'LAUNDRY_ROOM',
    description: '15 tareas disponibles',
  },
  {
    id: 'garage',
    name: 'Garage',
    icon: '🚗',
    type: 'GARAGE',
    description: '15 tareas disponibles',
  },
  {
    id: 'backyard',
    name: 'Jardín',
    icon: '🌳',
    type: 'BACKYARD',
    description: '20 tareas disponibles',
  },
  {
    id: 'office',
    name: 'Oficina',
    icon: '💼',
    type: 'HOME_OFFICE',
    description: '10 tareas disponibles',
  },
  {
    id: 'entryway',
    name: 'Entrada',
    icon: '🚪',
    type: 'ENTRYWAY',
    description: '10 tareas disponibles',
  },
];

export default function RoomSelectionStep({ onNext, onBack }: RoomSelectionStepProps) {
  const [selectedRooms, setSelectedRooms] = useState<string[]>([
    'kitchen',
    'living-room',
    'bathroom',
  ]); // Pre-select common rooms

  const toggleRoom = (roomId: string) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleNext = () => {
    if (selectedRooms.length === 0) {
      alert('Selecciona al menos un espacio para continuar');
      return;
    }
    onNext(selectedRooms);
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" gutterBottom fontWeight={700} textAlign="center">
        Selecciona tus Espacios
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        textAlign="center"
        sx={{ mb: 4 }}
      >
        Elige las habitaciones de tu hogar. Podrás agregar más después.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {roomOptions.map((room, index) => {
          const isSelected = selectedRooms.includes(room.id);

          return (
            <Grid item xs={6} sm={4} md={3} key={room.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  onClick={() => toggleRoom(room.id)}
                  sx={{
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s',
                    border: isSelected ? '3px solid' : '2px solid',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    bgcolor: isSelected
                      ? (theme) => alpha(theme.palette.primary.main, 0.08)
                      : 'background.paper',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Checkbox
                      checked={isSelected}
                      sx={{ position: 'absolute', top: 4, right: 4 }}
                    />
                    <Typography sx={{ fontSize: 40, mb: 1 }}>
                      {room.icon}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {room.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {room.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Button onClick={onBack} size="large">
          Atrás
        </Button>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {selectedRooms.length} {selectedRooms.length === 1 ? 'espacio seleccionado' : 'espacios seleccionados'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleNext}
          size="large"
          disabled={selectedRooms.length === 0}
        >
          Continuar
        </Button>
      </Box>
    </Box>
  );
}
