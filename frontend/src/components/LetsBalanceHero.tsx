import { Box, Card, CardContent, Typography, Button, LinearProgress, Chip, alpha } from '@mui/material';
import {
  AccountBalance as CoinsIcon,
  TrendingUp as EarnedIcon,
  TrendingDown as SpentIcon,
  Handshake as FavorIcon,
} from '@mui/icons-material';
import { getBalanceFeedback, getBalanceColor, getBalancePercentage } from '@/lib/lets-feedback';
import type { UserBalance } from '@/types/transaction';

interface LetsBalanceHeroProps {
  balance: UserBalance;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
}

/**
 * LETS Balance Hero Component
 * The centerpiece of the Templo page - makes LETS the undeniable main game
 * Phase 5A: LETS-First Experience
 */
export default function LetsBalanceHero({ balance, onPrimaryAction, onSecondaryAction }: LetsBalanceHeroProps) {
  const feedback = getBalanceFeedback(balance.balance);
  const colors = getBalanceColor(balance.balance);
  const percentage = getBalancePercentage(balance.balance);

  return (
    <Card
      elevation={8}
      role="region"
      aria-label="LETS Balance Status"
      sx={{
        background: `linear-gradient(135deg, ${alpha(colors.light, 0.3)} 0%, ${alpha(colors.main, 0.1)} 100%)`,
        border: `3px solid ${colors.main}`,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        mb: 4,
      }}
    >
      {/* Decorative Background Icon */}
      <Box
        sx={{
          position: 'absolute',
          top: -40,
          right: -40,
          opacity: 0.08,
          transform: 'rotate(-15deg)',
        }}
      >
        <CoinsIcon sx={{ fontSize: 300, color: colors.dark }} />
      </Box>

      <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
        {/* Main Balance Display */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            fontWeight={600}
            letterSpacing={2}
            id="lets-balance-label"
          >
            Your LETS Balance
          </Typography>
          <Box
            sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1, my: 2 }}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-labelledby="lets-balance-label"
          >
            <Typography
              variant="h1"
              fontWeight={900}
              sx={{
                fontSize: { xs: '4rem', sm: '5rem', md: '6rem' },
                color: colors.main,
                textShadow: `0 2px 10px ${alpha(colors.main, 0.3)}`,
                lineHeight: 1,
              }}
              aria-label={`${balance.balance > 0 ? 'Positive' : balance.balance < 0 ? 'Negative' : 'Zero'} ${Math.abs(balance.balance)} credits`}
            >
              {balance.balance > 0 ? '+' : ''}
              {balance.balance}
            </Typography>
            <Typography variant="h4" color="text.secondary" fontWeight={600} aria-hidden="true">
              credits
            </Typography>
          </Box>

          {/* Emotional Feedback */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 3,
              py: 1.5,
              bgcolor: alpha(colors.main, 0.15),
              borderRadius: 10,
              border: `2px solid ${alpha(colors.main, 0.3)}`,
            }}
          >
            <Typography variant="h5" sx={{ fontSize: '2rem' }}>
              {feedback.emoji}
            </Typography>
            <Typography variant="h6" fontWeight={700} color={`${feedback.color}.main`}>
              {feedback.title}
            </Typography>
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
            {feedback.message}
          </Typography>
        </Box>

        {/* Visual Progress Bar showing position from -100 to +100 */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              -100
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              EQUILIBRIUM
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              +100
            </Typography>
          </Box>
          <Box sx={{ position: 'relative', height: 12, bgcolor: 'action.hover', borderRadius: 10, overflow: 'hidden' }}>
            {/* Equilibrium marker */}
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: 3,
                bgcolor: 'success.main',
                zIndex: 1,
                transform: 'translateX(-50%)',
              }}
            />
            {/* Progress fill */}
            <Box
              sx={{
                position: 'absolute',
                left: percentage < 50 ? `${percentage}%` : '50%',
                width: percentage < 50 ? `${50 - percentage}%` : `${percentage - 50}%`,
                height: '100%',
                bgcolor: colors.main,
                transition: 'all 0.5s ease',
              }}
            />
            {/* Current position indicator */}
            <Box
              sx={{
                position: 'absolute',
                left: `${percentage}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 20,
                height: 20,
                bgcolor: colors.dark,
                borderRadius: '50%',
                border: '3px solid white',
                boxShadow: `0 2px 8px ${alpha(colors.main, 0.5)}`,
                zIndex: 2,
              }}
            />
          </Box>
        </Box>

        {/* Transaction Summary */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            flexWrap: 'wrap',
            mb: 3,
          }}
        >
          <Chip
            icon={<EarnedIcon />}
            label={`${balance.creditsEarned || 0} earned`}
            color="success"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            icon={<SpentIcon />}
            label={`${balance.creditsSpent || 0} spent`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            icon={<FavorIcon />}
            label={`${balance.favorsDone || 0} favors completed`}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* Call to Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={onPrimaryAction}
            aria-label={`${feedback.callToAction} - Primary action based on your current balance`}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 700,
              bgcolor: colors.main,
              '&:hover': {
                bgcolor: colors.dark,
              },
              '&:focus': {
                outline: `3px solid ${colors.main}`,
                outlineOffset: 2,
              },
              minWidth: { xs: '100%', sm: 200 },
              minHeight: 48, // Touch target size
            }}
          >
            {feedback.callToAction}
          </Button>
          {onSecondaryAction && (
            <Button
              variant="outlined"
              size="large"
              onClick={onSecondaryAction}
              aria-label="View all available favors in the household"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderWidth: 2,
                borderColor: colors.main,
                color: colors.dark,
                '&:hover': {
                  borderWidth: 2,
                  borderColor: colors.dark,
                  bgcolor: alpha(colors.light, 0.1),
                },
                '&:focus': {
                  outline: `3px solid ${colors.main}`,
                  outlineOffset: 2,
                },
                minWidth: { xs: '100%', sm: 200 },
                minHeight: 48, // Touch target size
              }}
            >
              View All Favors
            </Button>
          )}
        </Box>

        {/* Household Context (optional) */}
        {balance.householdStats && (
          <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${alpha(colors.main, 0.2)}`, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Household Health: {balance.householdStats.healthScore || 'N/A'}% | Active Members:{' '}
              {balance.householdStats.activeMembers || 'N/A'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
