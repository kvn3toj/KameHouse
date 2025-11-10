import { Snackbar, Alert, Chip, Box } from '@mui/material';
import { motion } from 'framer-motion';

interface CelebrationToastProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  xpEarned?: number;
  goldEarned?: number;
}

/**
 * Celebration toast for habit completions and achievements
 *
 * @example
 * ```tsx
 * <CelebrationToast
 *   open={showCelebration}
 *   onClose={() => setShowCelebration(false)}
 *   title="🎉 First Habit Complete!"
 *   message="Amazing start! Keep the momentum going."
 *   xpEarned={10}
 *   goldEarned={5}
 * />
 * ```
 */
export default function CelebrationToast({
  open,
  onClose,
  title,
  message,
  xpEarned,
  goldEarned,
}: CelebrationToastProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={onClose}
        severity="success"
        sx={{
          width: '100%',
          minWidth: 300,
          background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
          color: 'white',
          '& .MuiAlert-icon': {
            color: 'white',
          },
        }}
      >
        <Box>
          <Box sx={{ fontWeight: 700, mb: 0.5 }}>
            {title}
          </Box>
          <Box sx={{ fontSize: '0.9rem', mb: 1 }}>
            {message}
          </Box>
          {(xpEarned || goldEarned) && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                delay: 0.2,
              }}
            >
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {xpEarned && (
                  <Chip
                    label={`+${xpEarned} XP`}
                    size="small"
                    sx={{
                      background: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                )}
                {goldEarned && (
                  <Chip
                    label={`+${goldEarned} Gold`}
                    size="small"
                    sx={{
                      background: 'rgba(255, 193, 7, 0.3)',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>
            </motion.div>
          )}
        </Box>
      </Alert>
    </Snackbar>
  );
}
