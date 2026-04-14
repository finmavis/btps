import { faker } from '@faker-js/faker';

import type { BatchTransferCsvTransaction } from '~/features/batch-transactions/utils/batch-transfer-csv';
import { validateBatchTransferFields } from '~/features/batch-transactions/utils/batch-transfer-csv';
import {
  BATCH_TRANSFER_ROW_VALIDATION_MESSAGES,
  formatBatchTransferRowServerError,
} from '~/features/batch-transactions/utils/batch-transfer-validation-messages';
import { BATCH_TRANSACTION_STATUSES } from '~/types/transaction';
import type {
  BatchApprover,
  BatchTransaction,
  BatchTransactionStatus,
  BatchTransactionFieldErrors,
} from '~/types/transaction';

import { API_ERROR } from '~/lib/api-errors';
import { userHasRole } from '~/lib/user-role';

import {
  BTPS_ENV_KEYS,
  DEFAULT_SEED_TRANSACTIONS_COUNT,
} from '~/config/env.server';

import { getUsers } from './users-store.server';

function buildInitialRows(): BatchTransaction[] {
  const seedTransactionsCountFromEnv =
    process.env[BTPS_ENV_KEYS.SEED_TRANSACTIONS];
  const seedTransactionsCount = seedTransactionsCountFromEnv
    ? Number.parseInt(seedTransactionsCountFromEnv, 10)
    : DEFAULT_SEED_TRANSACTIONS_COUNT;
  const seedTransactionsCountValid = Number.isNaN(seedTransactionsCount)
    ? DEFAULT_SEED_TRANSACTIONS_COUNT
    : seedTransactionsCount;
  faker.seed(seedTransactionsCountValid);
  const users = getUsers();
  const approverPool = users.filter((u) => userHasRole(u, 'Approver'));

  return Array.from({ length: seedTransactionsCountValid }, () => {
    const status = faker.helpers.arrayElement(BATCH_TRANSACTION_STATUSES);
    const date = faker.date.recent({ days: 60 });
    const transactionDate = date.toISOString().slice(0, 10);
    const batchId = `BT-${transactionDate.replace(/-/g, '')}-${faker.string.uuid().slice(0, 18).toUpperCase()}`;
    const approver = faker.helpers.arrayElement(approverPool);

    const seededErrors: BatchTransactionFieldErrors | undefined =
      status === 'failed'
        ? (() => {
            const all: Array<[keyof BatchTransactionFieldErrors, string]> = [
              ['date', BATCH_TRANSFER_ROW_VALIDATION_MESSAGES.dateInvalid],
              [
                'accountNumber',
                BATCH_TRANSFER_ROW_VALIDATION_MESSAGES.accountNumberInvalid,
              ],
              ['name', BATCH_TRANSFER_ROW_VALIDATION_MESSAGES.nameRequired],
              ['amount', BATCH_TRANSFER_ROW_VALIDATION_MESSAGES.amountInvalid],
            ];
            const count = faker.number.int({ min: 1, max: 4 });
            const picked = faker.helpers.arrayElements(all, count);
            return Object.fromEntries(picked) as BatchTransactionFieldErrors;
          })()
        : undefined;

    return {
      id: `txn-${faker.string.uuid()}`,
      transactionDate,
      accountNumber: `${faker.string.numeric(3)}-${faker.string.numeric(9)}-${faker.string.numeric(2)}`,
      accountHolderName: `${faker.person.fullName()}`,
      amount: parseFloat(faker.finance.amount({ min: 10, max: 200_000 })),
      status,
      ...(status === 'failed'
        ? {
            errors: seededErrors,
            isValid: false,
          }
        : { isValid: true }),
      batchName: `${faker.commerce.productName()} batch`,
      batchId,
      approver: { userId: approver.id, name: approver.name },
    } satisfies BatchTransaction;
  });
}

const store = new Map<string, BatchTransaction>(
  buildInitialRows().map((row) => [row.id, row])
);

console.info(`[BTPS info] Seeded ${store.size} transactions.`);

export function getTransactions(): BatchTransaction[] {
  return Array.from(store.values());
}

export function getTransactionById(id: string): BatchTransaction | undefined {
  return store.get(id);
}

export function setTransaction(transaction: BatchTransaction): void {
  store.set(transaction.id, { ...transaction });
}

export function setManyTransactions(transactions: BatchTransaction[]): void {
  for (const transaction of transactions) {
    store.set(transaction.id, { ...transaction });
  }
}

/**
 * Inserts one store row per CSV record, sharing batchName, and approver.
 * Validates each row the same way as the CSV parser.
 */
export function createRowsFromBatchTransfer(params: {
  batchName: string;
  approver: BatchApprover;
  transactions: BatchTransferCsvTransaction[];
  status: BatchTransactionStatus;
}):
  | { ok: true; transactions: BatchTransaction[] }
  | { ok: false; error: string } {
  const today = new Date().toISOString().slice(0, 10);
  const batchId = `BT-${today.replace(/-/g, '')}-${faker.string.uuid().slice(0, 18).toUpperCase()}`;
  const {
    batchName,
    approver,
    transactions: inputTransactions,
    status,
  } = params;
  if (inputTransactions.length === 0) {
    return { ok: false, error: API_ERROR.NO_RECORDS_TO_SAVE };
  }

  const transactions: BatchTransaction[] = [];

  for (const record of inputTransactions) {
    const transactionDate = record.date.trim();
    const accountNumber = record.accountNumber.trim();
    const accountHolderName = record.name.trim();
    const amountRaw = record.amountRaw.trim();
    const amount = record.amount;

    if (status !== 'failed') {
      const fieldErrors = validateBatchTransferFields({
        date: transactionDate,
        accountNumber,
        name: accountHolderName,
        amountRaw,
        amount,
      });
      if (Object.keys(fieldErrors).length > 0) {
        return {
          ok: false,
          error: formatBatchTransferRowServerError(
            record.rowIndex,
            fieldErrors
          ),
        };
      }
    }

    const amountRounded = Number.isFinite(amount)
      ? Math.round(amount * 100) / 100
      : 0;

    const fieldErrors: BatchTransactionFieldErrors | undefined =
      status === 'failed'
        ? (record.errors as BatchTransactionFieldErrors)
        : undefined;

    transactions.push({
      id: `txn-${faker.string.uuid()}`,
      transactionDate,
      accountNumber,
      accountHolderName,
      amount: amountRounded,
      status,
      batchName,
      batchId,
      approver,
      ...(status === 'failed' ? { errors: fieldErrors, isValid: false } : {}),
    });
  }

  setManyTransactions(transactions);
  return { ok: true, transactions };
}
