import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import HomeIcon from '@mui/icons-material/Home';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: (theme) => theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 3,
          }}
        >
          <HomeIcon sx={{ fontSize: 60, color: 'white' }} />
        </Box>
      </motion.div>

      <Typography variant="h3" gutterBottom fontWeight={700} sx={{ mb: 2 }}>
        ¡Bienvenido a KameHouse!
      </Typography>

      <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
        Tu hogar fluye cuando colaboras. Vamos a configurar tu espacio en solo 4 pasos.
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Box sx={{ textAlign: 'center', maxWidth: 200 }}>
            <HomeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="body1" fontWeight={600}>
              Organiza por Espacios
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Selecciona tus habitaciones
            </Typography>
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Box sx={{ textAlign: 'center', maxWidth: 200 }}>
            <EmojiEventsIcon sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
            <Typography variant="body1" fontWeight={600}>
              Tareas Pre-configuradas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              150+ presets listos
            </Typography>
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', maxWidth: 200 }}>
            <GroupsIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="body1" fontWeight={600}>
              Colabora en Familia
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Juntos es más fácil
            </Typography>
          </Box>
        </motion.div>
      </Box>

      <Button
        variant="contained"
        size="large"
        onClick={onNext}
        sx={{
          px: 6,
          py: 2,
          fontSize: '1.1rem',
          mt: 2,
        }}
      >
        Comenzar Configuración
      </Button>
    </Box>
  );
}
