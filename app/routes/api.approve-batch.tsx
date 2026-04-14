import { data } from 'react-router';

import { API_ERROR } from '~/lib/api-errors';
import { userHasRole } from '~/lib/user-role';

import type { Route } from './+types/api.approve-batch';

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return data({ error: API_ERROR.METHOD_NOT_ALLOWED }, { status: 405 });
  }

  const formData = await request.formData();
  const batchTransactionId = formData.get('batchTransactionId');
  if (
    !batchTransactionId ||
    typeof batchTransactionId !== 'string' ||
    !batchTransactionId.trim()
  ) {
    return data({ error: API_ERROR.MISSING_BATCH_ID }, { status: 400 });
  }

  const { getActiveUserId, getUserById } =
    await import('~/server/users-store.server');
  const { getTransactionById, setTransaction } =
    await import('~/server/batch-transactions-store.server');

  const userId = getActiveUserId();
  if (!userId) {
    return data({ error: API_ERROR.NO_ACTIVE_USER }, { status: 401 });
  }

  const userData = getUserById(userId);
  if (!userData || !userHasRole(userData, 'Approver')) {
    return data({ error: API_ERROR.APPROVER_ROLE_REQUIRED }, { status: 403 });
  }

  const row = getTransactionById(batchTransactionId);
  if (!row) {
    return data({ error: API_ERROR.BATCH_NOT_FOUND }, { status: 404 });
  }

  if (row.approver.userId !== userId) {
    return data({ error: API_ERROR.ONLY_ASSIGNED_APPROVER }, { status: 403 });
  }

  if (row.status === 'settled') {
    return { ok: true };
  }

  if (row.status !== 'pending') {
    return data({ error: API_ERROR.ONLY_PENDING_APPROVE }, { status: 400 });
  }

  setTransaction({
    ...row,
    status: 'settled',
    errors: undefined,
    isValid: undefined,
  });
  return { ok: true };
}
