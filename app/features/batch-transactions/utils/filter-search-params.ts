import type {
  BatchTransactionStatus,
  DateRangeValue,
  StatusFilterValue,
} from '~/types/transaction';

const STATUS_SET = new Set<BatchTransactionStatus>([
  'settled',
  'pending',
  'failed',
]);

const ISO_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

function parseStatus(raw: string | null): StatusFilterValue {
  return STATUS_SET.has(raw as BatchTransactionStatus)
    ? (raw as BatchTransactionStatus)
    : 'all';
}

function parseDate(raw: string | null): string {
  if (!raw || !ISO_DATE.test(raw)) return '';
  return raw;
}

const ALLOWED_PAGE_SIZES = new Set([10, 25, 50]);
const DEFAULT_PAGE_SIZE = 10;

function parsePositivePage(raw: string | null): number {
  if (!raw) return 1;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

function parsePageSize(raw: string | null): number {
  const n = Number.parseInt(raw ?? '', 10);
  if (ALLOWED_PAGE_SIZES.has(n)) return n;
  return DEFAULT_PAGE_SIZE;
}

export interface ParsedBatchFilters {
  q: string;
  dateRange: DateRangeValue;
  status: StatusFilterValue;
  page: number;
  pageSize: number;
}

export function parseDateOrder(searchParams: URLSearchParams): 'asc' | 'desc' {
  return searchParams.get('dateOrder') === 'asc' ? 'asc' : 'desc';
}

export function parseBatchFiltersFromSearchParams(
  searchParams: URLSearchParams
): ParsedBatchFilters {
  return {
    q: searchParams.get('q')?.trim() ?? '',
    dateRange: {
      from: parseDate(searchParams.get('from')),
      to: parseDate(searchParams.get('to')),
    },
    status: parseStatus(searchParams.get('status')),
    page: parsePositivePage(searchParams.get('page')),
    pageSize: parsePageSize(searchParams.get('pageSize')),
  };
}

export function mergeBatchFiltersIntoSearchParams(
  prev: URLSearchParams,
  patch: Partial<{
    q: string;
    dateRange: DateRangeValue;
    status: StatusFilterValue;
    page: number;
    pageSize: number;
    dateOrder: 'asc' | 'desc';
  }>
): URLSearchParams {
  const next = new URLSearchParams(prev);

  if (patch.q !== undefined) {
    if (patch.q.trim()) {
      next.set('q', patch.q.trim());
    } else {
      next.delete('q');
    }
  }

  if (patch.dateRange !== undefined) {
    const { from, to } = patch.dateRange;
    if (from) {
      next.set('from', from);
    } else {
      next.delete('from');
    }
    if (to) {
      next.set('to', to);
    } else {
      next.delete('to');
    }
  }

  if (patch.status !== undefined) {
    if (patch.status !== 'all') {
      next.set('status', patch.status);
    } else {
      next.delete('status');
    }
  }

  if (patch.page !== undefined) {
    if (patch.page <= 1) {
      next.delete('page');
    } else {
      next.set('page', String(patch.page));
    }
  }

  if (patch.pageSize !== undefined) {
    if (patch.pageSize === DEFAULT_PAGE_SIZE) {
      next.delete('pageSize');
    } else {
      next.set('pageSize', String(patch.pageSize));
    }
  }

  if (patch.dateOrder !== undefined) {
    if (patch.dateOrder === 'desc') {
      next.delete('dateOrder');
    } else {
      next.set('dateOrder', 'asc');
    }
  }

  return next;
}
