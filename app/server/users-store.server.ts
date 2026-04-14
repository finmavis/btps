import { faker } from '@faker-js/faker';

import { BTPS_ENV_KEYS, DEFAULT_SEED_USERS_COUNT } from '~/config/env.server';
import { USER_ROLES, type UserRole, type User } from '~/types/user';

function buildSeedUser(roles: UserRole[]): User {
  return {
    id: `usr-${faker.string.uuid()}`,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    roles,
  };
}

function buildInitialUsers(): User[] {
  const seedUsersCountFromEnv = process.env[BTPS_ENV_KEYS.SEED_USERS];
  const seedUsersCount = seedUsersCountFromEnv
    ? Number.parseInt(seedUsersCountFromEnv, 10)
    : DEFAULT_SEED_USERS_COUNT;
  const seedUsersCountValid = Number.isNaN(seedUsersCount)
    ? DEFAULT_SEED_USERS_COUNT
    : seedUsersCount;
  const fixed: User[] = [
    buildSeedUser(['Viewer']),
    buildSeedUser(['Approver']),
    buildSeedUser(['Maker']),
  ];
  const mixed = Array.from({ length: seedUsersCountValid - 3 }, () =>
    buildSeedUser(faker.helpers.arrayElements(USER_ROLES))
  );
  return faker.helpers.shuffle([...fixed, ...mixed]);
}

const usersStore = new Map<string, User>(
  buildInitialUsers().map((user) => [user.id, user])
);
console.info(`[BTPS info] Seeded ${usersStore.size} users`);

let activeUserId: string | null = usersStore.values().next().value?.id ?? null;

export function getUsers(): User[] {
  return Array.from(usersStore.values());
}

export function getUserById(id: string): User | undefined {
  return usersStore.get(id);
}

export function getActiveUserId(): string | null {
  return activeUserId;
}

export function setActiveUserId(id: string): void {
  if (!usersStore.has(id)) {
    throw new Error(`Invalid user id: ${id}`);
  }
  activeUserId = id;
}
