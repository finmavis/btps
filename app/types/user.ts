export const USER_ROLES = ['Approver', 'Maker', 'Viewer'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type User = {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
};
