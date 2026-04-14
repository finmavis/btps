export const BATCH_TRANSACTION_STATUSES = [
  'settled',
  'pending',
  'failed',
] as const;

export type BatchTransactionStatus =
  (typeof BATCH_TRANSACTION_STATUSES)[number];

export type StatusFilterValue = 'all' | BatchTransactionStatus;

export interface DateRangeValue {
  from: string;
  to: string;
}

export interface BatchApprover {
  userId: string;
  name: string;
}

export type BatchTransactionFieldErrors = Partial<{
  date: string;
  accountNumber: string;
  name: string;
  amount: string;
  general: string;
}>;

export interface BatchTransaction {
  id: string;
  transactionDate: string;
  accountNumber: string;
  accountHolderName: string;
  amount: number;
  status: BatchTransactionStatus;
  errors?: BatchTransactionFieldErrors;
  isValid?: boolean;
  batchName: string;
  batchId: string;
  approver: BatchApprover;
}

export type DateOrder = 'asc' | 'desc';

export interface BatchTransactionsQueryResult {
  rows: BatchTransaction[];
  totalItems: number;
  totalPages: number;
  page: number;
  pageSize: number;
  dateSort: DateOrder;
}
