import { Box, Typography, Button, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface EmptyStateProps {
  /** Icon or emoji to display */
  icon: ReactNode;
  /** Main title */
  title: string;
  /** Description text */
  description: string;
  /** Optional action button label */
  actionLabel?: string;
  /** Optional action button click handler */
  onAction?: () => void;
  /** Optional secondary action label */
  secondaryActionLabel?: string;
  /** Optional secondary action handler */
  onSecondaryAction?: () => void;
}

/**
 * Reusable empty state component
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon="📝"
 *   title="No habits yet"
 *   description="Create your first habit to start building good routines!"
 *   actionLabel="Create Habit"
 *   onAction={() => setOpenDialog(true)}
 * />
 * ```
 */
export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <Paper
      sx={{
        p: 6,
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
      }}
    >
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
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
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {title}
        </Typography>
      </motion.div>

      {/* Description */}
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
          {description}
        </Typography>
      </motion.div>

      {/* Action Buttons */}
      {(actionLabel || secondaryActionLabel) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {actionLabel && onAction && (
              <Button
                variant="contained"
                size="large"
                onClick={onAction}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  px: 4,
                }}
              >
                {actionLabel}
              </Button>
            )}
            {secondaryActionLabel && onSecondaryAction && (
              <Button
                variant="outlined"
                size="large"
                onClick={onSecondaryAction}
                color="inherit"
              >
                {secondaryActionLabel}
              </Button>
            )}
          </Box>
        </motion.div>
      )}
    </Paper>
  );
}
