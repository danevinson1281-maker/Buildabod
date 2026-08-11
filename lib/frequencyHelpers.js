// /lib/frequencyHelpers.js
// Helpers for meal frequency change system

/**
 * Check if client can change meal frequency now
 * Returns { canChange: boolean, nextChangeDate: Date | null }
 */
export function checkFrequencyCooldown(lastChangeDate) {
  if (!lastChangeDate) {
    // Never changed before, can change now
    return { canChange: true, nextChangeDate: null };
  }

  const lastChange = new Date(lastChangeDate);
  const nextChange = new Date(lastChange.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later
  const now = new Date();

  const canChange = now >= nextChange;

  return {
    canChange,
    nextChangeDate: canChange ? null : nextChange,
  };
}

/**
 * Calculate days until next frequency change is allowed
 */
export function daysUntilNextChange(lastChangeDate) {
  if (!lastChangeDate) return 0;

  const lastChange = new Date(lastChangeDate);
  const nextChange = new Date(lastChange.getTime() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const msUntil = nextChange.getTime() - now.getTime();
  const daysUntil = Math.ceil(msUntil / (24 * 60 * 60 * 1000));

  return Math.max(0, daysUntil);
}

/**
 * Format date for display
 */
export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
