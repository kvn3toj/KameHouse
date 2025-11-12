import { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  LinearProgress,
  Button,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  SwapHoriz as SwapIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
  CameraAlt as CameraIcon,
} from '@mui/icons-material';
import type { ChoreAssignment } from '@/lib/chores-api';
import { completeChore, swapChore } from '@/lib/chores-api';

interface ChoreCardProps {
  assignment: ChoreAssignment;
  onComplete?: () => void;
  onSwap?: () => void;
}

export default function ChoreCard({ assignment, onComplete, onSwap }: ChoreCardProps) {
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [swapDialogOpen, setSwapDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const chore = assignment.chore;
  if (!chore) return null;

  const difficultyLabel = ['Easy', 'Medium', 'Hard', 'Very Hard', 'Expert'][chore.difficulty - 1] || 'Medium';
  const difficultyColor = ['success', 'info', 'warning', 'error', 'error'][chore.difficulty - 1] as 'success' | 'info' | 'warning' | 'error';

  const handleCompleteSubmit = async () => {
    if (chore.photoRequired && !photoUrl) {
      alert('Photo is required for this chore');
      return;
    }

    setLoading(true);
    try {
      await completeChore(assignment.id, {
        notes: notes || undefined,
        photoUrl: photoUrl || undefined,
      });
      setCompleteDialogOpen(false);
      onComplete?.();
    } catch (error) {
      console.error('Failed to complete chore:', error);
      alert('Failed to complete chore');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapSubmit = async (targetUserId: string) => {
    setLoading(true);
    try {
      await swapChore(assignment.id, { targetUserId });
      setSwapDialogOpen(false);
      onSwap?.();
    } catch (error) {
      console.error('Failed to request swap:', error);
      alert('Failed to request swap');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card
        sx={{
          position: 'relative',
          overflow: 'visible',
          opacity: assignment.isCompleted ? 0.7 : 1,
          border: assignment.isCompleted ? '2px solid' : '1px solid',
          borderColor: assignment.isCompleted ? 'success.main' : 'divider',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: assignment.isCompleted ? 'none' : 'translateY(-4px)',
            boxShadow: assignment.isCompleted ? 1 : 4,
          },
        }}
      >
        {/* Difficulty Indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            bgcolor: `${difficultyColor}.main`,
          }}
        />

        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'start', gap: 2, mb: 2 }}>
            <Box
              sx={{
                fontSize: '2.5rem',
                lineHeight: 1,
                filter: assignment.isCompleted ? 'grayscale(1)' : 'none',
              }}
            >
              {chore.icon || '🧹'}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  textDecoration: assignment.isCompleted ? 'line-through' : 'none',
                  color: assignment.isCompleted ? 'text.secondary' : 'text.primary',
                }}
              >
                {chore.title}
              </Typography>

              {chore.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {chore.description}
                </Typography>
              )}

              {/* Assigned to */}
              {assignment.user && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Avatar
                    src={assignment.user.avatar}
                    sx={{ width: 24, height: 24 }}
                  >
                    {assignment.user.displayName?.[0]}
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    {assignment.user.displayName || assignment.user.username}
                  </Typography>
                </Box>
              )}
            </Box>

            {assignment.isCompleted && (
              <CheckIcon color="success" sx={{ fontSize: 32 }} />
            )}
          </Box>

          {/* Metadata */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip
              label={difficultyLabel}
              size="small"
              color={difficultyColor}
              variant="outlined"
            />
            {chore.estimatedTime && (
              <Chip
                icon={<TimeIcon />}
                label={`${chore.estimatedTime} min`}
                size="small"
                variant="outlined"
              />
            )}
            {chore.photoRequired && (
              <Chip
                icon={<CameraIcon />}
                label="Photo Required"
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {assignment.swapRequested && (
              <Chip
                icon={<SwapIcon />}
                label="Swap Requested"
                size="small"
                color="warning"
                variant="filled"
              />
            )}
          </Box>

          {/* Rewards */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Rewards
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <StarIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                <Typography variant="body2">{chore.xpReward} XP</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body2" sx={{ color: 'warning.main' }}>💰</Typography>
                <Typography variant="body2">{chore.goldReward} Gold</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body2" sx={{ color: 'success.main' }}>🎫</Typography>
                <Typography variant="body2">{chore.letsCredit} Credits</Typography>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          {!assignment.isCompleted && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckIcon />}
                onClick={() => setCompleteDialogOpen(true)}
                fullWidth
              >
                Complete
              </Button>
              <IconButton
                onClick={() => setSwapDialogOpen(true)}
                color="primary"
                sx={{ border: 1, borderColor: 'divider' }}
                disabled={assignment.swapRequested}
              >
                <SwapIcon />
              </IconButton>
            </Box>
          )}

          {assignment.isCompleted && assignment.completedAt && (
            <Typography variant="caption" color="success.main" sx={{ display: 'block', textAlign: 'center' }}>
              ✓ Completed {new Date(assignment.completedAt).toLocaleDateString()}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Complete Dialog */}
      <Dialog open={completeDialogOpen} onClose={() => setCompleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Chore: {chore.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {chore.photoRequired && (
              <TextField
                label="Photo URL *"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                helperText="Photo is required for this chore"
                required
                fullWidth
              />
            )}
            <TextField
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional comments..."
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCompleteSubmit}
            variant="contained"
            color="success"
            disabled={loading || (chore.photoRequired && !photoUrl)}
          >
            {loading ? 'Completing...' : 'Complete Chore'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Swap Dialog */}
      <Dialog open={swapDialogOpen} onClose={() => setSwapDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Swap Chore</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Request to swap "{chore.title}" with another household member.
          </Typography>
          <Typography variant="caption" color="warning.main">
            ⚠️ Swap feature requires household member selection (coming soon)
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSwapDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
