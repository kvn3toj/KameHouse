import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  AutoAwesome as AutoIcon,
} from '@mui/icons-material';
import Layout from '@/components/Layout';
import ChoreCard from '@/components/ChoreCard';
import type { ChoreAssignment, CreateChoreTemplateDto } from '@/lib/chores-api';
import {
  getMyChores,
  createChoreTemplate,
  assignChoresForWeek,
} from '@/lib/chores-api';
import { useAuth } from '@/contexts/AuthContext';
import { householdApi } from '@/lib/household-api';

export default function ChoresPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<ChoreAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [householdId, setHouseholdId] = useState('');

  // Form state
  const [newChore, setNewChore] = useState<CreateChoreTemplateDto>({
    householdId: '',
    title: '',
    description: '',
    icon: '🧹',
    difficulty: 1,
    estimatedTime: 15,
    xpReward: 20,
    goldReward: 10,
    letsCredit: 5,
    frequency: 'WEEKLY',
    photoRequired: false,
  });

  useEffect(() => {
    loadHouseholdAndChores();
  }, []);

  const loadHouseholdAndChores = async () => {
    try {
      setLoading(true);
      setError('');

      // Get user's household
      const household = await householdApi.getMy();
      if (household) {
        setHouseholdId(household.id);
        setNewChore({ ...newChore, householdId: household.id });
      }

      // Load chores
      await loadChores();
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadChores = async () => {
    try {
      const data = await getMyChores();
      setAssignments(data);
    } catch (err) {
      console.error('Failed to load chores:', err);
    }
  };

  const handleAutoAssign = async () => {
    if (!householdId) {
      alert('Please join a household first');
      return;
    }

    try {
      setLoading(true);
      await assignChoresForWeek(householdId);
      await loadChores();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign chores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newChore.title) {
      alert('Please enter a chore title');
      return;
    }

    try {
      setLoading(true);
      await createChoreTemplate(newChore);
      setCreateDialogOpen(false);
      // Reset form
      setNewChore({
        householdId,
        title: '',
        description: '',
        icon: '🧹',
        difficulty: 1,
        estimatedTime: 15,
        xpReward: 20,
        goldReward: 10,
        letsCredit: 5,
        frequency: 'WEEKLY',
        photoRequired: false,
      });
      alert('Chore template created! Click "Auto-Assign Week" to assign chores.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create chore template');
    } finally {
      setLoading(false);
    }
  };

  // Categorize chores
  const todoChores = assignments.filter((a) => !a.isCompleted);
  const completedChores = assignments.filter((a) => a.isCompleted);

  const choreIcons = ['🧹', '🧺', '🍽️', '🗑️', '🚿', '🪟', '🌱', '🐕', '🐈', '🚗', '📦', '🛏️'];
  const frequencies = ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'];

  return (
    <Layout>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                🧹 Chore Rotation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Weekly chores for your household
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<CalendarIcon />}
                onClick={handleAutoAssign}
                disabled={loading || !householdId}
              >
                Auto-Assign Week
              </Button>
              <IconButton onClick={loadChores} color="primary">
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Chip
              icon={<AutoIcon />}
              label={`${todoChores.length} To Do`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`${completedChores.length} Completed`}
              color="success"
              variant="outlined"
            />
          </Box>

          {!householdId && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You need to join a household to use the chore rotation system.
            </Alert>
          )}
        </Box>

        {loading && !assignments.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {/* To Do Column */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: 'background.paper', minHeight: 400 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  📋 To Do
                  <Chip label={todoChores.length} size="small" color="primary" />
                </Typography>

                {todoChores.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography color="text.secondary">
                      ✨ All chores complete!
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    {todoChores.map((assignment) => (
                      <ChoreCard
                        key={assignment.id}
                        assignment={assignment}
                        onComplete={loadChores}
                        onSwap={loadChores}
                      />
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Completed Column */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: 'background.default', minHeight: 400 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  ✅ Completed
                  <Chip label={completedChores.length} size="small" color="success" />
                </Typography>

                {completedChores.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography color="text.secondary">
                      No chores completed yet
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    {completedChores.map((assignment) => (
                      <ChoreCard
                        key={assignment.id}
                        assignment={assignment}
                      />
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* FAB to Create Template */}
        <Fab
          color="primary"
          aria-label="add chore"
          sx={{ position: 'fixed', bottom: 80, right: 24 }}
          onClick={() => setCreateDialogOpen(true)}
          disabled={!householdId}
        >
          <AddIcon />
        </Fab>

        {/* Create Template Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Chore Template</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Title"
                value={newChore.title}
                onChange={(e) => setNewChore({ ...newChore, title: e.target.value })}
                placeholder="e.g., Wash Dishes, Vacuum Living Room"
                required
                fullWidth
              />

              <TextField
                label="Description"
                value={newChore.description}
                onChange={(e) => setNewChore({ ...newChore, description: e.target.value })}
                placeholder="Additional details..."
                multiline
                rows={2}
                fullWidth
              />

              <TextField
                select
                label="Icon"
                value={newChore.icon}
                onChange={(e) => setNewChore({ ...newChore, icon: e.target.value })}
                fullWidth
              >
                {choreIcons.map((icon) => (
                  <MenuItem key={icon} value={icon}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                      <span>{icon}</span>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    select
                    label="Difficulty"
                    value={newChore.difficulty}
                    onChange={(e) => setNewChore({ ...newChore, difficulty: Number(e.target.value) })}
                    fullWidth
                  >
                    {[1, 2, 3, 4, 5].map((level) => (
                      <MenuItem key={level} value={level}>
                        {['Easy', 'Medium', 'Hard', 'Very Hard', 'Expert'][level - 1]}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    type="number"
                    label="Est. Time (min)"
                    value={newChore.estimatedTime}
                    onChange={(e) => setNewChore({ ...newChore, estimatedTime: Number(e.target.value) })}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <TextField
                select
                label="Frequency"
                value={newChore.frequency}
                onChange={(e) => setNewChore({ ...newChore, frequency: e.target.value as any })}
                fullWidth
              >
                {frequencies.map((freq) => (
                  <MenuItem key={freq} value={freq}>
                    {freq}
                  </MenuItem>
                ))}
              </TextField>

              <Typography variant="subtitle2" color="text.secondary">
                Rewards
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    type="number"
                    label="XP"
                    value={newChore.xpReward}
                    onChange={(e) => setNewChore({ ...newChore, xpReward: Number(e.target.value) })}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    type="number"
                    label="Gold"
                    value={newChore.goldReward}
                    onChange={(e) => setNewChore({ ...newChore, goldReward: Number(e.target.value) })}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    type="number"
                    label="Credits"
                    value={newChore.letsCredit}
                    onChange={(e) => setNewChore({ ...newChore, letsCredit: Number(e.target.value) })}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTemplate} variant="contained" disabled={loading || !newChore.title}>
              {loading ? 'Creating...' : 'Create Template'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}
