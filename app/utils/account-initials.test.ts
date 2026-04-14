import { describe, expect, it } from 'vitest';

import { initialsFromName, resolveInitials } from './account-initials';

describe('initialsFromName', () => {
  it('uses first and last word for two or more name parts', () => {
    expect(initialsFromName('John Doe')).toBe('JD');
    expect(initialsFromName('mary jane watson')).toBe('MW');
  });

  it('trims and collapses whitespace between parts', () => {
    expect(initialsFromName('  John   Doe  ')).toBe('JD');
  });

  it('uses first two letters for a single word with length >= 2', () => {
    expect(initialsFromName('Single')).toBe('SI');
    expect(initialsFromName('ab')).toBe('AB');
  });

  it('uses the single character for a one-letter name', () => {
    expect(initialsFromName('A')).toBe('A');
  });

  it('returns ? when there is no usable name', () => {
    expect(initialsFromName('')).toBe('?');
    expect(initialsFromName('   ')).toBe('?');
  });
});

describe('resolveInitials', () => {
  it('prefers explicit initials when provided', () => {
    expect(resolveInitials({ name: 'John Doe', initials: 'XY' })).toBe('XY');
  });

  it('trims and uppercases explicit initials', () => {
    expect(resolveInitials({ name: 'John Doe', initials: '  ab  ' })).toBe(
      'AB'
    );
  });

  it('truncates explicit initials to two characters', () => {
    expect(resolveInitials({ name: 'John Doe', initials: 'toolong' })).toBe(
      'TO'
    );
  });

  it('derives from name when initials are omitted', () => {
    expect(resolveInitials({ name: 'Jane Smith' })).toBe('JS');
  });

  it('uses empty string when initials is empty (does not fall back to name)', () => {
    expect(resolveInitials({ name: 'Jane Smith', initials: '' })).toBe('');
  });
});
