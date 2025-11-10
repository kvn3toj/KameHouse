import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from '@mui/material';
import {
  Home as HomeIcon,
  Group as GroupIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { householdApi } from '@/lib/household-api';

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type WelcomeStep = 'intro' | 'choice' | 'create' | 'join';

/**
 * First-time user welcome modal
 * Guides users through household creation or joining
 */
export default function WelcomeModal({ open, onClose, onSuccess }: WelcomeModalProps) {
  const [step, setStep] = useState<WelcomeStep>('intro');
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateHousehold = async () => {
    if (!householdName.trim()) {
      setError('Please enter a household name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await householdApi.create({ name: householdName });

      // Mark as completed in localStorage
      localStorage.setItem('kh_welcome_dismissed', 'true');
      localStorage.setItem('household-just-created', 'true');

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create household');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinHousehold = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await householdApi.join({ inviteCode });

      // Mark as completed in localStorage
      localStorage.setItem('kh_welcome_dismissed', 'true');

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to join household');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('kh_welcome_dismissed', 'true');
    onClose();
  };

  const renderContent = () => {
    switch (step) {
      case 'intro':
        return (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <HomeIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              </motion.div>

              <Typography variant="h4" fontWeight={700} gutterBottom>
                Welcome to KameHouse! 🏠
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                KameHouse is a gamified household management system that makes chores, habits, and family
                collaboration fun! Let's get you started.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setStep('choice')}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    px: 4,
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleSkip}
                  color="inherit"
                >
                  Skip for Now
                </Button>
              </Box>
            </Box>
          </motion.div>
        );

      case 'choice':
        return (
          <motion.div
            key="choice"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Box sx={{ py: 3 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom textAlign="center" sx={{ mb: 4 }}>
                Choose Your Path
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Create Household Option */}
                <Box
                  onClick={() => setStep('create')}
                  sx={{
                    p: 3,
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      background: 'rgba(102, 126, 234, 0.1)',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(102, 126, 234, 0.2)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <HomeIcon sx={{ fontSize: 32, color: 'white' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        Create New Household
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Start your own household and invite family members
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Join Household Option */}
                <Box
                  onClick={() => setStep('join')}
                  sx={{
                    p: 3,
                    border: '2px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      background: 'rgba(102, 126, 234, 0.05)',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'rgba(102, 126, 234, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <GroupIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        Join Existing Household
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Enter an invite code to join a family household
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button onClick={() => setStep('intro')} color="inherit">
                  Back
                </Button>
              </Box>
            </Box>
          </motion.div>
        );

      case 'create':
        return (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Box sx={{ py: 3 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom textAlign="center" sx={{ mb: 1 }}>
                Create Your Household
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
                Choose a name that represents your family
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Household Name"
                placeholder="e.g., The Smith Family"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                disabled={loading}
                autoFocus
                sx={{ mb: 3 }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateHousehold();
                  }
                }}
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  onClick={() => setStep('choice')}
                  disabled={loading}
                  color="inherit"
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCreateHousehold}
                  disabled={loading || !householdName.trim()}
                  startIcon={loading ? null : <CheckIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    px: 4,
                  }}
                >
                  {loading ? 'Creating...' : 'Create Household'}
                </Button>
              </Box>
            </Box>
          </motion.div>
        );

      case 'join':
        return (
          <motion.div
            key="join"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Box sx={{ py: 3 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom textAlign="center" sx={{ mb: 1 }}>
                Join a Household
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
                Enter the invite code shared by your household owner
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Invite Code"
                placeholder="Enter invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                disabled={loading}
                autoFocus
                sx={{ mb: 3 }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleJoinHousehold();
                  }
                }}
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  onClick={() => setStep('choice')}
                  disabled={loading}
                  color="inherit"
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleJoinHousehold}
                  disabled={loading || !inviteCode.trim()}
                  startIcon={loading ? null : <CheckIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    px: 4,
                  }}
                >
                  {loading ? 'Joining...' : 'Join Household'}
                </Button>
              </Box>
            </Box>
          </motion.div>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason !== 'backdropClick') {
          onClose();
        }
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          backdropFilter: 'blur(10px)',
        },
      }}
    >
      <DialogContent>
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
