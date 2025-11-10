import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  AccountBalance as BalanceIcon,
  TrendingUp as EarnedIcon,
  TrendingDown as SpentIcon,
} from '@mui/icons-material';
import { transactionsApi } from '@/lib/transactions-api';
import { householdApi } from '@/lib/household-api';
import type { Transaction, CreateTransactionDto, UserBalance, TransactionStatus } from '@/types/transaction';
import type { HouseholdMember } from '@/types/household';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import FavorCard from '@/components/FavorCard';
import { useNavigate } from 'react-router-dom';

type TabValue = 'all' | 'open' | 'my-requests' | 'my-tasks' | 'completed';

export default function Marketplace() {
  const navigate = useNavigate();
  const [household, setHousehold] = useState<any>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [favors, setFavors] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabValue>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [newFavor, setNewFavor] = useState<CreateTransactionDto>({
    title: '',
    description: '',
    credits: 10,
    assigneeId: undefined,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const householdData = await householdApi.getMy();
      if (!householdData) {
        setError('You must join a household to access the marketplace');
        setLoading(false);
        return;
      }

      setHousehold(householdData);

      // Use the members from the household data directly instead of making another API call
      setMembers(householdData.members || []);

      // Load transactions and balance in parallel
      const [favorsData, balanceData] = await Promise.all([
        transactionsApi.getAll(householdData.id),
        transactionsApi.getMyBalance(householdData.id),
      ]);

      setFavors(favorsData);
      setBalance(balanceData);
    } catch (err: any) {
      console.error('Failed to load marketplace data:', err);

      // Handle authentication errors
      if (err.message?.includes('Unauthorized') || err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (err.message?.includes('household')) {
        setError('You must join a household to access the marketplace');
      } else {
        setError(err.message || 'Failed to load marketplace');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFavor = async () => {
    if (!household) return;

    try {
      await transactionsApi.create(household.id, newFavor);
      setDialogOpen(false);
      setNewFavor({ title: '', description: '', credits: 10, assigneeId: undefined });
      await loadData();
      setSnackbar({ open: true, message: 'Favor request created!', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to create favor', severity: 'error' });
    }
  };

  const handleAccept = async (favorId: string) => {
    if (!household) return;

    try {
      await transactionsApi.accept(household.id, favorId);
      await loadData();
      setSnackbar({ open: true, message: 'Task accepted!', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to accept task', severity: 'error' });
    }
  };

  const handleComplete = async (favorId: string) => {
    if (!household) return;

    try {
      await transactionsApi.complete(household.id, favorId);
      await loadData();
      setSnackbar({ open: true, message: 'Task completed! Credits transferred.', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to complete task', severity: 'error' });
    }
  };

  const handleDecline = async (favorId: string) => {
    if (!household) return;

    try {
      await transactionsApi.decline(household.id, favorId);
      await loadData();
      setSnackbar({ open: true, message: 'Task declined', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to decline task', severity: 'error' });
    }
  };

  const handleCancel = async (favorId: string) => {
    if (!household) return;
    if (!confirm('Are you sure you want to cancel this favor request?')) return;

    try {
      await transactionsApi.cancel(household.id, favorId);
      await loadData();
      setSnackbar({ open: true, message: 'Favor request cancelled', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to cancel favor', severity: 'error' });
    }
  };

  const getFilteredFavors = () => {
    switch (selectedTab) {
      case 'open':
        return favors.filter(f => f.status === 'PENDING' && !f.assigneeId);
      case 'my-requests':
        return favors.filter(f => balance && f.requesterId === balance.userId);
      case 'my-tasks':
        return favors.filter(f => balance && f.assigneeId === balance.userId);
      case 'completed':
        return favors.filter(f => f.status === 'COMPLETED');
      default:
        return favors;
    }
  };

  const filteredFavors = getFilteredFavors();

  if (loading) {
    return <LoadingState type="marketplace" count={6} fullPage />;
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 8 }}>
          <ErrorState
            icon="💰"
            title="Failed to Load Marketplace"
            message={error}
            retryLabel="Try Again"
            onRetry={loadData}
            homeLabel="Go Home"
            onHome={() => navigate('/')}
          />
        </Box>
      </Container>
    );
  }

  if (!household) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 8 }}>
          <EmptyState
            icon="🏠"
            title="No Household"
            description="Join or create a household to access the LETS marketplace and start exchanging favors!"
            actionLabel="Go to Family"
            onAction={() => navigate('/family')}
          />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              💰 LETS Marketplace
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
              Request Favor
            </Button>
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Exchange favors using LETS (Local Exchange Trading System) credits. Help your household members
            and earn credits!
          </Typography>

          {/* Balance Cards */}
          {balance && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: balance.isInDebt ? 'error.main' : 'success.main', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <BalanceIcon />
                      <Typography variant="body2" fontWeight={600}>
                        Balance
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight={700}>
                      {balance.balance > 0 ? '+' : ''}
                      {balance.balance}
                    </Typography>
                    <Typography variant="caption">
                      {balance.isInDebt ? 'You owe the community' : 'Net contributor!'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <EarnedIcon color="success" />
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        Total Earned
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      +{balance.totalEarned}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      From completed tasks
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <SpentIcon color="error" />
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        Total Spent
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="error.main">
                      -{balance.totalSpent}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      On requested favors
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>

        {/* Tabs */}
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab label={`All (${favors.length})`} value="all" />
            <Tab label={`Open (${favors.filter(f => f.status === 'PENDING' && !f.assigneeId).length})`} value="open" />
            <Tab label="My Requests" value="my-requests" />
            <Tab label="My Tasks" value="my-tasks" />
            <Tab label={`Completed (${favors.filter(f => f.status === 'COMPLETED').length})`} value="completed" />
          </Tabs>
        </Box>

        {/* Favors Grid */}
        {filteredFavors.length === 0 ? (
          <EmptyState
            icon="💼"
            title="No Favors Found"
            description={
              selectedTab === 'open'
                ? 'No open favors available right now. Create a new request to get started!'
                : selectedTab === 'my-requests'
                ? "You haven't requested any favors yet. Click 'Request Favor' to create one!"
                : selectedTab === 'my-tasks'
                ? "You haven't accepted any tasks yet. Check the 'Open' tab to find available tasks!"
                : 'No favors match this filter.'
            }
            actionLabel={selectedTab === 'open' || selectedTab === 'my-requests' ? 'Request Favor' : undefined}
            onAction={selectedTab === 'open' || selectedTab === 'my-requests' ? () => setDialogOpen(true) : undefined}
            secondaryActionLabel="View All Favors"
            onSecondaryAction={() => setSelectedTab('all')}
          />
        ) : (
          <Grid container spacing={3}>
            {filteredFavors.map(favor => (
              <Grid item xs={12} sm={6} md={4} key={favor.id}>
                <FavorCard
                  favor={favor}
                  onAccept={handleAccept}
                  onComplete={handleComplete}
                  onDecline={handleDecline}
                  onCancel={handleCancel}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Create Favor Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request a Favor</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="What do you need help with?"
              value={newFavor.title}
              onChange={e => setNewFavor({ ...newFavor, title: e.target.value })}
              required
              fullWidth
              placeholder="e.g., Help with grocery shopping"
            />

            <TextField
              label="Description (optional)"
              value={newFavor.description}
              onChange={e => setNewFavor({ ...newFavor, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
              placeholder="Provide more details about what you need..."
            />

            <TextField
              label="LETS Credits"
              type="number"
              value={newFavor.credits}
              onChange={e => setNewFavor({ ...newFavor, credits: parseInt(e.target.value) || 0 })}
              required
              fullWidth
              inputProps={{ min: 1, max: 1000 }}
              helperText="How many credits is this favor worth?"
            />

            <FormControl fullWidth>
              <InputLabel>Assign to (optional)</InputLabel>
              <Select
                value={newFavor.assigneeId || ''}
                label="Assign to (optional)"
                onChange={e => setNewFavor({ ...newFavor, assigneeId: e.target.value || undefined })}
              >
                <MenuItem value="">
                  <em>Anyone can accept</em>
                </MenuItem>
                {members.map(member => (
                  <MenuItem key={member.userId} value={member.userId}>
                    {member.user.displayName || member.user.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateFavor} variant="contained" disabled={!newFavor.title.trim()}>
            Request Favor
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
