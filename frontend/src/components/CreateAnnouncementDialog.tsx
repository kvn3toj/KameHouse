import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
} from '@mui/material';
import type { CreateAnnouncementDto, UpdateAnnouncementDto, AnnouncementType, Announcement } from '@/lib/bulletin-api';

interface CreateAnnouncementDialogProps {
  open: boolean;
  householdId: string;
  announcement?: Announcement | null;
  onClose: () => void;
  onSubmit: (data: CreateAnnouncementDto | UpdateAnnouncementDto) => Promise<void>;
}

export default function CreateAnnouncementDialog({
  open,
  householdId,
  announcement,
  onClose,
  onSubmit,
}: CreateAnnouncementDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<AnnouncementType>('INFO');
  const [isPinned, setIsPinned] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset form when dialog opens/closes or announcement changes
  useEffect(() => {
    if (open) {
      if (announcement) {
        // Editing mode
        setTitle(announcement.title);
        setContent(announcement.content);
        setType(announcement.type);
        setIsPinned(announcement.isPinned);
        setExpiresAt(announcement.expiresAt ? announcement.expiresAt.split('T')[0] : '');
      } else {
        // Creating mode
        setTitle('');
        setContent('');
        setType('INFO');
        setIsPinned(false);
        setExpiresAt('');
      }
    }
  }, [open, announcement]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      if (announcement) {
        // Update existing announcement
        const updateData: UpdateAnnouncementDto = {
          title,
          content,
          type,
          isPinned,
          expiresAt: expiresAt || undefined,
        };
        await onSubmit(updateData);
      } else {
        // Create new announcement
        const createData: CreateAnnouncementDto = {
          householdId,
          title,
          content,
          type,
          isPinned,
          expiresAt: expiresAt || undefined,
        };
        await onSubmit(createData);
      }

      onClose();
    } catch (error) {
      console.error('Failed to submit announcement:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {announcement ? 'Edit Announcement' : 'Create Announcement'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            autoFocus
          />

          <TextField
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            required
            multiline
            rows={4}
          />

          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={type}
              label="Type"
              onChange={(e) => setType(e.target.value as AnnouncementType)}
            >
              <MenuItem value="INFO">Info</MenuItem>
              <MenuItem value="URGENT">Urgent</MenuItem>
              <MenuItem value="EVENT">Event</MenuItem>
              <MenuItem value="REMINDER">Reminder</MenuItem>
              <MenuItem value="POLL">Poll</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Expiration Date (Optional)"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
              />
            }
            label="Pin to top"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!title.trim() || !content.trim() || submitting}
        >
          {submitting ? 'Saving...' : announcement ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
