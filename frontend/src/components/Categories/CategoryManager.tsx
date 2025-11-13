import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Chip,
  Stack,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  order: number;
  isActive: boolean;
  _count?: {
    tasks: number;
  };
}

interface CategoryManagerProps {
  householdId: string;
  onCategorySelect?: (category: Category) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  householdId,
  onCategorySelect,
}) => {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: '📋',
  });

  useEffect(() => {
    loadCategories();
  }, [householdId]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/categories?householdId=${householdId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color,
        icon: category.icon,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        color: '#3b82f6',
        icon: '📋',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        await api.patch(`/categories/${editingCategory.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post('/categories', {
          ...formData,
          householdId,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      loadCategories();
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await api.delete(`/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const getColorPresets = () => [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
  ];

  const getIconPresets = () => ['📋', '🏠', '🧹', '🍳', '🛏️', '🚿', '📚', '💼', '🎮', '🏃'];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Task Categories</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Category
        </Button>
      </Box>

      <Grid container spacing={2}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card
              sx={{
                cursor: onCategorySelect ? 'pointer' : 'default',
                '&:hover': onCategorySelect ? {
                  boxShadow: 3,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s',
                } : {},
              }}
              onClick={() => onCategorySelect?.(category)}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h4">{category.icon}</Typography>
                    <Box>
                      <Typography variant="h6">{category.name}</Typography>
                      {category.description && (
                        <Typography variant="body2" color="text.secondary">
                          {category.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog(category);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(category.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                  <Chip
                    label={`${category._count?.tasks || 0} tasks`}
                    size="small"
                    sx={{
                      backgroundColor: category.color,
                      color: 'white',
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Create Category'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            {/* Icon Selector */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Icon
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {getIconPresets().map((icon) => (
                  <Button
                    key={icon}
                    variant={formData.icon === icon ? 'contained' : 'outlined'}
                    onClick={() => setFormData({ ...formData, icon })}
                    sx={{ minWidth: 'auto', fontSize: '1.5rem' }}
                  >
                    {icon}
                  </Button>
                ))}
              </Stack>
            </Box>

            {/* Color Selector */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Color
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {getColorPresets().map((color) => (
                  <Button
                    key={color.value}
                    variant={formData.color === color.value ? 'contained' : 'outlined'}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    sx={{
                      backgroundColor: formData.color === color.value ? color.value : 'transparent',
                      borderColor: color.value,
                      color: formData.color === color.value ? 'white' : color.value,
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
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
