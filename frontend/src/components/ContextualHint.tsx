import { Snackbar, Alert, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import type { HintType } from '@/hooks/useContextualHints';

interface HintConfig {
  id: HintType;
  message: string;
  icon?: string;
}

const HINT_CONFIGS: Record<HintType, Omit<HintConfig, 'id'>> = {
  'household-created': {
    message: '🏠 Invite family members to collaborate and compete together!',
  },
  'first-habit-created': {
    message: '✨ Great! Complete your habit daily to build streaks and earn rewards.',
  },
  'family-empty': {
    message: '👥 Create or join a household to unlock family features and LETS economy.',
  },
  'challenges-available': {
    message: '🎯 New challenges are available! Check them out to earn bonus rewards.',
  },
  'achievement-unlocked': {
    message: '🏆 You unlocked an achievement! Keep up the great work.',
  },
  'first-completion': {
    message: '🎉 First habit completed! Keep the momentum going to build your streak.',
  },
};

interface ContextualHintProps {
  type: HintType | null;
  onDismiss: () => void;
}

/**
 * Contextual hint component
 * Shows bottom-positioned, dismissible hints at key moments
 *
 * @example
 * ```tsx
 * const { activeHint, dismissHint } = useContextualHints();
 * <ContextualHint type={activeHint} onDismiss={dismissHint} />
 * ```
 */
export default function ContextualHint({ type, onDismiss }: ContextualHintProps) {
  if (!type) return null;

  const config = HINT_CONFIGS[type];

  return (
    <AnimatePresence>
      <Snackbar
        open={true}
        onClose={onDismiss}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 90, md: 24 } }} // Account for mobile bottom navigation (70px height + 20px margin)
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        >
          <Alert
            severity="info"
            onClose={onDismiss}
            sx={{
              width: '100%',
              minWidth: { xs: 280, sm: 400 },
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
              '& .MuiAlert-icon': {
                color: 'white',
              },
              '& .MuiAlert-message': {
                flex: 1,
                fontSize: '0.95rem',
                fontWeight: 500,
              },
            }}
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={onDismiss}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            {config.message}
          </Alert>
        </motion.div>
      </Snackbar>
    </AnimatePresence>
  );
}
