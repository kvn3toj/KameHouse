import { Card, CardContent, Typography, Box, Chip, CardProps } from '@mui/material';
import { ReactNode } from 'react';
import { COLORS, COMPONENTS, SPACING, HELPERS } from '../../theme/design-system';

interface StatusCardProps extends Omit<CardProps, 'title'> {
  title: string;
  description?: string;
  status?: 'completed' | 'pending' | 'failed' | 'active';
  statusLabel?: string;
  icon?: ReactNode;
  action?: ReactNode;
  onClick?: () => void;
}

/**
 * StatusCard - Reusable card with status indicator
 * Used for tasks, quests, habits, etc.
 */
export const StatusCard = ({
  title,
  description,
  status,
  statusLabel,
  icon,
  action,
  onClick,
  ...cardProps
}: StatusCardProps) => {
  const isInteractive = !!onClick;

  return (
    <Card
      onClick={onClick}
      sx={{
        ...(isInteractive ? COMPONENTS.card.interactive : COMPONENTS.card.standard),
        ...cardProps.sx,
      }}
      {...cardProps}
    >
      <CardContent sx={{ p: SPACING.md, '&:last-child': { pb: SPACING.md } }}>
        {/* Header Row */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: description ? SPACING.sm : 0,
            gap: SPACING.sm,
          }}
        >
          {/* Icon + Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING.sm, flex: 1 }}>
            {icon && (
              <Box
                sx={{
                  color: status ? HELPERS.getStatusBadge(status).color : COLORS.primary.main,
                }}
              >
                {icon}
              </Box>
            )}
            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
              {title}
            </Typography>
          </Box>

          {/* Status Badge */}
          {status && (
            <Chip
              label={statusLabel || status}
              size="small"
              sx={{
                ...HELPERS.getStatusBadge(status),
                fontSize: '0.75rem',
                height: 24,
              }}
            />
          )}
        </Box>

        {/* Description */}
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: SPACING.sm }}>
            {description}
          </Typography>
        )}

        {/* Action Area */}
        {action && (
          <Box sx={{ mt: SPACING.sm }}>
            {action}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusCard;
