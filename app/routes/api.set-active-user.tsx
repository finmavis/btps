import { data } from 'react-router';

import { API_ERROR } from '~/lib/api-errors';

import type { Route } from './+types/api.set-active-user';

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return data({ error: API_ERROR.METHOD_NOT_ALLOWED }, { status: 405 });
  }

  const { setActiveUserId } = await import('~/server/users-store.server');
  const formData = await request.formData();
  const userId = formData.get('userId');
  if (!userId || typeof userId !== 'string' || !userId.trim()) {
    return data({ error: API_ERROR.MISSING_BATCH_ID }, { status: 400 });
  }

  try {
    setActiveUserId(userId.trim());
  } catch {
    return data({ error: API_ERROR.INVALID_USER_ID }, { status: 400 });
  }

  return { ok: true };
}
