import { Box, Typography, Button, Card, CardContent, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

interface FirstMissionStepProps {
  rooms: any[];
  onNext: () => void;
  onBack: () => void;
}

export default function FirstMissionStep({ rooms, onNext, onBack }: FirstMissionStepProps) {
  // Get the first room (usually kitchen)
  const firstRoom = rooms[0];

  return (
    <Box sx={{ py: 4, textAlign: 'center' }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            bgcolor: (theme) => theme.palette.warning.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 3,
          }}
        >
          <RocketLaunchIcon sx={{ fontSize: 50, color: 'white' }} />
        </Box>
      </motion.div>

      <Typography variant="h4" gutterBottom fontWeight={700}>
        ¡Tu Primera Misión!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
        Para comenzar tu aventura en KameHouse, completa tu primera tarea.
        Gana XP, sube de nivel y celebra el inicio de tu hogar organizado.
      </Typography>

      <Card
        sx={{
          maxWidth: 500,
          mx: 'auto',
          mb: 4,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.success.main}15 100%)`,
          border: '2px solid',
          borderColor: 'primary.main',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography sx={{ fontSize: 48 }}>{firstRoom?.icon || '🏠'}</Typography>
            <Box sx={{ textAlign: 'left', flex: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                Explora {firstRoom?.name || 'tu primer espacio'}
              </Typography>
              <Chip
                label="Primera Misión"
                color="primary"
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'left' }}>
            Ve a tu {firstRoom?.name || 'primer espacio'} y selecciona una tarea simple para comenzar.
            Puede ser algo rápido como "Limpiar encimera" o "Ordenar objetos".
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Chip label="+15 XP" color="success" />
            <Chip label="+10 Gold" color="warning" />
            <Chip label="Logro Desbloqueado" color="primary" />
          </Box>
        </CardContent>
      </Card>

      <Box
        sx={{
          bgcolor: (theme) => theme.palette.warning.light + '20',
          borderRadius: 2,
          p: 2,
          maxWidth: 500,
          mx: 'auto',
          mb: 4,
        }}
      >
        <Typography variant="body2" fontWeight={600} color="warning.dark">
          💡 Consejo: Las tareas diarias son perfectas para comenzar
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack} size="large">
          Atrás
        </Button>
        <Button variant="contained" onClick={onNext} size="large">
          ¡Entendido, Vamos!
        </Button>
      </Box>
    </Box>
  );
}
