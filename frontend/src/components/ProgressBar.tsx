import { Box, Typography, LinearProgress, Paper } from '@mui/material';

interface ProgressBarProps {
  current: number;
  max: number;
  label: string;
  color?: 'primary' | 'success' | 'error' | 'warning';
}

export default function ProgressBar({ current, max, label, color = 'primary' }: ProgressBarProps) {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" fontWeight="medium">
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {current} / {max}
        </Typography>
      </Box>
      <LinearProgress variant="determinate" value={percentage} color={color} sx={{ height: 8, borderRadius: 4 }} />
    </Paper>
  );
}
