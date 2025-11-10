import { Snackbar, Alert, Box, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { LocalFireDepartment as FireIcon } from '@mui/icons-material';

interface StreakMilestoneToastProps {
  open: boolean;
  onClose: () => void;
  streak: number;
  habitName: string;
  bonusXP?: number;
}

/**
 * Streak milestone celebration toast
 * Celebrates important streak milestones (3, 7, 14, 30 days)
 *
 * @example
 * ```tsx
 * <StreakMilestoneToast
 *   open={showStreakMilestone}
 *   onClose={() => setShowStreakMilestone(false)}
 *   streak={7}
 *   habitName="Morning Meditation"
 *   bonusXP={50}
 * />
 * ```
 */
export default function StreakMilestoneToast({
  open,
  onClose,
  streak,
  habitName,
  bonusXP,
}: StreakMilestoneToastProps) {
  const getMilestoneData = (days: number) => {
    if (days >= 30) {
      return {
        icon: '🌟',
        title: 'Legendary Streak!',
        message: `30+ days of ${habitName}! You're unstoppable!`,
        gradient: 'linear-gradient(135deg, #FF9800 0%, #F44336 100%)',
      };
    } else if (days >= 14) {
      return {
        icon: '💪',
        title: '2-Week Warrior!',
        message: `14 days of ${habitName}! Amazing dedication!`,
        gradient: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
      };
    } else if (days >= 7) {
      return {
        icon: '⚡',
        title: 'Week Warrior!',
        message: `7-day streak on ${habitName}! Keep it up!`,
        gradient: 'linear-gradient(135deg, #2196F3 0%, #00BCD4 100%)',
      };
    } else if (days >= 3) {
      return {
        icon: '🔥',
        title: 'On Fire!',
        message: `3-day streak on ${habitName}! You're building momentum!`,
        gradient: 'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
      };
    }
    return null;
  };

  const milestoneData = getMilestoneData(streak);

  if (!milestoneData) return null;

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
        icon={<FireIcon />}
        sx={{
          width: '100%',
          minWidth: 320,
          background: milestoneData.gradient,
          color: 'white',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '& .MuiAlert-icon': {
            color: 'white',
            fontSize: 28,
          },
        }}
      >
        <Box>
          <Box sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 0.5 }}>
            {milestoneData.icon} {milestoneData.title}
          </Box>
          <Box sx={{ fontSize: '0.9rem', mb: 1, opacity: 0.95 }}>
            {milestoneData.message}
          </Box>
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
              <Chip
                label={`${streak} Day Streak!`}
                size="small"
                sx={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              />
              {bonusXP && (
                <Chip
                  label={`+${bonusXP} Bonus XP!`}
                  size="small"
                  sx={{
                    background: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                />
              )}
            </Box>
          </motion.div>
        </Box>
      </Alert>
    </Snackbar>
  );
}
