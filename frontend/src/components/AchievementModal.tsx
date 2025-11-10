import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import { Close as CloseIcon, EmojiEvents as TrophyIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import type { Achievement } from '@/types/achievement';

interface AchievementModalProps {
  achievement: Achievement | null;
  open: boolean;
  onClose: () => void;
}

// Rarity colors based on achievement category
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'level':
      return '#FF9800'; // Legendary orange
    case 'habits':
      return '#9C27B0'; // Epic purple
    case 'streak':
      return '#2196F3'; // Rare blue
    case 'completions':
      return '#4CAF50'; // Common green
    default:
      return '#9E9E9E'; // Default gray
  }
};

// Particle component for celebration effect
const Particle = ({ delay, angle }: { delay: number; angle: number }) => {
  const distance = 200;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;

  return (
    <motion.div
      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      animate={{
        opacity: 0,
        x,
        y,
        scale: 0,
      }}
      transition={{
        duration: 1.5,
        delay,
        ease: 'easeOut',
      }}
      style={{
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        pointerEvents: 'none',
      }}
    />
  );
};

/**
 * Achievement unlock celebration modal
 *
 * Features:
 * - Spectacular particle animations
 * - Category-based color gradients
 * - Rotating trophy icon
 * - Auto-dismiss after 5 seconds
 * - Fully accessible with ARIA labels
 */
export default function AchievementModal({
  achievement,
  open,
  onClose,
}: AchievementModalProps) {
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (open) {
      setShowParticles(true);
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowParticles(false);
    }
  }, [open, onClose]);

  if (!achievement) return null;

  const categoryColor = getCategoryColor(achievement.category);

  // Generate particles in a circle pattern
  const particleCount = 20;
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    angle: (Math.PI * 2 * i) / particleCount,
    delay: i * 0.05,
  }));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'visible',
        },
      }}
    >
      <DialogContent sx={{ position: 'relative', overflow: 'visible', p: 4 }}>
        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'text.secondary',
          }}
          aria-label="Close achievement"
        >
          <CloseIcon />
        </IconButton>

        {/* Particle celebration effect */}
        <AnimatePresence>
          {showParticles && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
              }}
            >
              {particles.map((particle, i) => (
                <Particle key={i} angle={particle.angle} delay={particle.delay} />
              ))}
            </Box>
          )}
        </AnimatePresence>

        {/* Achievement content */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 2,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Trophy icon with rotation animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              duration: 0.6,
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${categoryColor}40 0%, ${categoryColor}80 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <TrophyIcon
                sx={{
                  fontSize: 64,
                  color: categoryColor,
                }}
              />

              {/* Rotating stars around trophy */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: i * 0.3,
                  }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -60,
                      fontSize: 20,
                    }}
                  >
                    ⭐
                  </Box>
                </motion.div>
              ))}
            </Box>
          </motion.div>

          {/* Achievement unlocked text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Typography
              variant="h6"
              sx={{
                color: categoryColor,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
              }}
            >
              Achievement Unlocked!
            </Typography>
          </motion.div>

          {/* Achievement name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {achievement.icon} {achievement.name}
            </Typography>
          </motion.div>

          {/* Achievement description */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Typography variant="body1" color="text.secondary">
              {achievement.description}
            </Typography>
          </motion.div>

          {/* Rewards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              {achievement.xpReward > 0 && (
                <Chip
                  label={`+${achievement.xpReward} XP`}
                  color="primary"
                  sx={{
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                />
              )}
              {achievement.goldReward > 0 && (
                <Chip
                  label={`+${achievement.goldReward} Gold`}
                  sx={{
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                  }}
                />
              )}
              {achievement.gemsReward > 0 && (
                <Chip
                  label={`+${achievement.gemsReward} Gems`}
                  sx={{
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                  }}
                />
              )}
            </Box>
          </motion.div>

          {/* Category chip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Chip
              label={achievement.category.toUpperCase()}
              size="small"
              sx={{
                borderColor: categoryColor,
                color: categoryColor,
                fontWeight: 600,
              }}
              variant="outlined"
            />
          </motion.div>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
