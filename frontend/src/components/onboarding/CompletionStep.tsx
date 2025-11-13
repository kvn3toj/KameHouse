import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import CelebrationIcon from '@mui/icons-material/Celebration';

interface CompletionStepProps {
  onFinish: () => void;
}

export default function CompletionStep({ onFinish }: CompletionStepProps) {
  const { width, height } = useWindowSize();

  return (
    <Box sx={{ py: 4, textAlign: 'center', position: 'relative' }}>
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={200}
        gravity={0.3}
      />

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
      >
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: (theme) => theme.palette.success.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 3,
          }}
        >
          <CelebrationIcon sx={{ fontSize: 60, color: 'white' }} />
        </Box>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Typography variant="h3" gutterBottom fontWeight={700} color="success.main">
          ¡Configuración Completa!
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
        >
          Tu hogar está listo para fluir. Ahora puedes comenzar a organizar,
          colaborar y celebrar cada logro con tu familia.
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            justifyContent: 'center',
            flexWrap: 'wrap',
            mb: 4,
          }}
        >
          <Box
            sx={{
              bgcolor: (theme) => theme.palette.primary.main + '15',
              borderRadius: 3,
              p: 3,
              minWidth: 150,
            }}
          >
            <Typography variant="h4" fontWeight={700} color="primary">
              🏠
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Espacios Listos
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: (theme) => theme.palette.success.main + '15',
              borderRadius: 3,
              p: 3,
              minWidth: 150,
            }}
          >
            <Typography variant="h4" fontWeight={700} color="success.main">
              ✨
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              150+ Tareas
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: (theme) => theme.palette.warning.main + '15',
              borderRadius: 3,
              p: 3,
              minWidth: 150,
            }}
          >
            <Typography variant="h4" fontWeight={700} color="warning.main">
              🎮
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Gamificación
            </Typography>
          </Box>
        </Box>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={onFinish}
          sx={{
            px: 6,
            py: 2,
            fontSize: '1.2rem',
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
          }}
        >
          Ir a Mi Dashboard
        </Button>
      </motion.div>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
        Recuerda: Tu hogar fluye cuando colaboras 🌊
      </Typography>
    </Box>
  );
}
