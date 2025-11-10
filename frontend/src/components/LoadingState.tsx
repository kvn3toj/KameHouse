import { Box, Container, Skeleton, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface LoadingStateProps {
  /** Type of loading state to display */
  type?: 'habits' | 'achievements' | 'household' | 'generic';
  /** Number of skeleton items to show */
  count?: number;
  /** Show as full page or inline */
  fullPage?: boolean;
}

/**
 * Beautiful loading skeleton states for different content types
 *
 * @example
 * ```tsx
 * if (loading) {
 *   return <LoadingState type="habits" count={3} />;
 * }
 * ```
 */
export default function LoadingState({
  type = 'generic',
  count = 3,
  fullPage = false,
}: LoadingStateProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'habits':
        return (
          <>
            {Array.from({ length: count }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="40%" height={32} />
                      <Skeleton variant="text" width="70%" height={20} sx={{ mt: 1 }} />
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Skeleton variant="rounded" width={80} height={24} />
                        <Skeleton variant="rounded" width={80} height={24} />
                        <Skeleton variant="rounded" width={80} height={24} />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Skeleton variant="circular" width={40} height={40} />
                      <Skeleton variant="circular" width={40} height={40} />
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            ))}
          </>
        );

      case 'achievements':
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2 }}>
            {Array.from({ length: count }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', mb: 2 }} />
                  <Skeleton variant="text" width="80%" height={28} sx={{ mx: 'auto' }} />
                  <Skeleton variant="text" width="100%" height={20} sx={{ mt: 1 }} />
                  <Skeleton variant="text" width="60%" height={20} sx={{ mx: 'auto', mt: 1 }} />
                </Paper>
              </motion.div>
            ))}
          </Box>
        );

      case 'household':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Paper sx={{ p: 3, mb: 3 }}>
              <Skeleton variant="text" width="30%" height={36} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="50%" height={24} sx={{ mb: 3 }} />
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" width={100} height={100} />
                ))}
              </Box>
            </Paper>
          </motion.div>
        );

      default:
        return (
          <>
            {Array.from({ length: count }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Skeleton variant="rectangular" height={100} sx={{ mb: 2, borderRadius: 2 }} />
              </motion.div>
            ))}
          </>
        );
    }
  };

  const content = renderSkeleton();

  if (fullPage) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {content}
        </Box>
      </Container>
    );
  }

  return <>{content}</>;
}
