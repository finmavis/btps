import { describe, expect, it } from 'vitest';

import {
  BATCH_TRANSFER_CSV_MESSAGES,
  BATCH_TRANSFER_ROW_VALIDATION_MESSAGES,
} from './batch-transfer-validation-messages';
import {
  BATCH_TRANSFER_ACCOUNT_PATTERN,
  parseBatchTransferCsv,
  validateBatchTransferFields,
} from './batch-transfer-csv';

describe('BATCH_TRANSFER_ACCOUNT_PATTERN', () => {
  it('matches 3-9-2 digit segments', () => {
    expect(BATCH_TRANSFER_ACCOUNT_PATTERN.test('000-123456789-01')).toBe(true);
    expect(BATCH_TRANSFER_ACCOUNT_PATTERN.test('999-999999999-99')).toBe(true);
  });

  it('rejects wrong segment lengths or separators', () => {
    expect(BATCH_TRANSFER_ACCOUNT_PATTERN.test('00-123456789-01')).toBe(false);
    expect(BATCH_TRANSFER_ACCOUNT_PATTERN.test('000-12345678-01')).toBe(false);
    expect(BATCH_TRANSFER_ACCOUNT_PATTERN.test('000-123456789-1')).toBe(false);
    expect(BATCH_TRANSFER_ACCOUNT_PATTERN.test('000_123456789_01')).toBe(false);
  });
});

describe('validateBatchTransferFields', () => {
  const valid = {
    date: '2025-06-15',
    accountNumber: '000-123456789-01',
    name: 'Jane Doe',
    amountRaw: '100.00',
    amount: 100,
  };

  it('returns no errors for a valid row', () => {
    expect(validateBatchTransferFields(valid)).toEqual({});
  });

  it('validates calendar dates', () => {
    expect(
      validateBatchTransferFields({ ...valid, date: '2025-02-30' }).date
    ).toBe(BATCH_TRANSFER_ROW_VALIDATION_MESSAGES.dateInvalid);
    expect(
      validateBatchTransferFields({ ...valid, date: '25-01-01' }).date
    ).toBe(BATCH_TRANSFER_ROW_VALIDATION_MESSAGES.dateInvalid);
    expect(
      validateBatchTransferFields({ ...valid, date: '2024-02-29' }).date
    ).toBeUndefined();
  });

  it('requires account number format', () => {
    expect(
      validateBatchTransferFields({ ...valid, accountNumber: 'bad' })
        .accountNumber
    ).toBe(BATCH_TRANSFER_ROW_VALIDATION_MESSAGES.accountNumberInvalid);
  });

  it('requires a non-empty name', () => {
    expect(validateBatchTransferFields({ ...valid, name: '   ' }).name).toBe(
      BATCH_TRANSFER_ROW_VALIDATION_MESSAGES.nameRequired
    );
  });

  it('validates amount presence and sign', () => {
    expect(
      validateBatchTransferFields({ ...valid, amountRaw: '', amount: NaN })
        .amount
    ).toBe(BATCH_TRANSFER_ROW_VALIDATION_MESSAGES.amountInvalid);
    expect(
      validateBatchTransferFields({ ...valid, amountRaw: '0', amount: 0 })
        .amount
    ).toBe(BATCH_TRANSFER_ROW_VALIDATION_MESSAGES.amountNotPositive);
    expect(
      validateBatchTransferFields({ ...valid, amountRaw: '-5', amount: -5 })
        .amount
    ).toBe(BATCH_TRANSFER_ROW_VALIDATION_MESSAGES.amountNotPositive);
  });

  it('accepts comma-separated amount strings when amount is numeric', () => {
    expect(
      validateBatchTransferFields({
        ...valid,
        amountRaw: '1,234.50',
        amount: 1234.5,
      })
    ).toEqual({});
  });
});

describe('parseBatchTransferCsv', () => {
  const header = 'Transaction Date,Account Number,Account Holder Name,Amount';

  it('rejects empty or header-only input', () => {
    expect(parseBatchTransferCsv('')).toEqual({
      ok: false,
      error: BATCH_TRANSFER_CSV_MESSAGES.needsHeaderAndDataRow,
    });
    expect(parseBatchTransferCsv('\n\n')).toEqual({
      ok: false,
      error: BATCH_TRANSFER_CSV_MESSAGES.needsHeaderAndDataRow,
    });
    expect(parseBatchTransferCsv(header)).toEqual({
      ok: false,
      error: BATCH_TRANSFER_CSV_MESSAGES.needsHeaderAndDataRow,
    });
  });

  it('rejects a header row with too few columns', () => {
    const res = parseBatchTransferCsv(
      'Transaction Date,Account Number,Amount\n2025-01-01,x,y'
    );
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('Header must include:');
    }
  });

  it('rejects missing required columns', () => {
    const res = parseBatchTransferCsv(
      'Transaction Date,Account Number,Account Holder Name,Total\n2025-01-01,000-111111111-11,Ada,10'
    );
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe('Missing column: Amount');
    }
  });

  it('strips a UTF-8 BOM from the start of the file', () => {
    const csv = `\uFEFF${header}\n2025-02-20,000-123456789-01,John Doe,100.00`;
    const res = parseBatchTransferCsv(csv);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.transactions).toHaveLength(1);
      expect(res.transactions[0]!.date).toBe('2025-02-20');
    }
  });

  it('parses CRLF and quoted fields', () => {
    const csv = `${header}\r\n2025-02-20,000-123456789-01,"Doe, Jane",250.50`;
    const res = parseBatchTransferCsv(csv);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.transactions[0]!.name).toBe('Doe, Jane');
      expect(res.transactions[0]!.isValid).toBe(true);
    }
  });

  it('maps columns by header name regardless of order', () => {
    const csv =
      'Amount,Account Holder Name,Transaction Date,Account Number\n250.50,Jane,2025-02-20,000-123456789-01';
    const res = parseBatchTransferCsv(csv);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const row = res.transactions[0]!;
      expect(row.date).toBe('2025-02-20');
      expect(row.accountNumber).toBe('000-123456789-01');
      expect(row.name).toBe('Jane');
      expect(row.amountRaw).toBe('250.50');
      expect(row.isValid).toBe(true);
    }
  });

  it('marks invalid rows and keeps row indices aligned with file lines', () => {
    const csv = `${header}
2025-02-20,000-123456789-01,John,100.00
bad-date,000-123456789-01,Jane,50.00`;
    const res = parseBatchTransferCsv(csv);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.transactions).toHaveLength(2);
      expect(res.transactions[0]!.rowIndex).toBe(1);
      expect(res.transactions[0]!.isValid).toBe(true);
      expect(res.transactions[1]!.rowIndex).toBe(2);
      expect(res.transactions[1]!.isValid).toBe(false);
      expect(res.transactions[1]!.errors.date).toBe(
        BATCH_TRANSFER_ROW_VALIDATION_MESSAGES.dateInvalid
      );
    }
  });
});
