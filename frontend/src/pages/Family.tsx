import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  ContentCopy as CopyIcon,
  ExitToApp as LeaveIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { householdApi } from '@/lib/household-api';
import type { Household, LeaderboardEntry } from '@/types/household';
import { useNavigate } from 'react-router-dom';

export default function Family() {
  const navigate = useNavigate();
  const [household, setHousehold] = useState<Household | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  // Form states
  const [householdName, setHouseholdName] = useState('');
  const [householdDescription, setHouseholdDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadHousehold();
  }, []);

  const loadHousehold = async () => {
    try {
      const data = await householdApi.getMy();
      setHousehold(data);
      if (data) {
        loadLeaderboard(data.id);
      }
    } catch (error) {
      console.error('Failed to load household:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async (householdId: string) => {
    try {
      const data = await householdApi.getLeaderboard(householdId);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const handleCreateHousehold = async () => {
    try {
      await householdApi.create({
        name: householdName,
        description: householdDescription,
      });
      setSnackbar({ open: true, message: 'Household created successfully!', severity: 'success' });
      setCreateDialogOpen(false);
      loadHousehold();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to create household', severity: 'error' });
    }
  };

  const handleJoinHousehold = async () => {
    try {
      await householdApi.join({ inviteCode });
      setSnackbar({ open: true, message: 'Joined household successfully!', severity: 'success' });
      setJoinDialogOpen(false);
      loadHousehold();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to join household', severity: 'error' });
    }
  };

  const handleCopyInviteCode = () => {
    if (household) {
      navigator.clipboard.writeText(household.inviteCode);
      setSnackbar({ open: true, message: 'Invite code copied to clipboard!', severity: 'success' });
    }
  };

  const handleLeaveHousehold = async () => {
    if (!household) return;
    if (!confirm('Are you sure you want to leave this household?')) return;

    try {
      await householdApi.leave(household.id);
      setSnackbar({ open: true, message: 'Left household successfully', severity: 'success' });
      setHousehold(null);
      setLeaderboard([]);
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to leave household', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  // No household - show create/join options
  if (!household) {
    return (
      <Container maxWidth="md">
        <Box sx={{ minHeight: '100vh', py: 4 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <PeopleIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h3" gutterBottom>
              Family Household
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create or join a household to collaborate with your family on habits and tasks
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <AddIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    Create Household
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Start a new household and invite family members to join
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    Create New Household
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <PeopleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    Join Household
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Join an existing household using an invite code
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    fullWidth
                    onClick={() => setJoinDialogOpen(true)}
                  >
                    Join with Code
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Back to Dashboard
            </Button>
          </Box>
        </Box>

        {/* Create Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Household</DialogTitle>
          <DialogContent>
            <TextField
              label="Household Name"
              fullWidth
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              sx={{ mt: 2, mb: 2 }}
            />
            <TextField
              label="Description (Optional)"
              fullWidth
              multiline
              rows={3}
              value={householdDescription}
              onChange={(e) => setHouseholdDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateHousehold} variant="contained" disabled={!householdName}>
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Join Dialog */}
        <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Join Household</DialogTitle>
          <DialogContent>
            <TextField
              label="Invite Code"
              fullWidth
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              sx={{ mt: 2 }}
              placeholder="Enter the invite code from your family"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setJoinDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleJoinHousehold} variant="contained" disabled={!inviteCode}>
              Join
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    );
  }

  // Has household - show family dashboard
  return (
    <Container maxWidth="lg">
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {household.name}
            </Typography>
            {household.description && (
              <Typography variant="body1" color="text.secondary">
                {household.description}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Dashboard
            </Button>
            <IconButton color="error" onClick={handleLeaveHousehold}>
              <LeaveIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Invite Code Card */}
        <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Invite Code
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {household.inviteCode}
                </Typography>
              </Box>
              <IconButton onClick={handleCopyInviteCode} sx={{ color: 'white' }}>
                <CopyIcon />
              </IconButton>
            </Box>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
              Share this code with family members to invite them
            </Typography>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
            <Tab label={`Members (${household.memberCount})`} />
            <Tab label="Leaderboard" />
          </Tabs>
        </Box>

        {/* Members Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {household.members.map((member) => (
              <Grid item xs={12} sm={6} md={4} key={member.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}>
                        {(member.displayName || member.username).charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{member.displayName || member.username}</Typography>
                        <Chip label={member.role} size="small" color="primary" />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Level
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {member.level}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Gold
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {member.gold}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Contribution
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {member.contribution}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 1 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Member</TableCell>
                  <TableCell align="right">Level</TableCell>
                  <TableCell align="right">XP</TableCell>
                  <TableCell align="right">Gold</TableCell>
                  <TableCell align="right">Habits</TableCell>
                  <TableCell align="right">Streak</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboard.map((entry) => (
                  <TableRow key={entry.userId} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {entry.rank === 1 && <TrophyIcon sx={{ color: 'gold' }} />}
                        {entry.rank === 2 && <TrophyIcon sx={{ color: 'silver' }} />}
                        {entry.rank === 3 && <TrophyIcon sx={{ color: '#CD7F32' }} />}
                        <Typography fontWeight={entry.rank <= 3 ? 'bold' : 'normal'}>
                          #{entry.rank}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {(entry.displayName || entry.username).charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography>{entry.displayName || entry.username}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">{entry.level}</TableCell>
                    <TableCell align="right">{entry.xp.toLocaleString()}</TableCell>
                    <TableCell align="right">{entry.gold.toLocaleString()}</TableCell>
                    <TableCell align="right">{entry.habitsCompleted}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${entry.currentStreak} days`}
                        size="small"
                        color={entry.currentStreak >= 7 ? 'success' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
