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
  IconButton,
  Snackbar,
  Alert,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  ExitToApp as LeaveIcon,
  AccountBalance as CoinsIcon,
  CheckCircle as CompleteIcon,
  Cancel as DeclineIcon,
  Campaign as BulletinIcon,
  ExpandMore as ExpandIcon,
  Handshake as FavorIcon,
} from '@mui/icons-material';
import { householdApi } from '@/lib/household-api';
import { transactionsApi } from '@/lib/transactions-api';
import * as bulletinApi from '@/lib/bulletin-api';
import { getMyChores } from '@/lib/chores-api';
import type { Household, LeaderboardEntry } from '@/types/household';
import type { Transaction, UserBalance } from '@/types/transaction';
import type { Announcement, CreateAnnouncementDto, UpdateAnnouncementDto } from '@/lib/bulletin-api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import AnnouncementCard from '@/components/AnnouncementCard';
import CreateAnnouncementDialog from '@/components/CreateAnnouncementDialog';
import ActiveNowWidget from '@/components/ActiveNowWidget';
import LetsBalanceHero from '@/components/LetsBalanceHero';
import { getBalanceFeedback } from '@/lib/lets-feedback';

/**
 * Templo (LETS Central Hub) - Phase 5A: LETS-First Experience
 * The sacred household center where the LETS reciprocity game unfolds
 *
 * Key Transformation:
 * - LETS Balance Hero: 40% visual weight (THE GAME STATE)
 * - Contextual actions: Adapt based on balance
 * - Unified LETS interface: All reciprocity in one place
 * - Secondary content: Bulletin, Members demoted
 *
 * Design Philosophy: "Balance is Victory, Flow is Wealth"
 */
export default function KameHouse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [choresDueCount, setChoresDueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Progressive disclosure states
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [showLetsInfo, setShowLetsInfo] = useState(false);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [requestFavorDialogOpen, setRequestFavorDialogOpen] = useState(false);
  const [createAnnouncementDialogOpen, setCreateAnnouncementDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deleteAnnouncementConfirmOpen, setDeleteAnnouncementConfirmOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);

  // Form states
  const [householdName, setHouseholdName] = useState('');
  const [householdDescription, setHouseholdDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [favorTitle, setFavorTitle] = useState('');
  const [favorDescription, setFavorDescription] = useState('');
  const [favorCredits, setFavorCredits] = useState(10);
  const [favorAssignee, setFavorAssignee] = useState('');

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
      setLoading(true);
      setError(null);
      const data = await householdApi.getMy();
      setHousehold(data);
      if (data) {
        await Promise.all([
          loadLeaderboard(data.id),
          loadTransactions(data.id),
          loadBalance(data.id),
          loadAnnouncements(data.id),
          loadChoresDueCount(),
        ]);
      }
    } catch (err: any) {
      console.error('Failed to load household:', err);
      if (err.response?.status !== 404) {
        setError(err.message || 'Failed to load household data');
      }
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

  const loadTransactions = async (householdId: string) => {
    try {
      const data = await transactionsApi.getAll(householdId);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const loadBalance = async (householdId: string) => {
    try {
      const data = await transactionsApi.getMyBalance(householdId);
      setBalance(data);
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const loadAnnouncements = async (householdId: string) => {
    try {
      const data = await bulletinApi.getAnnouncements(householdId);
      setAnnouncements(data);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    }
  };

  const loadChoresDueCount = async () => {
    try {
      const chores = await getMyChores();
      const dueThisWeek = chores.filter((chore) => {
        const dueDate = new Date(chore.dueDate);
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return !chore.isCompleted && dueDate <= weekFromNow;
      });
      setChoresDueCount(dueThisWeek.length);
    } catch (error) {
      console.error('Failed to load chores:', error);
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

  const handleRequestFavor = async () => {
    if (!household) return;

    try {
      await transactionsApi.create(household.id, {
        title: favorTitle,
        description: favorDescription,
        credits: favorCredits,
        assigneeId: favorAssignee || undefined,
      });
      setSnackbar({ open: true, message: 'Favor request created!', severity: 'success' });
      setRequestFavorDialogOpen(false);
      setFavorTitle('');
      setFavorDescription('');
      setFavorCredits(10);
      setFavorAssignee('');
      loadTransactions(household.id);
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to create favor request', severity: 'error' });
    }
  };

  const handleAcceptTask = async (transactionId: string) => {
    if (!household) return;

    try {
      await transactionsApi.accept(household.id, transactionId);
      setSnackbar({ open: true, message: 'Task accepted!', severity: 'success' });
      loadTransactions(household.id);
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to accept task', severity: 'error' });
    }
  };

  const handleCompleteTask = async (transactionId: string) => {
    if (!household) return;

    try {
      await transactionsApi.complete(household.id, transactionId);
      setSnackbar({ open: true, message: 'Task completed! Credits transferred.', severity: 'success' });
      loadTransactions(household.id);
      loadBalance(household.id);
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to complete task', severity: 'error' });
    }
  };

  const handleDeclineTask = async (transactionId: string) => {
    if (!household) return;

    try {
      await transactionsApi.decline(household.id, transactionId);
      setSnackbar({ open: true, message: 'Task declined', severity: 'success' });
      loadTransactions(household.id);
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to decline task', severity: 'error' });
    }
  };

  const handleCancelTask = async (transactionId: string) => {
    if (!household) return;
    if (!confirm('Are you sure you want to cancel this request?')) return;

    try {
      await transactionsApi.cancel(household.id, transactionId);
      setSnackbar({ open: true, message: 'Request cancelled', severity: 'success' });
      loadTransactions(household.id);
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to cancel request', severity: 'error' });
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

  const handleDeleteAnnouncementClick = (id: string) => {
    setAnnouncementToDelete(id);
    setDeleteAnnouncementConfirmOpen(true);
  };

  const handleDeleteAnnouncementConfirm = async () => {
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
      setDeleteAnnouncementConfirmOpen(false);
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
    if (!household) return;

    try {
      const result = await bulletinApi.toggleReaction(id, { emoji });
      const data = await bulletinApi.getAnnouncements(household.id);
      setAnnouncements(data);

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

  const handleEditAnnouncementClick = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setCreateAnnouncementDialogOpen(true);
  };

  const handleAnnouncementDialogClose = () => {
    setCreateAnnouncementDialogOpen(false);
    setEditingAnnouncement(null);
  };

  const handleAnnouncementDialogSubmit = async (data: CreateAnnouncementDto | UpdateAnnouncementDto) => {
    if (editingAnnouncement) {
      await handleUpdateAnnouncement(data as UpdateAnnouncementDto);
    } else {
      await handleCreateAnnouncement(data as CreateAnnouncementDto);
    }
  };

  if (loading) {
    return <LoadingState type="household" count={1} fullPage />;
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 8 }}>
          <ErrorState
            icon="🏠"
            title="Failed to Load Household"
            message={error}
            retryLabel="Try Again"
            onRetry={loadHousehold}
            homeLabel="Go Home"
            onHome={() => navigate('/')}
          />
        </Box>
      </Container>
    );
  }

  // No household - show create/join options
  if (!household) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 8 }}>
          <EmptyState
            icon="🏠"
            title="No Household Yet"
            description="Create your own household to start tracking habits with your family, or join an existing one with an invite code!"
            actionLabel="Create Household"
            onAction={() => setCreateDialogOpen(true)}
            secondaryActionLabel="Join with Code"
            onSecondaryAction={() => setJoinDialogOpen(false)}
          />

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button variant="outlined" onClick={() => navigate('/')} color="inherit">
              Back to Dashboard
            </Button>
          </Box>
        </Box>

        {/* Dialogs */}
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

  // Has household - show CARD-BASED layout (no tabs)
  const pendingFavorsCount = transactions.filter((t) => t.canAccept).length;
  const newPostsCount = announcements.filter((a) => {
    const posted = new Date(a.createdAt);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return posted > dayAgo;
  }).length;

  const topLeaderboard = showAllLeaderboard ? leaderboard : leaderboard.slice(0, 3);
  const recentAnnouncements = showAllAnnouncements ? announcements : announcements.slice(0, 3);
  const visibleMembers = showAllMembers ? household.members : household.members.slice(0, 6);

  return (
    <Container maxWidth="lg">
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              🏛️ {household.name}
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

        {/* ============================================ */}
        {/* LETS BALANCE HERO - THE GAME STATE          */}
        {/* Phase 5A: LETS-First Experience             */}
        {/* ============================================ */}
        {balance && (
          <LetsBalanceHero
            balance={balance}
            onPrimaryAction={() => {
              const feedback = getBalanceFeedback(balance.balance);
              // If receiving support, navigate to available favors
              if (balance.balance < -5) {
                document.getElementById('available-favors-section')?.scrollIntoView({ behavior: 'smooth' });
              } else {
                // If in credit/balanced, open request dialog
                setRequestFavorDialogOpen(true);
              }
            }}
            onSecondaryAction={() => {
              document.getElementById('available-favors-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        {/* Active Now Widget - Household Pulse */}
        <ActiveNowWidget
          pendingFavorsCount={pendingFavorsCount}
          choresDueCount={choresDueCount}
          newPostsCount={newPostsCount}
          householdName={household.name}
        />

        {/* Quick Actions */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              ⚡ Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<FavorIcon />}
                  onClick={() => setRequestFavorDialogOpen(true)}
                  sx={{ py: 1.5 }}
                >
                  Request a Favor
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<BulletinIcon />}
                  onClick={() => setCreateAnnouncementDialogOpen(true)}
                  sx={{ py: 1.5 }}
                >
                  Post Update
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Leaderboard Card - Progressive Disclosure */}
        <Card id="leaderboard-section" sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                🏆 Leaderboard
              </Typography>
              {leaderboard.length > 3 && (
                <Button
                  size="small"
                  endIcon={<ExpandIcon sx={{ transform: showAllLeaderboard ? 'rotate(180deg)' : 'none' }} />}
                  onClick={() => setShowAllLeaderboard(!showAllLeaderboard)}
                >
                  {showAllLeaderboard ? 'Show Less' : `View All (${leaderboard.length})`}
                </Button>
              )}
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Member</TableCell>
                    <TableCell align="right">Level</TableCell>
                    <TableCell align="right">XP</TableCell>
                    <TableCell align="right">Streak</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topLeaderboard.map((entry) => (
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
          </CardContent>
        </Card>

        {/* Recent Bulletin Posts - Progressive Disclosure */}
        <Card id="bulletin-section" sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                📢 Recent Posts
              </Typography>
              {announcements.length > 3 && (
                <Button
                  size="small"
                  endIcon={<ExpandIcon sx={{ transform: showAllAnnouncements ? 'rotate(180deg)' : 'none' }} />}
                  onClick={() => setShowAllAnnouncements(!showAllAnnouncements)}
                >
                  {showAllAnnouncements ? 'Show Less' : `View All (${announcements.length})`}
                </Button>
              )}
            </Box>

            {announcements.length === 0 ? (
              <EmptyState
                icon="📢"
                title="No Announcements Yet"
                description="Be the first to post an announcement!"
                actionLabel="Create Post"
                onAction={() => setCreateAnnouncementDialogOpen(true)}
              />
            ) : (
              <Box>
                {recentAnnouncements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    currentUserId={user?.id}
                    onEdit={handleEditAnnouncementClick}
                    onDelete={handleDeleteAnnouncementClick}
                    onTogglePin={handleTogglePin}
                    onReact={handleReaction}
                  />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* LETS Economy - Available Favors */}
        <Card id="lets-economy-section" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              🤝 Available Favors
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Help your family and earn LETS credits
            </Typography>


            {/* LETS Info - Collapsible Onboarding */}
            <Box sx={{ mb: 3 }}>
              <Button
                size="small"
                onClick={() => setShowLetsInfo(!showLetsInfo)}
                endIcon={<ExpandIcon sx={{ transform: showLetsInfo ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />}
                sx={{ mb: 1 }}
              >
                {showLetsInfo ? 'Hide' : 'Learn about LETS'}
              </Button>
              <Collapse in={showLetsInfo}>
                <Card sx={{ bgcolor: 'info.light', border: '1px solid', borderColor: 'info.main' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom color="info.dark">
                      ℹ️ What is LETS?
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>LETS (Local Exchange Trading System)</strong> is a mutual credit system where your household shares favors using a zero-sum credit economy.
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Key Principles:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, my: 1 }}>
                      <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Negative balances mean support!</strong> When your balance is negative, it means your household has been supporting you. Time to give back!
                      </Typography>
                      <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Zero is the goal:</strong> Perfect equilibrium! You're giving and receiving in harmony.
                      </Typography>
                      <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Mutual credit:</strong> When you request a favor, you create opportunity for others to contribute.
                      </Typography>
                      <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Transparency:</strong> Everyone can see balances to build trust and accountability.
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      How to participate:
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                          <Typography variant="body2" fontWeight={600} gutterBottom>
                            🙋 Request a Favor
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Need help? Click "Request a Favor" and offer credits. Your balance goes negative, creating opportunity for others.
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                          <Typography variant="body2" fontWeight={600} gutterBottom>
                            ✋ Accept a Task
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            See a task you can help with? Accept it! Complete the work and earn credits to balance out.
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Collapse>
            </Box>

            <Grid container spacing={2}>
              {transactions
                .filter((t) => t.canAccept)
                .map((transaction) => (
                  <Grid item xs={12} md={6} key={transaction.id}>
                    <Card sx={{ border: '1px solid', borderColor: 'success.light' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6">{transaction.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Requested by {transaction.requesterName}
                            </Typography>
                          </Box>
                          <Chip label={`${transaction.credits} credits`} color="success" />
                        </Box>
                        {transaction.description && (
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {transaction.description}
                          </Typography>
                        )}
                        <Button
                          variant="contained"
                          size="small"
                          color="success"
                          onClick={() => handleAcceptTask(transaction.id)}
                        >
                          Accept Task
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              {transactions.filter((t) => t.canAccept).length === 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">No available tasks at the moment</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Family Members - Progressive Disclosure */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                👥 Family Members ({household.memberCount})
              </Typography>
              {household.members.length > 6 && (
                <Button
                  size="small"
                  endIcon={<ExpandIcon sx={{ transform: showAllMembers ? 'rotate(180deg)' : 'none' }} />}
                  onClick={() => setShowAllMembers(!showAllMembers)}
                >
                  {showAllMembers ? 'Show Less' : `View All (${household.members.length})`}
                </Button>
              )}
            </Box>

            <Grid container spacing={3}>
              {visibleMembers.map((member) => (
                <Grid item xs={12} sm={6} md={4} key={member.id}>
                  <Card variant="outlined">
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
                          <Typography variant="caption" color="text.secondary">Level</Typography>
                          <Typography variant="body1" fontWeight="bold">{member.level}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Gold</Typography>
                          <Typography variant="body1" fontWeight="bold">{member.gold}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Request Favor Dialog */}
      <Dialog open={requestFavorDialogOpen} onClose={() => setRequestFavorDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request a Favor</DialogTitle>
        <DialogContent>
          <TextField
            label="Task Title"
            fullWidth
            value={favorTitle}
            onChange={(e) => setFavorTitle(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
            placeholder="What do you need help with?"
          />
          <TextField
            label="Description (Optional)"
            fullWidth
            multiline
            rows={3}
            value={favorDescription}
            onChange={(e) => setFavorDescription(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="Provide more details about the task..."
          />
          <TextField
            label="Credits"
            fullWidth
            type="number"
            value={favorCredits}
            onChange={(e) => setFavorCredits(Number(e.target.value))}
            sx={{ mb: 2 }}
            inputProps={{ min: 1, max: 100 }}
          />
          <TextField
            label="Assign to Specific Member (Optional)"
            fullWidth
            select
            value={favorAssignee}
            onChange={(e) => setFavorAssignee(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="">Anyone can accept</option>
            {household?.members
              .filter((m) => m.id !== user?.id)
              .map((member) => (
                <option key={member.id} value={member.id}>
                  {member.displayName || member.username}
                </option>
              ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestFavorDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRequestFavor} variant="contained" disabled={!favorTitle}>
            Request Favor
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Announcement Dialog */}
      {household && (
        <CreateAnnouncementDialog
          open={createAnnouncementDialogOpen}
          householdId={household.id}
          announcement={editingAnnouncement}
          onClose={handleAnnouncementDialogClose}
          onSubmit={handleAnnouncementDialogSubmit}
        />
      )}

      {/* Delete Announcement Confirmation Dialog */}
      <Dialog open={deleteAnnouncementConfirmOpen} onClose={() => setDeleteAnnouncementConfirmOpen(false)}>
        <DialogTitle>Delete Announcement?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this announcement? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAnnouncementConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAnnouncementConfirm} color="error" variant="contained">
            Delete
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
