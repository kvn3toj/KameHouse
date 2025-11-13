import { Card, CardContent, Box, Typography, LinearProgress, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Room } from '@/lib/rooms-api';

interface RoomCardProps {
  room: Room;
  index?: number;
}

export default function RoomCard({ room, index = 0 }: RoomCardProps) {
  const navigate = useNavigate();

  const xpForNextLevel = (room.level + 1) * 100;
  const progress = (room.xp / xpForNextLevel) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        onClick={() => navigate(`/rooms/${room.id}`)}
        sx={{
          cursor: 'pointer',
          transition: 'all 0.3s',
          border: '2px solid',
          borderColor: 'divider',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: 6,
            borderColor: 'primary.main',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Icon and Level */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
            <Typography sx={{ fontSize: 48 }}>{room.icon}</Typography>
            <Chip
              label={`Nv. ${room.level}`}
              color="primary"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Box>

          {/* Room Name */}
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {room.name}
          </Typography>

          {/* XP Progress */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Progreso
              </Typography>
              <Typography variant="caption" color="primary" fontWeight={600}>
                {room.xp} / {xpForNextLevel} XP
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(0, 0, 0, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: (theme) =>
                    `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
                },
              }}
            />
          </Box>

          {/* Description */}
          {room.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {room.description}
            </Typography>
          )}

          {/* Stats Footer */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`${Math.round(progress)}% Completo`}
              size="small"
              sx={{
                bgcolor: 'success.light',
                color: 'success.dark',
                fontWeight: 600,
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}
