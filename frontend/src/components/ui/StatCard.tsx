import { Card, CardContent, Typography, Box, CardProps } from '@mui/material';
import { ReactNode } from 'react';
import { COLORS, COMPONENTS, SPACING } from '../../theme/design-system';

interface StatCardProps extends CardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  color?: 'primary' | 'success' | 'warning' | 'error';
  onClick?: () => void;
}

/**
 * StatCard - Display key metrics and statistics
 * Used for XP, streaks, levels, balances, etc.
 */
export const StatCard = ({
  label,
  value,
  icon,
  trend,
  color = 'primary',
  onClick,
  ...cardProps
}: StatCardProps) => {
  const isInteractive = !!onClick;
  const colorValue = COLORS[color]?.main || COLORS.primary.main;

  return (
    <Card
      onClick={onClick}
      sx={{
        ...(isInteractive ? COMPONENTS.card.interactive : COMPONENTS.card.standard),
        border: `2px solid`,
        borderColor: COLORS.border.light,
        ...cardProps.sx,
      }}
      {...cardProps}
    >
      <CardContent sx={{ p: SPACING.md, '&:last-child': { pb: SPACING.md } }}>
        {/* Icon + Label */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: SPACING.xs,
            mb: SPACING.xs,
          }}
        >
          {icon && (
            <Box
              sx={{
                color: colorValue,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {icon}
            </Box>
          )}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            {label}
          </Typography>
        </Box>

        {/* Value */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: colorValue,
            mb: trend ? SPACING.xs : 0,
          }}
        >
          {value}
        </Typography>

        {/* Trend Indicator */}
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING.xs }}>
            <Typography
              variant="caption"
              sx={{
                color: trend.value >= 0 ? COLORS.success.main : COLORS.error.main,
                fontWeight: 600,
              }}
            >
              {trend.value >= 0 ? '+' : ''}{trend.value}
            </Typography>
            {trend.label && (
              <Typography variant="caption" color="text.secondary">
                {trend.label}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
