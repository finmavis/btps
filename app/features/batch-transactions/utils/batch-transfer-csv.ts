import {
  BATCH_TRANSFER_CSV_MESSAGES,
  BATCH_TRANSFER_ROW_VALIDATION_MESSAGES,
  csvMessageHeaderMustInclude,
  csvMessageMissingColumn,
} from './batch-transfer-validation-messages';

/** Pattern like `000-123456789-01` (3–9–2 digits). */
export const BATCH_TRANSFER_ACCOUNT_PATTERN = /^\d{3}-\d{9}-\d{2}$/;

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export type BatchTransferTransactionField =
  | 'date'
  | 'accountNumber'
  | 'name'
  | 'amount';

export interface BatchTransferCsvTransaction {
  id: string;
  rowIndex: number;
  accountNumber: string;
  date: string;
  name: string;
  amount: number;
  amountRaw: string;
  errors: Partial<Record<BatchTransferTransactionField, string>>;
  isValid: boolean;
}

const EXPECTED_HEADERS = [
  'transaction date',
  'account number',
  'account holder name',
  'amount',
] as const;

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
      continue;
    }
    cur += c;
  }
  result.push(cur.trim());
  return result;
}

function isValidCalendarISODate(s: string): boolean {
  const m = ISO_DATE_RE.exec(s);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  return (
    dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d
  );
}

export function validateBatchTransferFields(
  row: Pick<
    BatchTransferCsvTransaction,
    'date' | 'accountNumber' | 'name' | 'amountRaw' | 'amount'
  >
): Partial<Record<BatchTransferTransactionField, string>> {
  const errors: Partial<Record<BatchTransferTransactionField, string>> = {};

  const date = row.date.trim();
  if (!ISO_DATE_RE.test(date) || !isValidCalendarISODate(date)) {
    errors.date = BATCH_TRANSFER_ROW_VALIDATION_MESSAGES.dateInvalid;
  }

  const acct = row.accountNumber.trim();
  if (!BATCH_TRANSFER_ACCOUNT_PATTERN.test(acct)) {
    errors.accountNumber =
      BATCH_TRANSFER_ROW_VALIDATION_MESSAGES.accountNumberInvalid;
  }

  if (!row.name.trim()) {
    errors.name = BATCH_TRANSFER_ROW_VALIDATION_MESSAGES.nameRequired;
  }

  const normalizedAmount = row.amountRaw.trim().replace(/,/g, '');
  if (
    normalizedAmount === '' ||
    Number.isNaN(row.amount) ||
    !Number.isFinite(row.amount)
  ) {
    errors.amount = BATCH_TRANSFER_ROW_VALIDATION_MESSAGES.amountInvalid;
  } else if (row.amount <= 0) {
    errors.amount = BATCH_TRANSFER_ROW_VALIDATION_MESSAGES.amountNotPositive;
  }

  return errors;
}

export type ParseBatchTransferCsvResult =
  | {
      ok: true;
      transactions: BatchTransferCsvTransaction[];
    }
  | {
      ok: false;
      error: string;
    };

export function parseBatchTransferCsv(
  text: string
): ParseBatchTransferCsvResult {
  const normalizedText = text.replace(/^\uFEFF/, '');
  const lines = normalizedText
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return {
      ok: false,
      error: BATCH_TRANSFER_CSV_MESSAGES.needsHeaderAndDataRow,
    };
  }

  const headerCells = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  if (headerCells.length < EXPECTED_HEADERS.length) {
    return {
      ok: false,
      error: csvMessageHeaderMustInclude(EXPECTED_HEADERS.join(', ')),
    };
  }

  const col: Record<(typeof EXPECTED_HEADERS)[number], number> = {
    'transaction date': -1,
    'account number': -1,
    'account holder name': -1,
    amount: -1,
  };

  for (let i = 0; i < headerCells.length; i++) {
    const h = headerCells[i]!;
    if (h in col) {
      col[h as keyof typeof col] = i;
    }
  }

  for (const key of EXPECTED_HEADERS) {
    if (col[key] < 0) {
      return {
        ok: false,
        error: csvMessageMissingColumn(key),
      };
    }
  }

  const transactions: BatchTransferCsvTransaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]!);
    const rowIndex = i;
    const date = (cells[col['transaction date']] ?? '').trim();
    const accountNumber = (cells[col['account number']] ?? '').trim();
    const name = (cells[col['account holder name']] ?? '').trim();
    const amountRaw = (cells[col.amount] ?? '').trim();
    const amount = Number(amountRaw.replace(/,/g, ''));

    const base: Omit<BatchTransferCsvTransaction, 'errors' | 'isValid'> = {
      id: `row-${rowIndex}`,
      rowIndex,
      accountNumber,
      amount,
      amountRaw,
      date,
      name,
    };
    const errors = validateBatchTransferFields(base);
    transactions.push({
      ...base,
      errors,
      isValid: Object.keys(errors).length === 0,
    });
  }

  return { ok: true, transactions };
}
