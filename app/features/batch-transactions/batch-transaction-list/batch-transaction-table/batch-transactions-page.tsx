import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFetcher, useSearchParams } from 'react-router';

import { useAccount } from '~/state/account-context';
import { BATCH_LIST_SEARCH_DEBOUNCE_MS } from '~/config/constants';
import { usePopup } from '~/hooks/use-popup';
import { useDebouncedValue } from '~/hooks/use-debounced-value';
import { translateActionError } from '~/lib/api-errors';
import { userHasRole } from '~/lib/user-role';
import type { BatchTransactionsQueryResult } from '~/types/transaction';
import {
  mergeBatchFiltersIntoSearchParams,
  parseBatchFiltersFromSearchParams,
} from '~/features/batch-transactions/utils/filter-search-params';
import type { DateRangeValue, StatusFilterValue } from '~/types/transaction';

import { CreateBatchTransferDialog } from '../../create-batch-transfer/create-batch-transfer-dialog';
import { BatchTransactionsPageHeader } from './batch-transactions-page-header';
import { BatchTransactionsTableCard } from './batch-transactions-table-card';
import { BatchTransactionsToolbar } from '../batch-transaction-toolbar/batch-transactions-toolbar';

import styles from './batch-transactions-page.module.css';

export type BatchTransactionsPageProps = {
  view: BatchTransactionsQueryResult;
};

export function BatchTransactionsPage({ view }: BatchTransactionsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedAccount } = useAccount();
  const createBatchTransferDialog = usePopup();

  const { rows, totalItems, page, pageSize, dateSort } = view;

  const canCreateBatch = useMemo(() => {
    return userHasRole(selectedAccount, 'Maker');
  }, [selectedAccount]);

  const appliedFilters = useMemo(
    () => parseBatchFiltersFromSearchParams(searchParams),
    [searchParams]
  );

  const [search, setSearch] = useState(appliedFilters.q);
  const debouncedSearch = useDebouncedValue(
    search,
    BATCH_LIST_SEARCH_DEBOUNCE_MS
  );

  useEffect(() => {
    setSearchParams(
      (prev) => mergeBatchFiltersIntoSearchParams(prev, { q: debouncedSearch }),
      { replace: true }
    );
  }, [debouncedSearch, setSearchParams]);

  const [createBatchError, setCreateBatchError] = useState<string | null>(null);
  const fetcher = useFetcher();

  useEffect(() => {
    if (!createBatchTransferDialog.isOpen) {
      setCreateBatchError(null);
    }
  }, [createBatchTransferDialog.isOpen]);

  useEffect(() => {
    if (fetcher.state !== 'idle') return;
    const d = fetcher.data;
    if (!d || typeof d !== 'object') return;
    if ('ok' in d && d.ok) {
      setCreateBatchError(null);
      return;
    }
    const msg = translateActionError(d);
    if (msg) setCreateBatchError(msg);
  }, [fetcher.state, fetcher.data]);

  const onToggleDateSort = useCallback(() => {
    const nextOrder = dateSort === 'desc' ? 'asc' : 'desc';
    setSearchParams(
      (prev) =>
        mergeBatchFiltersIntoSearchParams(prev, { dateOrder: nextOrder }),
      { replace: true }
    );
  }, [dateSort, setSearchParams]);

  const handlePageChange = useCallback(
    (next: number) => {
      setSearchParams(
        (prev) => mergeBatchFiltersIntoSearchParams(prev, { page: next }),
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setSearchParams(
        (prev) =>
          mergeBatchFiltersIntoSearchParams(prev, {
            pageSize: size,
            page: 1,
          }),
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const handleDateApply = useCallback(
    (next: DateRangeValue) => {
      setSearchParams(
        (prev) =>
          mergeBatchFiltersIntoSearchParams(prev, {
            dateRange: next,
            page: 1,
          }),
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const handleStatusApply = useCallback(
    (next: StatusFilterValue) => {
      setSearchParams(
        (prev) =>
          mergeBatchFiltersIntoSearchParams(prev, { status: next, page: 1 }),
        { replace: true }
      );
    },
    [setSearchParams]
  );

  return (
    <>
      <div className={styles.container}>
        <div className={styles.page}>
          <BatchTransactionsPageHeader
            showBatchTransfer={canCreateBatch}
            handleClickCreateBatchTransfer={createBatchTransferDialog.openPopup}
          />
          <div className={styles.batchTransactionsContainer}>
            <BatchTransactionsToolbar
              search={search}
              onSearchChange={(v) => {
                setSearch(v);
                setSearchParams(
                  (prev) =>
                    mergeBatchFiltersIntoSearchParams(prev, { page: 1 }),
                  { replace: true }
                );
              }}
              dateApplied={appliedFilters.dateRange}
              onDateApply={handleDateApply}
              statusApplied={appliedFilters.status}
              onStatusApply={handleStatusApply}
            />
            <BatchTransactionsTableCard
              rows={rows}
              page={page}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              dateSort={dateSort}
              onToggleDateSort={onToggleDateSort}
            />
          </div>
        </div>
      </div>
      <CreateBatchTransferDialog
        open={createBatchTransferDialog.isOpen}
        onOpenChange={(open) => {
          if (!open && fetcher.state !== 'idle') return;
          createBatchTransferDialog.setOpen(open);
        }}
        onSubmit={(payload) => {
          fetcher.submit(
            { payload: JSON.stringify(payload) },
            {
              method: 'post',
              action: '/api/batch-transfer',
            }
          );
        }}
        isSubmitting={fetcher.state !== 'idle'}
        serverError={createBatchError}
      />
    </>
  );
}
