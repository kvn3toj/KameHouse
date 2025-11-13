import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ContentCopy as ApplyIcon,
  Star as StarIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';

interface RoomTemplate {
  id: string;
  name: string;
  description?: string;
  roomType: string;
  icon: string;
  isPublic: boolean;
  isSystemTemplate: boolean;
  useCount: number;
  config: any;
  createdById?: string;
  createdBy?: {
    username: string;
  };
}

interface RoomTemplatesLibraryProps {
  householdId: string;
  onTemplateApplied?: (roomId: string) => void;
}

export const RoomTemplatesLibrary: React.FC<RoomTemplatesLibraryProps> = ({
  householdId,
  onTemplateApplied,
}) => {
  const [templates, setTemplates] = useState<RoomTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<RoomTemplate | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<any>(null);

  useEffect(() => {
    loadTemplates();
  }, [householdId]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/room-templates');
      setTemplates(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await api.delete(`/room-templates/${templateId}`);
      loadTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleViewTemplate = (template: RoomTemplate) => {
    setSelectedTemplate(template);
    setViewDialogOpen(true);
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;

    setApplying(true);
    setApplyResult(null);

    try {
      const response = await api.post(
        `/room-templates/${selectedTemplate.id}/apply`,
        { householdId }
      );

      setApplyResult({
        success: true,
        room: response,
        message: `Successfully created "${response.name}" with ${response.choreTemplates?.length || 0} tasks!`,
      });

      // Reload templates to update use count
      loadTemplates();

      // Notify parent component
      onTemplateApplied?.(response.id);
    } catch (error: any) {
      console.error('Failed to apply template:', error);
      setApplyResult({
        success: false,
        message: error.response?.data?.message || 'Failed to apply template. Please try again.',
      });
    } finally {
      setApplying(false);
    }
  };

  const getFilteredTemplates = () => {
    let filtered = templates;

    // Filter by tab
    if (tabValue === 0) {
      // System templates
      filtered = filtered.filter((t) => t.isSystemTemplate);
    } else if (tabValue === 1) {
      // Public templates
      filtered = filtered.filter((t) => !t.isSystemTemplate && t.isPublic);
    } else {
      // My templates
      filtered = filtered.filter((t) => !t.isSystemTemplate && !t.isPublic);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.roomType.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const renderTemplateCard = (template: RoomTemplate) => (
    <Card key={template.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h4">{template.icon}</Typography>
            <Box>
              <Typography variant="h6">{template.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {template.roomType}
              </Typography>
            </Box>
          </Box>
          <Box>
            {template.isSystemTemplate && (
              <Chip label="System" size="small" color="primary" sx={{ mr: 0.5 }} />
            )}
            {template.isPublic && (
              <Chip label="Public" size="small" color="success" sx={{ mr: 0.5 }} />
            )}
          </Box>
        </Box>

        {template.description && (
          <Typography variant="body2" color="text.secondary" mb={2}>
            {template.description}
          </Typography>
        )}

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            icon={<StarIcon />}
            label={`Used ${template.useCount} times`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${template.config?.tasks?.length || 0} tasks`}
            size="small"
            variant="outlined"
          />
        </Stack>

        {!template.isSystemTemplate && template.createdBy && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            By: {template.createdBy.username}
          </Typography>
        )}
      </CardContent>

      <CardActions>
        <Button
          size="small"
          startIcon={<ViewIcon />}
          onClick={() => handleViewTemplate(template)}
        >
          View
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<ApplyIcon />}
          onClick={() => {
            setSelectedTemplate(template);
            setApplyDialogOpen(true);
            setApplyResult(null);
          }}
        >
          Apply
        </Button>
        {!template.isSystemTemplate && (
          <IconButton
            size="small"
            onClick={() => handleDelete(template.id)}
            sx={{ ml: 'auto' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </CardActions>
    </Card>
  );

  const renderViewDialog = () => (
    <Dialog
      open={viewDialogOpen}
      onClose={() => setViewDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h4">{selectedTemplate?.icon}</Typography>
          <Box>
            <Typography variant="h6">{selectedTemplate?.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedTemplate?.roomType}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        {selectedTemplate?.description && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {selectedTemplate.description}
          </Alert>
        )}

        <Typography variant="subtitle2" gutterBottom>
          Included Tasks ({selectedTemplate?.config?.tasks?.length || 0}):
        </Typography>

        <List dense>
          {selectedTemplate?.config?.tasks?.map((task: any, index: number) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography>{task.icon}</Typography>
                      <Typography variant="body1">{task.title}</Typography>
                    </Box>
                  }
                  secondary={
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      {task.difficulty && (
                        <Chip label={`Difficulty: ${task.difficulty}`} size="small" />
                      )}
                      {task.estimatedTime && (
                        <Chip label={`${task.estimatedTime} min`} size="small" />
                      )}
                      {task.frequency && (
                        <Chip label={task.frequency} size="small" />
                      )}
                    </Stack>
                  }
                />
              </ListItem>
              {index < selectedTemplate.config.tasks.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        <Button
          variant="contained"
          startIcon={<ApplyIcon />}
          onClick={() => {
            setViewDialogOpen(false);
            setApplyDialogOpen(true);
            setApplyResult(null);
          }}
        >
          Apply Template
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderApplyDialog = () => (
    <Dialog
      open={applyDialogOpen}
      onClose={() => !applying && setApplyDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Apply Template</DialogTitle>
      <DialogContent>
        {!applyResult ? (
          <Box>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to apply the template "{selectedTemplate?.name}"?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This will create a new room with {selectedTemplate?.config?.tasks?.length || 0} tasks
              in your household.
            </Typography>
          </Box>
        ) : (
          <Alert severity={applyResult.success ? 'success' : 'error'} sx={{ mt: 2 }}>
            {applyResult.message}
          </Alert>
        )}

        {applying && (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
            <CircularProgress />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {!applyResult ? (
          <>
            <Button onClick={() => setApplyDialogOpen(false)} disabled={applying}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleApplyTemplate}
              disabled={applying}
              startIcon={applying ? <CircularProgress size={16} /> : <ApplyIcon />}
            >
              {applying ? 'Applying...' : 'Apply'}
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            onClick={() => {
              setApplyDialogOpen(false);
              setApplyResult(null);
              setSelectedTemplate(null);
            }}
          >
            {applyResult.success ? 'Done' : 'Close'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  const filteredTemplates = getFilteredTemplates();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Room Templates Library</Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="System Templates" />
          <Tab label="Public Templates" />
          <Tab label="My Templates" />
        </Tabs>
      </Box>

      <TextField
        fullWidth
        placeholder="Search templates..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
        }}
        sx={{ mb: 3 }}
      />

      {filteredTemplates.length === 0 ? (
        <Alert severity="info">
          {searchQuery.trim()
            ? 'No templates match your search.'
            : tabValue === 0
            ? 'No system templates available.'
            : tabValue === 1
            ? 'No public templates available.'
            : 'You have not created any templates yet.'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredTemplates.map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              {renderTemplateCard(template)}
            </Grid>
          ))}
        </Grid>
      )}

      {renderViewDialog()}
      {renderApplyDialog()}
    </Box>
  );
};
