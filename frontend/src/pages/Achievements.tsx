import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  CircularProgress,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Lock as LockIcon,
  CheckCircle as UnlockedIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { achievementsApi } from '@/lib/achievements-api';
import type { Achievement, AchievementCategory } from '@/types/achievement';
import { useNavigate } from 'react-router-dom';

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'level', label: 'Level' },
  { value: 'habits', label: 'Habits' },
  { value: 'completions', label: 'Completions' },
  { value: 'streak', label: 'Streaks' },
  { value: 'gold', label: 'Wealth' },
];

export default function Achievements() {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const data = await achievementsApi.getAll();
      setAchievements(data);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements =
    selectedCategory === 'all'
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrophyIcon fontSize="large" /> Achievements
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Back to Dashboard
            </Button>
          </Box>

          {/* Overall Progress */}
          <Card sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6" gutterBottom>
              Overall Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={completionPercentage}
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'white',
                    },
                  }}
                />
              </Box>
              <Typography variant="h6" fontWeight="bold">
                {completionPercentage}%
              </Typography>
            </Box>
            <Typography variant="body2">
              {unlockedCount} of {totalCount} achievements unlocked
            </Typography>
          </Card>
        </Box>

        {/* Category Tabs */}
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={selectedCategory}
            onChange={(_, value) => setSelectedCategory(value)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {CATEGORIES.map((cat) => (
              <Tab key={cat.value} label={cat.label} value={cat.value} />
            ))}
          </Tabs>
        </Box>

        {/* Achievements Grid */}
        <Grid container spacing={3}>
          {filteredAchievements.map((achievement) => {
            const progressPercent = Math.min(
              Math.round((achievement.progress / achievement.requirement) * 100),
              100
            );

            return (
              <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                    opacity: achievement.unlocked ? 1 : 0.7,
                    bgcolor: achievement.unlocked ? 'background.paper' : 'action.hover',
                  }}
                >
                  <CardContent>
                    {/* Icon and Lock Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box
                        sx={{
                          fontSize: '3rem',
                          filter: achievement.unlocked ? 'none' : 'grayscale(100%)',
                        }}
                      >
                        {achievement.icon || '🏆'}
                      </Box>
                      {achievement.unlocked ? (
                        <UnlockedIcon color="success" fontSize="large" />
                      ) : (
                        <LockIcon color="disabled" fontSize="large" />
                      )}
                    </Box>

                    {/* Title and Description */}
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {achievement.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {achievement.description}
                    </Typography>

                    {/* Progress Bar (for unlocked achievements) */}
                    {!achievement.unlocked && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Progress
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {achievement.progress} / {achievement.requirement}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={progressPercent}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    )}

                    {/* Rewards */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                      {achievement.xpReward > 0 && (
                        <Chip
                          label={`+${achievement.xpReward} XP`}
                          size="small"
                          color="primary"
                          variant={achievement.unlocked ? 'filled' : 'outlined'}
                        />
                      )}
                      {achievement.goldReward > 0 && (
                        <Chip
                          label={`+${achievement.goldReward} Gold`}
                          size="small"
                          color="warning"
                          variant={achievement.unlocked ? 'filled' : 'outlined'}
                        />
                      )}
                      {achievement.gemsReward > 0 && (
                        <Chip
                          label={`+${achievement.gemsReward} Gems`}
                          size="small"
                          color="secondary"
                          variant={achievement.unlocked ? 'filled' : 'outlined'}
                        />
                      )}
                    </Box>

                    {/* Unlock Date */}
                    {achievement.unlocked && achievement.unlockedAt && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {filteredAchievements.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No achievements in this category yet.
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}
