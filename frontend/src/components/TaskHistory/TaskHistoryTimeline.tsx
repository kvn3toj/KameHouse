import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Avatar,
  CircularProgress,
  Alert,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  Paper,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  CheckCircle as CompleteIcon,
  Assignment as CreateIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  AssignmentInd as AssignIcon,
  Category as CategoryIcon,
  Label as TagIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { formatDistanceToNow, format } from 'date-fns';

interface TaskHistoryEntry {
  id: string;
  action: string;
  changes: any;
  performedAt: string;
  performedBy: {
    id: string;
    username: string;
  };
  task: {
    id: string;
    title: string;
  };
}

interface TaskHistoryTimelineProps {
  taskId?: string;
  householdId?: string;
  limit?: number;
  showTaskTitle?: boolean;
}

export const TaskHistoryTimeline: React.FC<TaskHistoryTimelineProps> = ({
  taskId,
  householdId,
  limit = 50,
  showTaskTitle = true,
}) => {
  const { token } = useAuth();
  const [history, setHistory] = useState<TaskHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [taskId, householdId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = '/task-history';
      const params = new URLSearchParams();

      if (taskId) {
        url = `/task-history/task/${taskId}`;
      } else if (householdId) {
        params.append('householdId', householdId);
        params.append('limit', limit.toString());
        url = `/task-history?${params.toString()}`;
      }

      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setHistory(response.data);
    } catch (err: any) {
      console.error('Failed to load task history:', err);
      setError(err.response?.data?.message || 'Failed to load task history');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATED':
        return <CreateIcon />;
      case 'UPDATED':
        return <EditIcon />;
      case 'COMPLETED':
        return <CompleteIcon />;
      case 'DELETED':
        return <DeleteIcon />;
      case 'SCHEDULED':
        return <ScheduleIcon />;
      case 'ASSIGNED':
        return <AssignIcon />;
      case 'CATEGORY_CHANGED':
        return <CategoryIcon />;
      case 'TAGS_UPDATED':
        return <TagIcon />;
      default:
        return <EditIcon />;
    }
  };

  const getActionColor = (action: string): 'primary' | 'success' | 'error' | 'warning' | 'info' | 'grey' => {
    switch (action) {
      case 'CREATED':
        return 'success';
      case 'COMPLETED':
        return 'success';
      case 'DELETED':
        return 'error';
      case 'UPDATED':
        return 'primary';
      case 'SCHEDULED':
        return 'info';
      case 'ASSIGNED':
        return 'warning';
      default:
        return 'grey';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'CREATED':
        return 'Created';
      case 'UPDATED':
        return 'Updated';
      case 'COMPLETED':
        return 'Completed';
      case 'DELETED':
        return 'Deleted';
      case 'SCHEDULED':
        return 'Scheduled';
      case 'ASSIGNED':
        return 'Assigned';
      case 'CATEGORY_CHANGED':
        return 'Category Changed';
      case 'TAGS_UPDATED':
        return 'Tags Updated';
      default:
        return action;
    }
  };

  const formatChanges = (action: string, changes: any) => {
    if (!changes || Object.keys(changes).length === 0) {
      return null;
    }

    const changesList: JSX.Element[] = [];

    Object.entries(changes).forEach(([key, value]: [string, any]) => {
      if (key === 'status') {
        changesList.push(
          <Chip
            key={key}
            label={`Status: ${value}`}
            size="small"
            color={value === 'completed' ? 'success' : 'default'}
            sx={{ mr: 0.5, mb: 0.5 }}
          />
        );
      } else if (key === 'assignedTo') {
        changesList.push(
          <Chip
            key={key}
            label={`Assigned to: ${value}`}
            size="small"
            color="warning"
            sx={{ mr: 0.5, mb: 0.5 }}
          />
        );
      } else if (key === 'scheduledFor') {
        changesList.push(
          <Chip
            key={key}
            label={`Scheduled: ${format(new Date(value), 'MMM d, yyyy h:mm a')}`}
            size="small"
            color="info"
            sx={{ mr: 0.5, mb: 0.5 }}
          />
        );
      } else if (key === 'categoryId') {
        changesList.push(
          <Chip
            key={key}
            label={`Category changed`}
            size="small"
            sx={{ mr: 0.5, mb: 0.5 }}
          />
        );
      } else if (key === 'tags') {
        changesList.push(
          <Chip
            key={key}
            label={`Tags updated`}
            size="small"
            sx={{ mr: 0.5, mb: 0.5 }}
          />
        );
      } else if (typeof value === 'string' || typeof value === 'number') {
        changesList.push(
          <Chip
            key={key}
            label={`${key}: ${value}`}
            size="small"
            variant="outlined"
            sx={{ mr: 0.5, mb: 0.5 }}
          />
        );
      }
    });

    return changesList.length > 0 ? (
      <Box sx={{ mt: 1 }}>{changesList}</Box>
    ) : null;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (history.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No history available yet.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Task History
      </Typography>

      <Timeline position="right">
        {history.map((entry, index) => (
          <TimelineItem key={entry.id}>
            <TimelineOppositeContent
              sx={{ m: 'auto 0', minWidth: '120px' }}
              align="right"
              variant="body2"
              color="text.secondary"
            >
              <Typography variant="caption" display="block">
                {format(new Date(entry.performedAt), 'MMM d, yyyy')}
              </Typography>
              <Typography variant="caption" display="block">
                {format(new Date(entry.performedAt), 'h:mm a')}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                {formatDistanceToNow(new Date(entry.performedAt), { addSuffix: true })}
              </Typography>
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot color={getActionColor(entry.action)}>
                {getActionIcon(entry.action)}
              </TimelineDot>
              {index < history.length - 1 && <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box>
                    <Chip
                      label={getActionLabel(entry.action)}
                      color={getActionColor(entry.action)}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    {showTaskTitle && (
                      <Typography variant="subtitle1" component="div">
                        {entry.task.title}
                      </Typography>
                    )}
                  </Box>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'primary.main',
                      fontSize: '0.875rem',
                    }}
                  >
                    {entry.performedBy.username.charAt(0).toUpperCase()}
                  </Avatar>
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  By: <strong>{entry.performedBy.username}</strong>
                </Typography>

                {formatChanges(entry.action, entry.changes)}
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>

      {history.length >= limit && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Showing the most recent {limit} entries. Older entries are not displayed.
        </Alert>
      )}
    </Box>
  );
};
