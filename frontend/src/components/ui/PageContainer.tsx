import { Box, Container, Typography, BoxProps } from '@mui/material';
import { ReactNode } from 'react';
import { COMPONENTS, SPACING } from '../../theme/design-system';

interface PageContainerProps extends Omit<BoxProps, 'title'> {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  action?: ReactNode;
}

/**
 * PageContainer - Unified page wrapper
 * Use this for consistent page layouts across the app
 */
export const PageContainer = ({
  children,
  title,
  subtitle,
  maxWidth = 'lg',
  action,
  ...boxProps
}: PageContainerProps) => {
  return (
    <Box
      sx={{
        py: { xs: SPACING.md, md: SPACING.lg },
        px: { xs: SPACING.sm, md: SPACING.md },
        ...boxProps.sx,
      }}
      {...boxProps}
    >
      <Container maxWidth={maxWidth}>
        {/* Page Header */}
        {(title || subtitle || action) && (
          <Box sx={{ mb: COMPONENTS.pageHeader.marginBottom }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: SPACING.md,
                flexWrap: 'wrap',
              }}
            >
              <Box>
                {title && (
                  <Typography
                    variant={COMPONENTS.pageHeader.title.variant}
                    color={COMPONENTS.pageHeader.title.color}
                    sx={{ mb: COMPONENTS.pageHeader.title.marginBottom }}
                  >
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography
                    variant={COMPONENTS.pageHeader.subtitle.variant}
                    color={COMPONENTS.pageHeader.subtitle.color}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>

              {/* Optional action button/element */}
              {action && <Box>{action}</Box>}
            </Box>
          </Box>
        )}

        {/* Page Content */}
        {children}
      </Container>
    </Box>
  );
};

export default PageContainer;
