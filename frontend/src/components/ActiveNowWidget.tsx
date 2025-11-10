import { Box, Card, CardContent, Typography, Chip, Grid, Alert } from '@mui/material';
import {
  Handshake as FavorIcon,
  CleaningServices as ChoreIcon,
  Campaign as BulletinIcon,
  TrendingUp as ActivityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ActiveNowWidgetProps {
  pendingFavorsCount: number;
  choresDueCount: number;
  newPostsCount: number;
  householdName?: string;
}

/**
 * ActiveNowWidget - Shows household activity pulse
 * Implements Moksart UX recommendation for "Active Now" summary
 * Creates urgency and social motivation (Core Drive 5 & 6)
 */
export default function ActiveNowWidget({
  pendingFavorsCount,
  choresDueCount,
  newPostsCount,
  householdName = 'Your Household',
}: ActiveNowWidgetProps) {
  const navigate = useNavigate();

  const hasActivity = pendingFavorsCount > 0 || choresDueCount > 0 || newPostsCount > 0;

  if (!hasActivity) {
    return (
      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
          color: 'white',
        }}
      >
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              ✨ All Quiet in {householdName}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              No urgent tasks or activity right now. Great job keeping up!
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        mb: 3,
        border: '2px solid',
        borderColor: 'warning.main',
        boxShadow: 3,
        background: 'linear-gradient(135deg, #fff5e6 0%, #ffe6cc 100%)',
      }}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ActivityIcon sx={{ color: 'warning.main', fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight={700} color="text.primary">
              🔥 Active Now
            </Typography>
            <Typography variant="body2" color="text.secondary">
              What's happening in your household
            </Typography>
          </Box>
        </Box>

        {/* Activity Summary */}
        <Grid container spacing={2}>
          {/* Pending Favors */}
          {pendingFavorsCount > 0 && (
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'white',
                  border: '1px solid',
                  borderColor: 'success.light',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                    borderColor: 'success.main',
                  },
                }}
                onClick={() => {
                  // Scroll to LETS section or navigate
                  const element = document.getElementById('lets-economy-section');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <FavorIcon sx={{ color: 'success.main' }} />
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {pendingFavorsCount}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {pendingFavorsCount === 1 ? 'New favor request' : 'New favor requests'}
                </Typography>
                <Chip
                  label="Help needed!"
                  size="small"
                  color="success"
                  sx={{ mt: 1, fontWeight: 600 }}
                />
              </Box>
            </Grid>
          )}

          {/* Chores Due */}
          {choresDueCount > 0 && (
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'white',
                  border: '1px solid',
                  borderColor: 'info.light',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                    borderColor: 'info.main',
                  },
                }}
                onClick={() => navigate('/chores')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ChoreIcon sx={{ color: 'info.main' }} />
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {choresDueCount}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {choresDueCount === 1 ? 'Chore due this week' : 'Chores due this week'}
                </Typography>
                <Chip
                  label="Stay on track"
                  size="small"
                  color="info"
                  sx={{ mt: 1, fontWeight: 600 }}
                />
              </Box>
            </Grid>
          )}

          {/* New Posts */}
          {newPostsCount > 0 && (
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'white',
                  border: '1px solid',
                  borderColor: 'primary.light',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                    borderColor: 'primary.main',
                  },
                }}
                onClick={() => {
                  // Scroll to Bulletin section
                  const element = document.getElementById('bulletin-section');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <BulletinIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {newPostsCount}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {newPostsCount === 1 ? 'New bulletin post' : 'New bulletin posts'}
                </Typography>
                <Chip
                  label="Check it out"
                  size="small"
                  color="primary"
                  sx={{ mt: 1, fontWeight: 600 }}
                />
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Contextual Message */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight={600}>
            💡 Tip: Click any activity card to jump directly to that section
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
}
