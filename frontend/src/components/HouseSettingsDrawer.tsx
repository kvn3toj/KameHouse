import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Collapse,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  People as PeopleIcon,
  Tune as TuneIcon,
  Home as HomeIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface HouseSettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  household: {
    id: string;
    name: string;
    inviteCode: string;
  } | null;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
}

/**
 * HouseSettingsDrawer - House configuration and invitation management
 * Implements Aria's UX design with invitation code in a better location
 * Based on research: Hybrid approach (header button + settings drawer)
 */
export default function HouseSettingsDrawer({
  open,
  onClose,
  household,
  anchor = 'right'
}: HouseSettingsDrawerProps) {
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [inviteCodeExpanded, setInviteCodeExpanded] = useState(true);

  const handleCopyInviteCode = () => {
    if (household?.inviteCode) {
      navigator.clipboard.writeText(household.inviteCode);
      setSnackbarOpen(true);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!household) {
    return (
      <Drawer
        anchor={anchor}
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 360 },
            borderTopLeftRadius: { xs: 16, sm: 0 },
            borderTopRightRadius: { xs: 16, sm: 0 },
          }
        }}
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Household
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create or join a household to access settings
          </Typography>
        </Box>
      </Drawer>
    );
  }

  return (
    <>
      <Drawer
        anchor={anchor}
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 360 },
            borderTopLeftRadius: { xs: 16, sm: 0 },
            borderTopRightRadius: { xs: 16, sm: 0 },
          }
        }}
      >
        {/* Drawer Handle (mobile) */}
        <Box
          sx={{
            display: { xs: 'flex', sm: 'none' },
            justifyContent: 'center',
            py: 1.5,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 4,
              bgcolor: 'divider',
              borderRadius: 2,
            }}
          />
        </Box>

        {/* Header */}
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            House Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {household.name}
          </Typography>
        </Box>

        <Divider />

        {/* Invitation Code Section */}
        <Box sx={{ px: 2, py: 1 }}>
          <ListItemButton
            onClick={() => setInviteCodeExpanded(!inviteCodeExpanded)}
            sx={{ borderRadius: 1 }}
          >
            <ListItemIcon>
              <CopyIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Invitation Code"
              secondary="Invite family members"
            />
            <ExpandMoreIcon
              sx={{
                transform: inviteCodeExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
              }}
            />
          </ListItemButton>

          <Collapse in={inviteCodeExpanded}>
            <Box sx={{ px: 2, py: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                  border: '1px solid',
                  borderColor: 'primary.light',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'monospace',
                    letterSpacing: 2,
                    fontSize: '1rem',
                  }}
                >
                  {household.inviteCode}
                </Typography>
                <IconButton
                  size="small"
                  onClick={handleCopyInviteCode}
                  aria-label="Copy invitation code"
                  color="primary"
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Paper>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Share this code to invite family members to your household
              </Typography>
            </Box>
          </Collapse>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Settings Menu */}
        <List>
          <ListItemButton onClick={() => handleNavigation('/household/members')}>
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText
              primary="Manage Members"
              secondary="View and administer family"
            />
          </ListItemButton>

          <ListItemButton onClick={() => handleNavigation('/household/details')}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText
              primary="House Details"
              secondary="Name, description, settings"
            />
          </ListItemButton>

          <ListItemButton onClick={() => handleNavigation('/household/preferences')}>
            <ListItemIcon>
              <TuneIcon />
            </ListItemIcon>
            <ListItemText
              primary="Preferences"
              secondary="Notifications, privacy"
            />
          </ListItemButton>
        </List>

        {/* Footer Info */}
        <Box sx={{ px: 3, py: 2, mt: 'auto' }}>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Manage your household configuration and invite family members
          </Typography>
        </Box>
      </Drawer>

      {/* Snackbar for copy confirmation */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Invitation code copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
}
