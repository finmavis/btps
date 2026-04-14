import { Card, CardContent } from '~/components/ui/card';
import type { BatchTransaction } from '~/types/transaction';

import { BatchTransactionsTable } from './batch-transactions-table';
import type { SortDirection } from './sortable-column-header';
import { TablePaginationBar } from './table-pagination-bar';

import styles from './batch-transactions-table-card.module.css';

export interface BatchTransactionsTableCardProps {
  rows: BatchTransaction[];
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  dateSort: SortDirection;
  onToggleDateSort: () => void;
}

export function BatchTransactionsTableCard({
  rows,
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  dateSort,
  onToggleDateSort,
}: BatchTransactionsTableCardProps) {
  return (
    <Card className={styles.card}>
      <CardContent flush>
        <BatchTransactionsTable
          rows={rows}
          dateSort={dateSort}
          onToggleDateSort={onToggleDateSort}
        />
        <TablePaginationBar
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </CardContent>
    </Card>
  );
}
