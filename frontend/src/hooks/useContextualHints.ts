import { useState, useCallback } from 'react';

export type HintType =
  | 'household-created'
  | 'first-habit-created'
  | 'family-empty'
  | 'challenges-available'
  | 'achievement-unlocked'
  | 'first-completion';

export interface HintTrigger {
  type: HintType;
  condition: boolean;
}

/**
 * Hook for managing contextual hints
 *
 * @example
 * ```tsx
 * const { activeHint, showHint, dismissHint } = useContextualHints();
 *
 * useEffect(() => {
 *   showHint([
 *     { type: 'household-created', condition: householdJustCreated },
 *     { type: 'first-habit-created', condition: habits.length === 1 },
 *   ]);
 * }, [habits]);
 *
 * <ContextualHint type={activeHint} onDismiss={dismissHint} />
 * ```
 */
export const useContextualHints = () => {
  const [activeHint, setActiveHint] = useState<HintType | null>(null);

  /**
   * Check triggers and show the first matching hint that hasn't been dismissed
   */
  const showHint = useCallback((triggers: HintTrigger[]) => {
    const hintToShow = triggers.find(trigger => {
      if (!trigger.condition) return false;

      // Check if this hint has been dismissed
      const storageKey = `hint-dismissed-${trigger.type}`;
      return localStorage.getItem(storageKey) !== 'true';
    });

    if (hintToShow) {
      setActiveHint(hintToShow.type);
    }
  }, []);

  /**
   * Dismiss the current hint and mark it as seen in localStorage
   */
  const dismissHint = useCallback(() => {
    if (activeHint) {
      const storageKey = `hint-dismissed-${activeHint}`;
      localStorage.setItem(storageKey, 'true');
      setActiveHint(null);
    }
  }, [activeHint]);

  /**
   * Clear a specific hint from localStorage (for testing)
   */
  const clearHint = useCallback((type: HintType) => {
    const storageKey = `hint-dismissed-${type}`;
    localStorage.removeItem(storageKey);
  }, []);

  /**
   * Clear all hints from localStorage (for testing)
   */
  const clearAllHints = useCallback(() => {
    const hintTypes: HintType[] = [
      'household-created',
      'first-habit-created',
      'family-empty',
      'challenges-available',
      'achievement-unlocked',
      'first-completion',
    ];

    hintTypes.forEach(type => {
      const storageKey = `hint-dismissed-${type}`;
      localStorage.removeItem(storageKey);
    });
  }, []);

  return {
    activeHint,
    showHint,
    dismissHint,
    clearHint,
    clearAllHints,
  };
};
