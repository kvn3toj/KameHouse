import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Stack,
  Typography,
  Paper,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagFilterProps {
  householdId: string;
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  showHeader?: boolean;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  householdId,
  selectedTagIds,
  onChange,
  showHeader = true,
}) => {
  const { token } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    loadTags();
  }, [householdId]);

  const loadTags = async () => {
    try {
      const response = await api.get(`/tags?householdId=${householdId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTags(response.data);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  if (tags.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: 2 }}>
      {showHeader && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterIcon />
            <Typography variant="subtitle1">Filter by Tags</Typography>
          </Box>
          <Box>
            {selectedTagIds.length > 0 && (
              <Chip
                label={`${selectedTagIds.length} selected`}
                size="small"
                onDelete={handleClearAll}
                color="primary"
              />
            )}
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ ml: 1 }}
            >
              {expanded ? <CloseIcon /> : <FilterIcon />}
            </IconButton>
          </Box>
        </Box>
      )}

      <Collapse in={expanded}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {tags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              onClick={() => handleToggleTag(tag.id)}
              variant={selectedTagIds.includes(tag.id) ? 'filled' : 'outlined'}
              sx={{
                backgroundColor: selectedTagIds.includes(tag.id) ? tag.color : 'transparent',
                borderColor: tag.color,
                color: selectedTagIds.includes(tag.id) ? 'white' : tag.color,
                '&:hover': {
                  backgroundColor: tag.color,
                  color: 'white',
                },
              }}
            />
          ))}
        </Stack>
      </Collapse>
    </Paper>
  );
};
