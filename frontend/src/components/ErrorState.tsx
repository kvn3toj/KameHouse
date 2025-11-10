import { Box, Typography, Button, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { RefreshOutlined as RetryIcon, Home as HomeIcon } from '@mui/icons-material';

interface ErrorStateProps {
  /** Icon or emoji to display */
  icon?: ReactNode;
  /** Error title */
  title?: string;
  /** Error message */
  message?: string;
  /** Optional retry button label */
  retryLabel?: string;
  /** Optional retry handler */
  onRetry?: () => void;
  /** Optional home navigation label */
  homeLabel?: string;
  /** Optional home navigation handler */
  onHome?: () => void;
}

/**
 * Reusable error state component
 *
 * @example
 * ```tsx
 * <ErrorState
 *   icon="⚠️"
 *   title="Failed to Load Data"
 *   message="We couldn't fetch your habits. Please try again."
 *   retryLabel="Retry"
 *   onRetry={loadHabits}
 *   homeLabel="Go Home"
 *   onHome={() => navigate('/')}
 * />
 * ```
 */
export default function ErrorState({
  icon = '⚠️',
  title = 'Something went wrong',
  message = 'We encountered an error while loading your data. Please try again.',
  retryLabel = 'Try Again',
  onRetry,
  homeLabel,
  onHome,
}: ErrorStateProps) {
  return (
    <Paper
      sx={{
        p: 6,
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.05) 0%, rgba(233, 30, 99, 0.05) 100%)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
      }}
    >
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
      >
        <Box
          sx={{
            fontSize: 80,
            mb: 3,
            display: 'inline-block',
          }}
        >
          {icon}
        </Box>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Typography variant="h5" fontWeight={700} gutterBottom color="error.main">
          {title}
        </Typography>
      </motion.div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}
        >
          {message}
        </Typography>
      </motion.div>

      {/* Action Buttons */}
      {(onRetry || onHome) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {onRetry && (
              <Button
                variant="contained"
                size="large"
                onClick={onRetry}
                startIcon={<RetryIcon />}
                color="error"
                sx={{ px: 4 }}
              >
                {retryLabel}
              </Button>
            )}
            {onHome && homeLabel && (
              <Button
                variant="outlined"
                size="large"
                onClick={onHome}
                startIcon={<HomeIcon />}
                color="inherit"
              >
                {homeLabel}
              </Button>
            )}
          </Box>
        </motion.div>
      )}
    </Paper>
  );
}
