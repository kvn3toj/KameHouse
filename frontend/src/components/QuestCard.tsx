import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Check as CheckIcon, EmojiEvents as TrophyIcon } from '@mui/icons-material';
import type { UserQuest } from '@/types/quest';

interface QuestCardProps {
  userQuest: UserQuest;
  onComplete?: (questId: string) => void;
}

export default function QuestCard({ userQuest, onComplete }: QuestCardProps) {
  const { quest, progress, isCompleted } = userQuest;
  const progressPercent = (progress / quest.targetCount) * 100;
  const canComplete = progress >= quest.targetCount && !isCompleted;

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return 'success';
      case 2:
        return 'warning';
      case 3:
        return 'error';
      default:
        return 'default';
    }
  };

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return 'Easy';
      case 2:
        return 'Medium';
      case 3:
        return 'Hard';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        opacity: isCompleted ? 0.7 : 1,
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: isCompleted ? 'none' : 'translateY(-4px)',
          boxShadow: isCompleted ? 2 : 6,
        },
        border: canComplete ? '2px solid' : '1px solid',
        borderColor: canComplete ? 'primary.main' : 'divider',
      }}
    >
      {isCompleted && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            bgcolor: 'success.main',
            color: 'white',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TrophyIcon fontSize="small" />
        </Box>
      )}

      <CardContent>
        {/* Quest Title and Icon */}
        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, mb: 1 }}>
          {quest.icon && (
            <Typography variant="h4" sx={{ lineHeight: 1 }}>
              {quest.icon}
            </Typography>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                textDecoration: isCompleted ? 'line-through' : 'none',
                color: isCompleted ? 'text.secondary' : 'text.primary',
              }}
            >
              {quest.title}
            </Typography>
            <Chip
              label={getDifficultyLabel(quest.difficulty)}
              color={getDifficultyColor(quest.difficulty)}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {quest.description}
        </Typography>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              {progress} / {quest.targetCount}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(progressPercent, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(0, 0, 0, 0.08)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                bgcolor: isCompleted
                  ? 'success.main'
                  : canComplete
                  ? 'primary.main'
                  : 'info.main',
              },
            }}
          />
        </Box>

        {/* Rewards */}
        <Box sx={{ display: 'flex', gap: 2, mb: canComplete ? 2 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              XP:
            </Typography>
            <Typography variant="body2" fontWeight={600} color="info.main">
              +{quest.xpReward}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Gold:
            </Typography>
            <Typography variant="body2" fontWeight={600} color="warning.main">
              +{quest.goldReward}
            </Typography>
          </Box>
          {quest.gemsReward > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Gems:
              </Typography>
              <Typography variant="body2" fontWeight={600} color="secondary.main">
                +{quest.gemsReward}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Complete Button */}
        {canComplete && onComplete && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title="Claim rewards!">
              <IconButton
                onClick={() => onComplete(quest.id)}
                color="primary"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': {
                      boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)',
                    },
                    '50%': {
                      boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)',
                    },
                  },
                }}
              >
                <CheckIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
