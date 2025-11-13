import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Category as CategoryIcon,
  Label as TagIcon,
} from '@mui/icons-material';
import { CategoryManager } from '@/components/Categories/CategoryManager';
import { householdApi } from '@/lib/household-api';
import type { Household } from '@/types/household';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function HouseholdSettings() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHousehold();
  }, []);

  const loadHousehold = async () => {
    try {
      setLoading(true);
      setError(null);
      const householdData = await householdApi.getMy();
      setHousehold(householdData);
    } catch (err: any) {
      setError(err.message || 'Error loading household');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error || !household) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Household not found'}
          </Alert>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/kamehouse')}
          >
            Back to KameHouse
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/kamehouse')}
            sx={{ mb: 2 }}
          >
            Back to KameHouse
          </Button>

          <Typography variant="h3" fontWeight={700} gutterBottom>
            Household Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your household categories, tags, and room templates
          </Typography>
        </Box>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="household settings tabs"
          >
            <Tab
              icon={<CategoryIcon />}
              label="Categories"
              id="settings-tab-0"
              aria-controls="settings-tabpanel-0"
            />
            <Tab
              icon={<TagIcon />}
              label="Tags"
              id="settings-tab-1"
              aria-controls="settings-tabpanel-1"
              disabled
            />
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <CategoryManager householdId={household.id} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Typography variant="body1" color="text.secondary">
            Tags management coming soon...
          </Typography>
        </TabPanel>
      </Box>
    </Container>
  );
}
