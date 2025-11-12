import { Box, Typography, Button, BoxProps } from '@mui/material';
import { ReactNode } from 'react';
import { COLORS, SPACING } from '../../theme/design-system';

interface EmptyStateProps extends BoxProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * EmptyState - Consistent empty states across the app
 * Used when lists/data are empty
 */
export const EmptyState = ({
  icon,
  title,
  description,
  action,
  ...boxProps
}: EmptyStateProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: SPACING.xxl,
        px: SPACING.lg,
        ...boxProps.sx,
      }}
      {...boxProps}
    >
      {/* Icon */}
      {icon && (
        <Box
          sx={{
            fontSize: '4rem',
            color: COLORS.neutral[300],
            mb: SPACING.md,
          }}
        >
          {icon}
        </Box>
      )}

      {/* Title */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          color: COLORS.text.primary,
          mb: SPACING.xs,
        }}
      >
        {title}
      </Typography>

      {/* Description */}
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: action ? SPACING.lg : 0, maxWidth: 400 }}
        >
          {description}
        </Typography>
      )}

      {/* Action Button */}
      {action && (
        <Button variant="contained" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
