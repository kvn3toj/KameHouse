/**
 * KameHouse Unified Design System
 *
 * This file centralizes all design decisions to ensure visual coherence
 * across all pages and components.
 */

import { alpha } from '@mui/material/styles';

// ========================================
// 🎨 COLOR SYSTEM
// ========================================

/**
 * Semantic Color Palette
 * Each color has a specific meaning and use case
 */
export const COLORS = {
  // Primary Brand Colors
  primary: {
    main: '#6366F1',      // Indigo - Main brand color
    light: '#818CF8',
    dark: '#4F46E5',
    subtle: alpha('#6366F1', 0.1),
    hover: alpha('#6366F1', 0.04),
  },

  // Secondary/Accent
  secondary: {
    main: '#EC4899',      // Pink - Motivation, celebration
    light: '#F472B6',
    dark: '#DB2777',
    subtle: alpha('#EC4899', 0.1),
    hover: alpha('#EC4899', 0.04),
  },

  // Success States
  success: {
    main: '#10B981',      // Green - Achievements, completion
    light: '#34D399',
    dark: '#059669',
    subtle: alpha('#10B981', 0.1),
    hover: alpha('#10B981', 0.04),
  },

  // Warning/Attention
  warning: {
    main: '#F59E0B',      // Amber - Streaks, attention
    light: '#FBBF24',
    dark: '#D97706',
    subtle: alpha('#F59E0B', 0.1),
    hover: alpha('#F59E0B', 0.04),
  },

  // Error/Critical
  error: {
    main: '#EF4444',      // Red - Errors, failures
    light: '#F87171',
    dark: '#DC2626',
    subtle: alpha('#EF4444', 0.1),
    hover: alpha('#EF4444', 0.04),
  },

  // Info/Neutral
  info: {
    main: '#3B82F6',      // Blue - Information
    light: '#60A5FA',
    dark: '#2563EB',
    subtle: alpha('#3B82F6', 0.1),
    hover: alpha('#3B82F6', 0.04),
  },

  // Neutrals/Grays
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Backgrounds
  background: {
    default: '#F9FAFB',
    paper: '#FFFFFF',
    elevated: '#FFFFFF',
    subtle: alpha('#6366F1', 0.02),
  },

  // Text
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    disabled: '#9CA3AF',
    inverse: '#FFFFFF',
  },

  // Borders
  border: {
    light: alpha('#111827', 0.08),
    main: alpha('#111827', 0.12),
    strong: alpha('#111827', 0.16),
  },
} as const;

// ========================================
// 🔢 SPACING SYSTEM
// ========================================

/**
 * Fibonacci-based Spacing Scale
 * Provides harmonious spacing relationships
 */
export const SPACING = {
  0: 0,
  xs: 8,      // Small gaps, tight spacing
  sm: 13,     // Component internal spacing
  md: 21,     // Standard gaps
  lg: 34,     // Section spacing
  xl: 55,     // Page-level spacing
  xxl: 89,    // Hero sections
} as const;

// ========================================
// 📐 LAYOUT CONSTANTS
// ========================================

export const LAYOUT = {
  // Container widths
  container: {
    xs: '100%',
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1440,
  },

  // Header/AppBar
  appBar: {
    height: 64,
    mobileHeight: 56,
  },

  // Bottom Navigation (mobile)
  bottomNav: {
    height: 64,
  },

  // Sidebar (if needed)
  sidebar: {
    width: 280,
    collapsed: 64,
  },

  // Common card dimensions
  card: {
    minHeight: 200,
    padding: SPACING.md,
  },
} as const;

// ========================================
// 🎭 ICON SYSTEM
// ========================================

/**
 * Standardized Icon Mappings
 * Use these constants instead of importing icons directly
 */
export const ICONS = {
  // Navigation
  home: 'Home',
  dashboard: 'Dashboard',
  habits: 'CheckCircle',
  quests: 'EmojiEvents',
  achievements: 'MilitaryTech',
  marketplace: 'Storefront',
  bulletin: 'Announcement',
  chores: 'Cleaning Services',
  tasks: 'Assignment',
  templo: 'AccountBalance',

  // Actions
  add: 'Add',
  edit: 'Edit',
  delete: 'Delete',
  save: 'Save',
  cancel: 'Close',
  search: 'Search',
  filter: 'FilterList',
  more: 'MoreVert',
  refresh: 'Refresh',
  settings: 'Settings',

  // Status
  complete: 'CheckCircle',
  incomplete: 'RadioButtonUnchecked',
  pending: 'Schedule',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
  success: 'CheckCircle',

  // User
  profile: 'Person',
  logout: 'Logout',
  login: 'Login',
  register: 'PersonAdd',

  // Progress
  streak: 'Whatshot',
  level: 'TrendingUp',
  points: 'Stars',
  xp: 'AutoAwesome',

  // Social
  household: 'People',
  family: 'FamilyRestroom',
  share: 'Share',
  comment: 'Comment',

  // Time
  calendar: 'CalendarToday',
  clock: 'Schedule',
  history: 'History',

  // Misc
  favorite: 'Favorite',
  notification: 'Notifications',
  help: 'HelpOutline',
  close: 'Close',
} as const;

// ========================================
// 🎨 COMPONENT VARIANTS
// ========================================

/**
 * Reusable component style configurations
 */
export const COMPONENTS = {
  // Page Container
  page: {
    padding: SPACING.lg,
    mobilePadding: SPACING.md,
    maxWidth: LAYOUT.container.lg,
    backgroundColor: COLORS.background.default,
  },

  // Page Header
  pageHeader: {
    marginBottom: SPACING.lg,
    title: {
      variant: 'h2' as const,
      color: COLORS.text.primary,
      marginBottom: SPACING.xs,
    },
    subtitle: {
      variant: 'body1' as const,
      color: COLORS.text.secondary,
    },
  },

  // Cards
  card: {
    standard: {
      borderRadius: 21,
      padding: SPACING.md,
      backgroundColor: COLORS.background.paper,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    elevated: {
      borderRadius: 21,
      padding: SPACING.md,
      backgroundColor: COLORS.background.paper,
      boxShadow: '0 4px 13px rgba(0,0,0,0.12)',
    },
    interactive: {
      borderRadius: 21,
      padding: SPACING.md,
      backgroundColor: COLORS.background.paper,
      cursor: 'pointer',
      transition: 'all 250ms ease',
      '&:hover': {
        boxShadow: '0 8px 21px rgba(0,0,0,0.15)',
        transform: 'translateY(-2px)',
      },
    },
  },

  // Buttons
  button: {
    primary: {
      variant: 'contained' as const,
      color: 'primary' as const,
    },
    secondary: {
      variant: 'outlined' as const,
      color: 'primary' as const,
    },
    action: {
      variant: 'contained' as const,
      size: 'large' as const,
    },
  },

  // Lists
  list: {
    gap: SPACING.sm,
    itemPadding: SPACING.sm,
  },
} as const;

// ========================================
// 📊 STATUS COLORS
// ========================================

/**
 * Status-specific color mappings
 */
export const STATUS_COLORS = {
  // Quest/Task Status
  completed: COLORS.success.main,
  pending: COLORS.warning.main,
  failed: COLORS.error.main,
  active: COLORS.info.main,
  locked: COLORS.neutral[400],

  // Habit Streaks
  streak: {
    hot: COLORS.error.main,        // 🔥 Active streak
    cold: COLORS.neutral[400],      // Broken streak
    milestone: COLORS.secondary.main, // Special milestones
  },

  // Transaction Types
  earned: COLORS.success.main,
  spent: COLORS.error.main,
  pending: COLORS.warning.main,
} as const;

// ========================================
// 🎯 SEMANTIC HELPERS
// ========================================

/**
 * Helper functions for common patterns
 */
export const HELPERS = {
  /**
   * Get color for completion percentage
   */
  getProgressColor: (percentage: number) => {
    if (percentage >= 100) return COLORS.success.main;
    if (percentage >= 75) return COLORS.info.main;
    if (percentage >= 50) return COLORS.warning.main;
    return COLORS.error.main;
  },

  /**
   * Get color for level/tier
   */
  getLevelColor: (level: number) => {
    if (level >= 10) return COLORS.secondary.main;  // Master
    if (level >= 7) return COLORS.primary.main;    // Expert
    if (level >= 4) return COLORS.info.main;       // Intermediate
    return COLORS.success.main;                    // Beginner
  },

  /**
   * Get background color with opacity
   */
  getBgColor: (color: string, opacity: number = 0.1) => {
    return alpha(color, opacity);
  },

  /**
   * Get status badge styles
   */
  getStatusBadge: (status: 'completed' | 'pending' | 'failed' | 'active') => ({
    backgroundColor: HELPERS.getBgColor(STATUS_COLORS[status]),
    color: STATUS_COLORS[status],
    fontWeight: 600,
  }),
} as const;

// ========================================
// 🎨 GRADIENTS
// ========================================

export const GRADIENTS = {
  primary: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.dark} 100%)`,
  success: `linear-gradient(135deg, ${COLORS.success.main} 0%, ${COLORS.success.dark} 100%)`,
  warning: `linear-gradient(135deg, ${COLORS.warning.main} 0%, ${COLORS.warning.dark} 100%)`,
  info: `linear-gradient(135deg, ${COLORS.info.main} 0%, ${COLORS.info.dark} 100%)`,
  rainbow: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.secondary.main} 100%)`,
} as const;

// ========================================
// 🎭 ANIMATION PRESETS
// ========================================

export const ANIMATIONS = {
  // Micro-interactions
  hover: {
    transform: 'translateY(-2px)',
    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  tap: {
    transform: 'scale(0.98)',
    transition: 'transform 150ms ease',
  },

  // Fade
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 300,
  },

  // Slide
  slideUp: {
    from: { transform: 'translateY(20px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    duration: 400,
  },
} as const;

export default {
  COLORS,
  SPACING,
  LAYOUT,
  ICONS,
  COMPONENTS,
  STATUS_COLORS,
  HELPERS,
  GRADIENTS,
  ANIMATIONS,
};
