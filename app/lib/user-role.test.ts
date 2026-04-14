import { describe, expect, it } from 'vitest';

import type { User } from '~/types/user';

import {
  canBeBatchApprover,
  canCreateBatchTransfer,
  formatRolesLabel,
  userHasRole,
} from './user-role';

const baseUser = (roles: User['roles']): User => ({
  id: 'u1',
  name: 'Test User',
  email: 'test@example.com',
  roles,
});

describe('userHasRole', () => {
  it('returns false when user or role is missing', () => {
    expect(userHasRole(undefined, 'Maker')).toBe(false);
    expect(userHasRole(baseUser(['Maker']), undefined)).toBe(false);
    expect(userHasRole(undefined, undefined)).toBe(false);
  });

  it('returns false when the user does not have the role', () => {
    expect(userHasRole(baseUser(['Viewer']), 'Maker')).toBe(false);
  });

  it('returns true when the user has the role', () => {
    expect(userHasRole(baseUser(['Maker', 'Viewer']), 'Maker')).toBe(true);
  });
});

describe('formatRolesLabel', () => {
  it('joins roles with comma and space', () => {
    expect(formatRolesLabel([])).toBe('');
    expect(formatRolesLabel(['Maker'])).toBe('Maker');
    expect(formatRolesLabel(['Maker', 'Approver'])).toBe('Maker, Approver');
  });
});

describe('canBeBatchApprover', () => {
  it('is true only for Approver', () => {
    expect(canBeBatchApprover(baseUser(['Approver']))).toBe(true);
    expect(canBeBatchApprover(baseUser(['Maker', 'Approver']))).toBe(true);
    expect(canBeBatchApprover(baseUser(['Maker']))).toBe(false);
  });
});

describe('canCreateBatchTransfer', () => {
  it('is true only for Maker', () => {
    expect(canCreateBatchTransfer(baseUser(['Maker']))).toBe(true);
    expect(canCreateBatchTransfer(baseUser(['Maker', 'Viewer']))).toBe(true);
    expect(canCreateBatchTransfer(baseUser(['Approver']))).toBe(false);
  });
});
