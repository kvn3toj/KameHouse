import { ReactNode } from 'react';
import { Box } from '@mui/material';
import ErrorBoundary from './ErrorBoundary';
import NavigationBar from './NavigationBar';
import BottomNavigation from './BottomNavigation';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout wrapper for authenticated pages
 * Includes NavigationBar at the top and BottomNavigation on mobile
 */
export default function Layout({ children }: LayoutProps) {
  return (
    <ErrorBoundary>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <ErrorBoundary>
          <NavigationBar />
        </ErrorBoundary>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pb: { xs: 10, md: 0 }, // Add bottom padding on mobile to account for bottom nav
          }}
        >
          {children}
        </Box>
        <ErrorBoundary>
          <BottomNavigation />
        </ErrorBoundary>
      </Box>
    </ErrorBoundary>
  );
}
