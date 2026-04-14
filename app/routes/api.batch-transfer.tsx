import { data } from 'react-router';

import { parseCreateBatchPayload } from '~/server/parse-create-batch-payload.server';
import { API_ERROR } from '~/lib/api-errors';
import { canCreateBatchTransfer } from '~/lib/user-role';
import type { Route } from './+types/api.batch-transfer';

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return data({ error: API_ERROR.METHOD_NOT_ALLOWED }, { status: 405 });
  }

  const formData = await request.formData();
  const rawPayload = formData.get('payload');
  if (!rawPayload || typeof rawPayload !== 'string' || !rawPayload.trim()) {
    return data({ error: API_ERROR.MISSING_PAYLOAD }, { status: 400 });
  }

  const parsed = parseCreateBatchPayload(rawPayload);
  if (!parsed.ok) {
    return data({ error: parsed.error }, { status: 400 });
  }

  const { getActiveUserId, getUserById } =
    await import('~/server/users-store.server');
  const { createRowsFromBatchTransfer } =
    await import('~/server/batch-transactions-store.server');

  const userId = getActiveUserId();
  if (!userId) {
    return data({ error: API_ERROR.NO_ACTIVE_USER }, { status: 401 });
  }

  const actor = getUserById(userId);
  if (!actor || !canCreateBatchTransfer(actor)) {
    return data({ error: API_ERROR.MAKER_REQUIRED }, { status: 403 });
  }

  const { payload } = parsed;

  const hasInvalidTransaction = payload.transactions.some(
    (t) => !t.isValid || Object.keys(t.errors ?? {}).length > 0
  );

  const status = hasInvalidTransaction ? 'failed' : 'pending';

  const result = createRowsFromBatchTransfer({
    batchName: payload.batchName,
    approver: payload.approver,
    transactions: payload.transactions,
    status,
  });

  if (!result.ok) {
    return data({ error: result.error }, { status: 400 });
  }

  const batchId = result.transactions[0]?.batchId ?? '';

  return {
    ok: true,
    inserted: result.transactions.length,
    batchId,
  };
}
