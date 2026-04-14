export const API_ERROR = {
  METHOD_NOT_ALLOWED: 'Method not allowed.',
  NO_ACTIVE_USER: 'No active user.',
  MISSING_BATCH_ID: 'Missing batch transaction id.',
  APPROVER_ROLE_REQUIRED: 'Approver role required.',
  BATCH_NOT_FOUND: 'Batch not found.',
  ONLY_ASSIGNED_APPROVER: 'Only the assigned approver can approve this batch.',
  ONLY_PENDING_APPROVE: 'Only pending batches can be approved.',
  ONLY_ASSIGNED_APPROVER_REJECT:
    'Only the assigned approver can reject this batch.',
  ONLY_PENDING_REJECT: 'Only pending batches can be rejected.',
  MISSING_PAYLOAD: 'Missing payload.',
  MAKER_REQUIRED: 'Maker role required.',
  INVALID_PAYLOAD: 'Invalid payload.',
  MISSING_BATCH_NAME: 'Missing batch name.',
  MISSING_APPROVER: 'Missing approver.',
  INVALID_APPROVER: 'Invalid approver.',
  NO_RECORDS_IN_PAYLOAD: 'No records in payload.',
  INVALID_RECORD: 'Invalid record in payload.',
  NO_RECORDS_TO_SAVE: 'No records to save.',
  MISSING_USER_ID: 'Missing user id.',
  INVALID_USER_ID: 'No user exists for that id.',
} as const;

export function translateActionError(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  if (typeof o.error === 'string' && o.error.trim()) return o.error.trim();
  return null;
}
