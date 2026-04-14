export const BATCH_TRANSFER_ROW_VALIDATION_MESSAGES = {
  dateInvalid: 'Invalid date format, expected YYYY-MM-DD',
  accountNumberInvalid:
    'Invalid account number format, expected 000-000000000-00',
  nameRequired: 'Account holder name is required',
  amountInvalid: 'Invalid amount.',
  amountNotPositive: 'Amount must be positive.',
} as const;

export const BATCH_TRANSFER_CSV_MESSAGES = {
  needsHeaderAndDataRow:
    'CSV must include a header row and at least one data row.',
} as const;

export function csvMessageHeaderMustInclude(
  expectedHeadersJoined: string
): string {
  return `Header must include: ${expectedHeadersJoined}`;
}

export function csvMessageMissingColumn(columnKey: string): string {
  const title = columnKey.replace(/\b\w/g, (c) => c.toUpperCase());
  return `Missing column: ${title}`;
}

export const BATCH_TRANSFER_ROW_FIELD_LABELS: Record<string, string> = {
  general: 'General',
  date: 'Transaction Date',
  accountNumber: 'Account Number',
  name: 'Account Holder Name',
  amount: 'Amount',
};

export function formatBatchTransferRowServerError(
  rowIndex: number,
  fieldErrors: Partial<Record<string, string>>
): string {
  const entries = Object.entries(fieldErrors).filter(([, msg]) => msg);
  if (entries.length === 0) {
    return `Row ${rowIndex} failed validation.`;
  }
  const parts = entries.map(
    ([key, msg]) => `${BATCH_TRANSFER_ROW_FIELD_LABELS[key] ?? key}: ${msg}`
  );
  return `Row ${rowIndex}: ${parts.join('; ')}`;
}
