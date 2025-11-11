/**
 * LETS Emotional Feedback System
 * Provides contextual messaging based on balance state
 * Part of Phase 5A: LETS-First Experience
 */

export interface BalanceFeedback {
  emoji: string;
  title: string;
  message: string;
  callToAction: string;
  color: 'error' | 'warning' | 'success' | 'info';
  intensity: 'low' | 'medium' | 'high';
}

/**
 * Get emotional feedback based on LETS balance
 * Uses narrative language to frame receiving/giving as natural flow
 */
export function getBalanceFeedback(balance: number): BalanceFeedback {
  // Receiving significant support (< -50)
  if (balance < -50) {
    return {
      emoji: '🤝',
      title: 'Your Household Needs You!',
      message: 'You\'ve received a lot of support. Time to give back! Accept favors to restore balance.',
      callToAction: 'Browse Available Favors',
      color: 'error',
      intensity: 'high',
    };
  }

  // Receiving moderate support (-50 to -20)
  if (balance < -20) {
    return {
      emoji: '💪',
      title: 'Opportunity to Contribute',
      message: 'Your household has been supporting you. Help someone out to balance the flow!',
      callToAction: 'Accept a Favor',
      color: 'warning',
      intensity: 'medium',
    };
  }

  // Receiving some support (-20 to -5)
  if (balance < -5) {
    return {
      emoji: '🌱',
      title: 'Almost Balanced',
      message: 'You\'ve been well-supported. A small favor or two will bring you to equilibrium.',
      callToAction: 'View Opportunities',
      color: 'warning',
      intensity: 'low',
    };
  }

  // Perfect equilibrium (-5 to +5)
  if (balance >= -5 && balance <= 5) {
    return {
      emoji: '⚖️',
      title: 'Perfect Equilibrium!',
      message: 'You\'re giving and receiving in perfect balance. This is the flow state!',
      callToAction: 'Keep the Rhythm Going',
      color: 'success',
      intensity: 'medium',
    };
  }

  // Slightly in credit (+5 to +20)
  if (balance <= 20) {
    return {
      emoji: '✨',
      title: 'Positive Contribution',
      message: 'You\'ve been helping out! Feel free to request support when you need it.',
      callToAction: 'Request a Favor',
      color: 'success',
      intensity: 'low',
    };
  }

  // Moderately in credit (+20 to +50)
  if (balance <= 50) {
    return {
      emoji: '🌟',
      title: 'Strong Contributor',
      message: 'You\'ve given a lot! Don\'t hesitate to ask for help - you\'ve earned it.',
      callToAction: 'Request Help',
      color: 'info',
      intensity: 'medium',
    };
  }

  // Highly in credit (> +50)
  return {
    emoji: '🏆',
    title: 'Community Pillar',
    message: 'You\'re a household hero! Time to receive - your family wants to support you too.',
    callToAction: 'It\'s OK to Ask for Help',
    color: 'info',
    intensity: 'high',
  };
}

/**
 * Get color theme for balance visualization
 */
export function getBalanceColor(balance: number): {
  main: string;
  light: string;
  dark: string;
} {
  if (balance < -20) {
    return {
      main: '#f44336', // error red
      light: '#ffcdd2',
      dark: '#d32f2f',
    };
  }

  if (balance < -5) {
    return {
      main: '#ff9800', // warning orange
      light: '#ffe0b2',
      dark: '#f57c00',
    };
  }

  if (balance <= 5) {
    return {
      main: '#4caf50', // success green
      light: '#c8e6c9',
      dark: '#388e3c',
    };
  }

  if (balance <= 20) {
    return {
      main: '#4caf50', // success green
      light: '#c8e6c9',
      dark: '#388e3c',
    };
  }

  return {
    main: '#2196f3', // info blue
    light: '#bbdefb',
    dark: '#1976d2',
  };
}

/**
 * Calculate balance percentage for progress bar (-100 to +100)
 */
export function getBalancePercentage(balance: number): number {
  // Clamp between -100 and +100
  const clamped = Math.max(-100, Math.min(100, balance));
  // Convert to 0-100 scale (0 = -100, 50 = 0, 100 = +100)
  return ((clamped + 100) / 200) * 100;
}

/**
 * Get transaction summary stats
 */
export interface TransactionSummary {
  creditsEarned: number;
  creditsSpent: number;
  netFlow: number;
  favorsDone: number;
  favorsReceived: number;
}

export function calculateTransactionSummary(
  balance: number,
  transactions: any[]
): TransactionSummary {
  const earned = transactions
    .filter(t => t.status === 'COMPLETED' && t.assigneeId === t.currentUserId)
    .reduce((sum, t) => sum + t.credits, 0);

  const spent = transactions
    .filter(t => t.status === 'COMPLETED' && t.requesterId === t.currentUserId)
    .reduce((sum, t) => sum + t.credits, 0);

  const favorsDone = transactions.filter(
    t => t.status === 'COMPLETED' && t.assigneeId === t.currentUserId
  ).length;

  const favorsReceived = transactions.filter(
    t => t.status === 'COMPLETED' && t.requesterId === t.currentUserId
  ).length;

  return {
    creditsEarned: earned,
    creditsSpent: spent,
    netFlow: earned - spent,
    favorsDone,
    favorsReceived,
  };
}
