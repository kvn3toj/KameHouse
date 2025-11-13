import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Stack,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface BulkOperationsDialogProps {
  open: boolean;
  onClose: () => void;
  householdId: string;
  selectedTaskIds?: string[];
  onComplete?: () => void;
}

type BulkOperationType = 'UPDATE_STATUS' | 'DELETE' | 'ASSIGN' | 'RESCHEDULE' | 'TAG' | 'CATEGORY_CHANGE';

export const BulkOperationsDialog: React.FC<BulkOperationsDialogProps> = ({
  open,
  onClose,
  householdId,
  selectedTaskIds = [],
  onComplete,
}) => {
  const { token } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [operation, setOperation] = useState<BulkOperationType>('UPDATE_STATUS');
  const [criteria, setCriteria] = useState<any>({ taskIds: selectedTaskIds });
  const [changes, setChanges] = useState<any>({});
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const steps = ['Select Operation', 'Configure', 'Review', 'Execute'];

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleExecute = async () => {
    setExecuting(true);
    try {
      const response = await api.post('/bulk-operations', {
        householdId,
        operation,
        criteria,
        changes,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResult(response.data);
      handleNext();
      onComplete?.();
    } catch (error) {
      console.error('Bulk operation failed:', error);
      setResult({
        status: 'FAILED',
        error: 'Operation failed. Please try again.',
      });
    } finally {
      setExecuting(false);
    }
  };

  const renderOperationStep = () => (
    <Box>
      <FormControl fullWidth>
        <InputLabel>Operation Type</InputLabel>
        <Select
          value={operation}
          label="Operation Type"
          onChange={(e) => setOperation(e.target.value as BulkOperationType)}
        >
          <MenuItem value="UPDATE_STATUS">Update Status</MenuItem>
          <MenuItem value="DELETE">Delete Tasks</MenuItem>
          <MenuItem value="ASSIGN">Assign Tasks</MenuItem>
          <MenuItem value="RESCHEDULE">Reschedule Tasks</MenuItem>
          <MenuItem value="TAG">Update Tags</MenuItem>
          <MenuItem value="CATEGORY_CHANGE">Change Category</MenuItem>
        </Select>
      </FormControl>

      <Box mt={3}>
        <Typography variant="body2" color="text.secondary">
          {selectedTaskIds.length > 0
            ? `${selectedTaskIds.length} tasks selected`
            : 'No tasks selected. You can select tasks by room, category, or tags in the next step.'}
        </Typography>
      </Box>
    </Box>
  );

  const renderConfigureStep = () => (
    <Stack spacing={3}>
      {/* Criteria Section */}
      {selectedTaskIds.length === 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Select Tasks By:
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Room ID (optional)"
              fullWidth
              value={criteria.roomId || ''}
              onChange={(e) => setCriteria({ ...criteria, roomId: e.target.value })}
            />
            <TextField
              label="Category ID (optional)"
              fullWidth
              value={criteria.categoryId || ''}
              onChange={(e) => setCriteria({ ...criteria, categoryId: e.target.value })}
            />
          </Stack>
        </Box>
      )}

      {/* Changes Section */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Changes to Apply:
        </Typography>
        <Stack spacing={2}>
          {operation === 'UPDATE_STATUS' && (
            <FormControl fullWidth>
              <InputLabel>New Status</InputLabel>
              <Select
                value={changes.status || ''}
                label="New Status"
                onChange={(e) => setChanges({ ...changes, status: e.target.value })}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          )}

          {operation === 'ASSIGN' && (
            <TextField
              label="Assign To (User ID)"
              fullWidth
              value={changes.assignedTo || ''}
              onChange={(e) => setChanges({ ...changes, assignedTo: e.target.value })}
            />
          )}

          {operation === 'RESCHEDULE' && (
            <TextField
              label="Schedule For"
              type="datetime-local"
              fullWidth
              value={changes.scheduledFor || ''}
              onChange={(e) => setChanges({ ...changes, scheduledFor: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          )}

          {operation === 'CATEGORY_CHANGE' && (
            <TextField
              label="New Category ID"
              fullWidth
              value={changes.categoryId || ''}
              onChange={(e) => setChanges({ ...changes, categoryId: e.target.value })}
            />
          )}
        </Stack>
      </Box>
    </Stack>
  );

  const renderReviewStep = () => (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Operation Summary:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="Operation"
              secondary={operation.replace(/_/g, ' ')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Target Tasks"
              secondary={selectedTaskIds.length > 0
                ? `${selectedTaskIds.length} selected tasks`
                : 'Tasks matching criteria'}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Changes"
              secondary={JSON.stringify(changes, null, 2)}
            />
          </ListItem>
        </List>
      </Box>

      <Alert severity="warning">
        This operation cannot be undone. Please review carefully before proceeding.
      </Alert>
    </Stack>
  );

  const renderExecuteStep = () => {
    if (executing) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Executing Operation...
          </Typography>
          <LinearProgress />
        </Box>
      );
    }

    if (result) {
      const isSuccess = result.status === 'COMPLETED';
      return (
        <Stack spacing={2}>
          <Alert severity={isSuccess ? 'success' : 'error'}>
            {isSuccess
              ? `Operation completed successfully!`
              : `Operation failed or completed with errors.`}
          </Alert>

          {result.targetCount && (
            <Box>
              <Typography variant="body2">
                Target Tasks: {result.targetCount}
              </Typography>
              <Typography variant="body2">
                Successful: {result.successCount}
              </Typography>
              {result.failureCount > 0 && (
                <Typography variant="body2" color="error">
                  Failed: {result.failureCount}
                </Typography>
              )}
            </Box>
          )}

          {result.errors && result.errors.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Errors:
              </Typography>
              <List dense>
                {result.errors.map((error: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={error.taskTitle}
                      secondary={error.error}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Stack>
      );
    }

    return null;
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderOperationStep();
      case 1:
        return renderConfigureStep();
      case 2:
        return renderReviewStep();
      case 3:
        return renderExecuteStep();
      default:
        return null;
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Bulk Operations</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mt: 4, minHeight: '300px' }}>
            {getStepContent(activeStep)}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        {activeStep === steps.length - 1 ? (
          <Button onClick={handleClose} variant="contained">
            Close
          </Button>
        ) : (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            {activeStep > 0 && (
              <Button onClick={handleBack}>
                Back
              </Button>
            )}
            {activeStep < steps.length - 2 && (
              <Button onClick={handleNext} variant="contained">
                Next
              </Button>
            )}
            {activeStep === steps.length - 2 && (
              <Button onClick={handleExecute} variant="contained" disabled={executing}>
                Execute
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
