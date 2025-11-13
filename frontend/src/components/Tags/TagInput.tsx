import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  TextField,
  Autocomplete,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { api } from '@/lib/api';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagInputProps {
  householdId: string;
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
  label?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  householdId,
  selectedTags,
  onChange,
  label = 'Tags',
}) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6b7280');

  useEffect(() => {
    loadTags();
  }, [householdId]);

  const loadTags = async () => {
    try {
      const tags = await api.get<Tag[]>(`/tags?householdId=${householdId}`);
      setAvailableTags(tags || []);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const newTag = await api.post<Tag>('/tags', {
        householdId,
        name: newTagName,
        color: newTagColor,
      });

      setAvailableTags([...availableTags, newTag]);
      onChange([...selectedTags, newTag]);
      setCreateDialogOpen(false);
      setNewTagName('');
      setNewTagColor('#6b7280');
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const getColorPresets = () => [
    { name: 'Gray', value: '#6b7280' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Purple', value: '#8b5cf6' },
  ];

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center">
        <Autocomplete
          multiple
          fullWidth
          options={availableTags}
          value={selectedTags}
          onChange={(_, newValue) => onChange(newValue)}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField {...params} label={label} placeholder="Add tags" />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option.name}
                {...getTagProps({ index })}
                sx={{
                  backgroundColor: option.color,
                  color: 'white',
                }}
              />
            ))
          }
        />
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
        >
          New Tag
        </Button>
      </Stack>

      {/* Create Tag Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create New Tag</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Tag Name"
              fullWidth
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              autoFocus
            />
            <Box>
              <TextField
                label="Color"
                type="color"
                fullWidth
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {getColorPresets().map((color) => (
                  <Button
                    key={color.value}
                    size="small"
                    variant={newTagColor === color.value ? 'contained' : 'outlined'}
                    onClick={() => setNewTagColor(color.value)}
                    sx={{
                      backgroundColor: newTagColor === color.value ? color.value : 'transparent',
                      borderColor: color.value,
                      color: newTagColor === color.value ? 'white' : color.value,
                      '&:hover': {
                        backgroundColor: color.value,
                        color: 'white',
                      },
                    }}
                  >
                    {color.name}
                  </Button>
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTag} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
