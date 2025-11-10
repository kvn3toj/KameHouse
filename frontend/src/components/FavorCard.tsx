import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Cancel as CancelIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  TaskAlt as CompleteIcon,
} from '@mui/icons-material';
import type { Transaction } from '@/types/transaction';
import { format } from 'date-fns';

interface FavorCardProps {
  favor: Transaction;
  onAccept?: (favorId: string) => void;
  onComplete?: (favorId: string) => void;
  onDecline?: (favorId: string) => void;
  onCancel?: (favorId: string) => void;
}

export default function FavorCard({
  favor,
  onAccept,
  onComplete,
  onDecline,
  onCancel,
}: FavorCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'ACCEPTED':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'DECLINED':
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return favor.assigneeId ? 'Assigned' : 'Open';
      case 'ACCEPTED':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'DECLINED':
        return 'Declined';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
        opacity: favor.status === 'COMPLETED' || favor.status === 'CANCELLED' ? 0.7 : 1,
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header: Title and Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ flex: 1, pr: 1 }}>
            {favor.title}
          </Typography>
          <Chip label={getStatusLabel(favor.status)} color={getStatusColor(favor.status)} size="small" />
        </Box>

        {/* Description */}
        {favor.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {favor.description}
          </Typography>
        )}

        {/* Participants */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Requested by:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }}>
                {favor.requesterName.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" fontWeight={600}>
                {favor.requesterName}
              </Typography>
            </Box>
          </Box>

          {favor.assigneeName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Assigned to:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }}>
                  {favor.assigneeName.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="body2" fontWeight={600}>
                  {favor.assigneeName}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Credits */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2,
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'white',
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            {favor.credits}
          </Typography>
          <Typography variant="body2">LETS Credits</Typography>
        </Box>

        {/* Timestamps */}
        <Box sx={{ mt: 'auto', pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Created {format(new Date(favor.createdAt), 'MMM d, yyyy h:mm a')}
          </Typography>
          {favor.acceptedAt && (
            <Typography variant="caption" color="text.secondary" display="block">
              Accepted {format(new Date(favor.acceptedAt), 'MMM d, yyyy h:mm a')}
            </Typography>
          )}
          {favor.completedAt && (
            <Typography variant="caption" color="text.secondary" display="block">
              Completed {format(new Date(favor.completedAt), 'MMM d, yyyy h:mm a')}
            </Typography>
          )}
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          {favor.canAccept && onAccept && (
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<CheckIcon />}
              onClick={() => onAccept(favor.id)}
              fullWidth
            >
              Accept Task
            </Button>
          )}

          {favor.canComplete && onComplete && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<CompleteIcon />}
              onClick={() => onComplete(favor.id)}
              fullWidth
            >
              Mark Complete
            </Button>
          )}

          {favor.canComplete && onDecline && (
            <Tooltip title="Decline this task">
              <IconButton color="error" size="small" onClick={() => onDecline(favor.id)}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          )}

          {favor.canCancel && onCancel && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<CancelIcon />}
              onClick={() => onCancel(favor.id)}
              fullWidth
            >
              Cancel Request
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
