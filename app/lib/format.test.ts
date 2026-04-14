import { describe, expect, it } from 'vitest';

import { formatCurrency, formatDisplayDate } from './format';

describe('formatCurrency', () => {
  it('formats USD with two fraction digits for en-US', () => {
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(100)).toBe('$100.00');
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
    expect(formatCurrency(-42.25)).toBe('-$42.25');
  });
});

describe('formatDisplayDate', () => {
  it('formats an ISO calendar date for en-US', () => {
    expect(formatDisplayDate('2025-02-20')).toBe('Feb 20, 2025');
  });

  it('is stable across environments by anchoring local noon', () => {
    expect(formatDisplayDate('2026-01-01')).toBe('Jan 1, 2026');
  });
});
