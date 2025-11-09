import { Paper, Typography, Box, Grid } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import type { User } from '@/types/auth';

interface StatsCardsProps {
  user: User;
}

export default function StatsCards({ user }: StatsCardsProps) {
  const stats = [
    {
      label: 'Level',
      value: user.level,
      icon: <StarIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.light',
    },
    {
      label: 'Total XP',
      value: user.xp,
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.light',
    },
    {
      label: 'Gold',
      value: user.gold,
      icon: <TrophyIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning.light',
    },
    {
      label: 'Health',
      value: `${user.health}/${user.maxHealth}`,
      icon: <FireIcon sx={{ fontSize: 40, color: 'error.main' }} />,
      color: 'error.light',
    },
  ];

  return (
    <Grid container spacing={2}>
      {stats.map((stat) => (
        <Grid item xs={6} sm={3} key={stat.label}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: stat.color, color: 'white' }}>
            <Box sx={{ mb: 1 }}>{stat.icon}</Box>
            <Typography variant="h4" fontWeight="bold">
              {stat.value}
            </Typography>
            <Typography variant="body2">{stat.label}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
