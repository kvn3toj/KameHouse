import { createTheme, alpha } from '@mui/material/styles';

/**
 * Sacred Geometry Constants
 * Based on universal design principles
 */
export const PHI = 1.618; // Golden Ratio
export const FIBONACCI = [0, 8, 13, 21, 34, 55, 89, 144] as const;

/**
 * KameHouse Theme
 * Built on Sacred Geometry and Material Design principles
 */
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366F1', // Purple/Indigo - Level, brand, primary actions
      light: '#818CF8',
      dark: '#4F46E5',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#10B981', // Green - XP, achievements, completion
      light: '#34D399',
      dark: '#059669',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F59E0B', // Yellow/Amber - Gold, streaks, attention
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EF4444', // Red - Health, errors, critical states
      light: '#F87171',
      dark: '#DC2626',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F9FAFB', // Light gray
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827', // Almost black
      secondary: '#6B7280', // Gray
      disabled: '#9CA3AF', // Light gray
    },
    divider: alpha('#111827', 0.12),
  },

  typography: {
    fontFamily: [
      '"Inter"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    fontSize: 16,

    // Golden ratio typography scale
    h1: {
      fontSize: `${PHI * PHI}rem`, // 2.618rem ≈ 42px
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: `${PHI * 1.236}rem`, // 2rem ≈ 32px
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: `${PHI}rem`, // 1.618rem ≈ 26px
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem', // 20px
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h5: {
      fontSize: '1.125rem', // 18px
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem', // 16px
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem', // 16px
      lineHeight: PHI, // Golden ratio line height (1.618)
    },
    body2: {
      fontSize: '0.875rem', // 14px
      lineHeight: 1.5,
    },
    button: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      textTransform: 'none', // No uppercase
    },
    caption: {
      fontSize: '0.75rem', // 12px
      lineHeight: 1.5,
      color: '#6B7280',
    },
  },

  spacing: (factor: number) => {
    // Fibonacci-based spacing scale
    const index = Math.min(Math.floor(Math.abs(factor)), FIBONACCI.length - 1);
    return factor < 0 ? -FIBONACCI[index] : FIBONACCI[index];
  },

  shape: {
    borderRadius: 13, // Fibonacci number
  },

  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.06)',
    '0 2px 4px rgba(0,0,0,0.08)',
    '0 4px 8px rgba(0,0,0,0.10)',
    '0 8px 16px rgba(0,0,0,0.12)',
    '0 12px 24px rgba(0,0,0,0.14)',
    '0 16px 32px rgba(0,0,0,0.16)',
    '0 20px 40px rgba(0,0,0,0.18)',
    '0 24px 48px rgba(0,0,0,0.20)',
    // Rest are defaults
    ...Array(16).fill('none'),
  ] as any,

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 13, // Fibonacci
          padding: '13px 21px', // Fibonacci numbers
          fontSize: '1rem',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',

          '&:hover': {
            boxShadow: '0 4px 13px rgba(0,0,0,0.15)',
            transform: 'translateY(-1px)',
          },

          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 8px 21px rgba(0,0,0,0.18)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
        sizeSmall: {
          padding: '8px 13px', // Fibonacci
          fontSize: '0.875rem',
        },
        sizeLarge: {
          padding: '13px 34px', // Fibonacci
          fontSize: '1.125rem',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 21, // Fibonacci
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',

          '&:hover': {
            boxShadow: '0 4px 13px rgba(0,0,0,0.12)',
          },
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 21, // Fibonacci
          '&:last-child': {
            paddingBottom: 21,
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 34, // Fibonacci (pill shape)
          fontSize: '0.875rem',
          fontWeight: 500,
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 13, // Fibonacci
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 21, // Fibonacci
        },
        rounded: {
          borderRadius: 21,
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 13, // Fibonacci
          borderRadius: 8,
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 13, // Fibonacci
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 21, // Fibonacci
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        },
      },
    },
  },

  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
});

/**
 * Export spacing helpers
 */
export const spacing = {
  xs: 8,
  sm: 13,
  md: 21,
  lg: 34,
  xl: 55,
  xxl: 89,
} as const;

/**
 * Export breakpoint helpers
 */
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
} as const;

export default theme;
