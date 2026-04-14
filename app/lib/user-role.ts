import type { UserRole, User } from '~/types/user';

export function userHasRole(user?: User, role?: UserRole): boolean {
  if (!user || !role) return false;
  return user.roles.includes(role);
}

export function formatRolesLabel(roles: readonly UserRole[]): string {
  return roles.join(', ');
}

export function canBeBatchApprover(user: User): boolean {
  return userHasRole(user, 'Approver');
}

export function canCreateBatchTransfer(user: User): boolean {
  return userHasRole(user, 'Maker');
}
