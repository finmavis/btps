import type { BatchTransferSubmitPayload } from '~/features/batch-transactions/create-batch-transfer/create-batch-transfer-dialog';
import { validateBatchTransferFields } from '~/features/batch-transactions/utils/batch-transfer-csv';
import type { BatchTransferCsvTransaction } from '~/features/batch-transactions/utils/batch-transfer-csv';
import { API_ERROR } from '~/lib/api-errors';

export function parseCreateBatchPayload(
  raw: string
):
  | { ok: true; payload: BatchTransferSubmitPayload }
  | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: API_ERROR.INVALID_PAYLOAD };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: API_ERROR.INVALID_PAYLOAD };
  }

  const data = parsed as Record<string, unknown>;
  const batchName =
    typeof data.batchName === 'string' ? data.batchName.trim() : '';
  if (!batchName) {
    return { ok: false, error: API_ERROR.MISSING_BATCH_NAME };
  }

  const approver = data.approver;
  if (!approver || typeof approver !== 'object') {
    return { ok: false, error: API_ERROR.MISSING_APPROVER };
  }
  const approverData = approver as Record<string, unknown>;
  const userId =
    typeof approverData.userId === 'string' ? approverData.userId.trim() : '';
  const name =
    typeof approverData.name === 'string' ? approverData.name.trim() : '';
  if (!userId || !name) {
    return { ok: false, error: API_ERROR.INVALID_APPROVER };
  }

  if (!Array.isArray(data.transactions) || data.transactions.length === 0) {
    return { ok: false, error: API_ERROR.NO_RECORDS_IN_PAYLOAD };
  }

  const transactions: BatchTransferCsvTransaction[] = [];
  for (let i = 0; i < data.transactions.length; i++) {
    const item = data.transactions[i];
    if (!item || typeof item !== 'object') {
      return { ok: false, error: API_ERROR.INVALID_RECORD };
    }
    const r = item as Record<string, unknown>;
    const id = typeof r.id === 'string' ? r.id : `row-${i + 1}`;
    const rowIndex =
      typeof r.rowIndex === 'number' &&
      Number.isFinite(r.rowIndex) &&
      r.rowIndex >= 1
        ? r.rowIndex
        : i + 1;
    const date = typeof r.date === 'string' ? r.date : '';
    const accountNumber =
      typeof r.accountNumber === 'string' ? r.accountNumber : '';
    const name = typeof r.name === 'string' ? r.name : '';
    const amountFromPayload =
      typeof r.amount === 'number' ? r.amount : Number.NaN;
    const amountRawFromPayload =
      typeof r.amountRaw === 'string' ? r.amountRaw : '';

    const amountRaw =
      amountRawFromPayload.trim() !== ''
        ? amountRawFromPayload
        : Number.isFinite(amountFromPayload)
          ? String(amountFromPayload)
          : '';
    const amount = Number.isFinite(amountFromPayload)
      ? amountFromPayload
      : Number(amountRaw.trim().replace(/,/g, ''));

    const errors = validateBatchTransferFields({
      date,
      accountNumber,
      name,
      amountRaw,
      amount,
    });
    const isValid = Object.keys(errors).length === 0;

    transactions.push({
      id,
      rowIndex,
      date,
      accountNumber,
      name,
      amount,
      amountRaw,
      errors,
      isValid,
    });
  }

  return {
    ok: true,
    payload: {
      batchName,
      approver: { userId, name },
      transactions,
    },
  };
}
