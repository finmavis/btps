import type { ParsedBatchFilters } from '~/features/batch-transactions/utils/filter-search-params';
import type {
  BatchTransaction,
  BatchTransactionsQueryResult,
  DateOrder,
} from '~/types/transaction';

function matchesSearch(row: BatchTransaction, q: string): boolean {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  const approverHaystack =
    `${row.approver.name} ${row.approver.userId}`.toLowerCase();
  return (
    row.batchName.toLowerCase().includes(s) ||
    row.accountNumber.toLowerCase().includes(s) ||
    row.accountHolderName.toLowerCase().includes(s) ||
    approverHaystack.includes(s) ||
    row.batchId.toLowerCase().includes(s)
  );
}

function matchesDateRange(
  row: BatchTransaction,
  range: ParsedBatchFilters['dateRange']
): boolean {
  const d = row.transactionDate;
  if (range.from && d < range.from) return false;
  if (range.to && d > range.to) return false;
  return true;
}

function compareTransactionDate(
  a: BatchTransaction,
  b: BatchTransaction,
  order: DateOrder
): number {
  const cmp = a.transactionDate.localeCompare(b.transactionDate);
  return order === 'asc' ? cmp : -cmp;
}

/**
 * Filter, sort by transaction date, and paginate — for route loaders (server only).
 */
export function runBatchTransactionsQuery(
  allRows: BatchTransaction[],
  applied: ParsedBatchFilters,
  dateOrder: DateOrder
): BatchTransactionsQueryResult {
  let list = allRows.filter((row) => matchesSearch(row, applied.q));
  list = list.filter((row) => matchesDateRange(row, applied.dateRange));
  if (applied.status !== 'all') {
    list = list.filter((row) => row.status === applied.status);
  }
  list = [...list].sort((a, b) => compareTransactionDate(a, b, dateOrder));

  const totalItems = list.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / applied.pageSize));
  const page = Math.min(Math.max(1, applied.page), totalPages);
  const start = (page - 1) * applied.pageSize;
  const rows = list.slice(start, start + applied.pageSize);

  return {
    rows,
    totalItems,
    totalPages,
    page,
    pageSize: applied.pageSize,
    dateSort: dateOrder,
  };
}
