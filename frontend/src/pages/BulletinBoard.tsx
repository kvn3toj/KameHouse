import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon, Campaign as BulletinIcon } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { householdApi } from '@/lib/household-api';
import * as bulletinApi from '@/lib/bulletin-api';
import type { Announcement, CreateAnnouncementDto, UpdateAnnouncementDto } from '@/lib/bulletin-api';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import AnnouncementCard from '@/components/AnnouncementCard';
import CreateAnnouncementDialog from '@/components/CreateAnnouncementDialog';

export default function BulletinBoard() {
  const { user } = useAuth();
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadHouseholdAndAnnouncements();
  }, []);

  const loadHouseholdAndAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user's household
      const household = await householdApi.getMy();
      if (!household) {
        setError('You need to join a household first');
        setLoading(false);
        return;
      }

      setHouseholdId(household.id);

      // Load announcements
      const data = await bulletinApi.getAnnouncements(household.id);
      setAnnouncements(data);
    } catch (err: any) {
      console.error('Failed to load bulletin board:', err);
      setError(err.message || 'Failed to load bulletin board');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (data: CreateAnnouncementDto) => {
    try {
      const newAnnouncement = await bulletinApi.createAnnouncement(data);
      setAnnouncements([newAnnouncement, ...announcements]);
      setSnackbar({
        open: true,
        message: 'Announcement created successfully!',
        severity: 'success',
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to create announcement',
        severity: 'error',
      });
      throw err;
    }
  };

  const handleUpdateAnnouncement = async (data: UpdateAnnouncementDto) => {
    if (!editingAnnouncement) return;

    try {
      const updated = await bulletinApi.updateAnnouncement(editingAnnouncement.id, data);
      setAnnouncements(
        announcements.map((a) => (a.id === updated.id ? updated : a))
      );
      setSnackbar({
        open: true,
        message: 'Announcement updated successfully!',
        severity: 'success',
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update announcement',
        severity: 'error',
      });
      throw err;
    }
  };

  const handleDeleteClick = (id: string) => {
    setAnnouncementToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!announcementToDelete) return;

    try {
      await bulletinApi.deleteAnnouncement(announcementToDelete);
      setAnnouncements(announcements.filter((a) => a.id !== announcementToDelete));
      setSnackbar({
        open: true,
        message: 'Announcement deleted successfully!',
        severity: 'success',
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to delete announcement',
        severity: 'error',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setAnnouncementToDelete(null);
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      const updated = await bulletinApi.togglePin(id);
      setAnnouncements(
        announcements.map((a) => (a.id === updated.id ? updated : a))
      );
      setSnackbar({
        open: true,
        message: updated.isPinned ? 'Announcement pinned!' : 'Announcement unpinned!',
        severity: 'success',
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to toggle pin',
        severity: 'error',
      });
    }
  };

  const handleReaction = async (id: string, emoji: string) => {
    try {
      const result = await bulletinApi.toggleReaction(id, { emoji });

      // Reload announcements to get updated reactions
      if (householdId) {
        const data = await bulletinApi.getAnnouncements(householdId);
        setAnnouncements(data);
      }

      setSnackbar({
        open: true,
        message: result.action === 'added' ? `Reacted with ${emoji}` : `Removed ${emoji} reaction`,
        severity: 'success',
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to react',
        severity: 'error',
      });
    }
  };

  const handleEditClick = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setCreateDialogOpen(true);
  };

  const handleDialogClose = () => {
    setCreateDialogOpen(false);
    setEditingAnnouncement(null);
  };

  const handleDialogSubmit = async (data: CreateAnnouncementDto | UpdateAnnouncementDto) => {
    if (editingAnnouncement) {
      await handleUpdateAnnouncement(data as UpdateAnnouncementDto);
    } else {
      await handleCreateAnnouncement(data as CreateAnnouncementDto);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadHouseholdAndAnnouncements} />;
  }

  if (!householdId) {
    return (
      <EmptyState
        icon={BulletinIcon}
        title="No Household"
        description="Join or create a household to view the bulletin board"
      />
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Bulletin Board
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stay connected with your household
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          New Post
        </Button>
      </Box>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <EmptyState
          icon={BulletinIcon}
          title="No Announcements Yet"
          description="Be the first to post an announcement!"
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Announcement
            </Button>
          }
        />
      ) : (
        <Box>
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              currentUserId={user?.id}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onTogglePin={handleTogglePin}
              onReact={handleReaction}
            />
          ))}
        </Box>
      )}

      {/* Create/Edit Dialog */}
      {householdId && (
        <CreateAnnouncementDialog
          open={createDialogOpen}
          householdId={householdId}
          announcement={editingAnnouncement}
          onClose={handleDialogClose}
          onSubmit={handleDialogSubmit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Announcement?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this announcement? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
