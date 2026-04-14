import { useEffect, useMemo, useState } from 'react';
import { useFetcher } from 'react-router';

import {
  Table,
  TableBody,
  TableCell,
  TableHeadCell,
  TableHeader,
  TableHeaderRow,
  TableRow,
} from '~/components/ui/table';
import { formatCurrency, formatDisplayDate } from '~/lib/format';
import { useAccount } from '~/state/account-context';
import { canBeBatchApprover } from '~/lib/user-role';
import { translateActionError } from '~/lib/api-errors';
import type { BatchTransaction } from '~/types/transaction';

import { RowActionsMenu } from './row-actions-menu';
import type { SortDirection } from './sortable-column-header';
import { SortableColumnHeader } from './sortable-column-header';
import { BatchTransactionBadge } from './batch-transaction-badge';
import { TransactionActionResultDialog } from './transaction-action-result-dialog';
import { TransactionDetailsDialog } from './transaction-details-dialog';

import styles from './batch-transactions-table.module.css';

export interface CurrencyCellProps {
  amount: number;
}

export function CurrencyCell({ amount }: CurrencyCellProps) {
  return <span className={styles.root}>{formatCurrency(amount)}</span>;
}

export interface BatchNameIdCellProps {
  batchName: string;
  batchId: string;
}

export function BatchNameIdCell({ batchName, batchId }: BatchNameIdCellProps) {
  return (
    <div className={styles.batchNameIdCell}>
      <span className={styles.batchName}>{batchName}</span>
      <span className={styles.batchId}>{batchId}</span>
    </div>
  );
}

export interface BatchTransactionsTableProps {
  rows: BatchTransaction[];
  dateSort: SortDirection;
  onToggleDateSort: () => void;
}

export function BatchTransactionsTable({
  rows,
  dateSort,
  onToggleDateSort,
}: BatchTransactionsTableProps) {
  const fetcher = useFetcher();
  const { selectedAccount } = useAccount();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<BatchTransaction | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [result, setResult] = useState<{
    variant: 'success' | 'error';
    title: string;
    description: string;
  } | null>(null);
  const [lastAction, setLastAction] = useState<'approve' | 'reject' | null>(
    null
  );

  const approving = fetcher.state !== 'idle';

  const showApproveActions = useMemo(() => {
    if (!selectedRow) return false;
    if (selectedRow.status !== 'pending') return false;
    if (!selectedAccount) return false;
    const isAssignedApprover =
      selectedAccount.id === selectedRow.approver.userId;
    return isAssignedApprover && canBeBatchApprover(selectedAccount);
  }, [selectedRow, selectedAccount]);

  const actionVerb = useMemo(() => {
    if (lastAction === 'reject') return 'Reject';
    if (lastAction === 'approve') return 'Approve';
    return 'Submit';
  }, [lastAction]);

  useEffect(() => {
    if (fetcher.state !== 'idle') return;
    const d = fetcher.data;
    if (!d) return;

    const ok =
      typeof d === 'object' && 'ok' in d && (d as { ok?: boolean }).ok === true;
    const error = translateActionError(d);

    if (ok) {
      setDetailsOpen(false);
      const title =
        lastAction === 'reject'
          ? 'Transaction rejected'
          : 'Transaction approved';
      const description =
        lastAction === 'reject'
          ? 'This transaction is now marked as failed.'
          : 'This transaction is now marked as settled.';
      setResult({ variant: 'success', title, description });
      setResultOpen(true);
      return;
    }

    if (error) {
      setDetailsOpen(false);
      setResult({
        variant: 'error',
        title: `${actionVerb} failed`,
        description: error,
      });
      setResultOpen(true);
    }
  }, [fetcher.state, fetcher.data, lastAction, actionVerb]);

  const onViewDetails = (row: BatchTransaction) => {
    setSelectedRow(row);
    setDetailsOpen(true);
  };

  const canApproveRow = (row: BatchTransaction): boolean => {
    if (row.status !== 'pending') return false;
    if (!selectedAccount) return false;
    const isAssignedApprover = selectedAccount.id === row.approver.userId;
    return isAssignedApprover && canBeBatchApprover(selectedAccount);
  };

  const submitApprove = () => {
    if (!selectedRow) return;
    setLastAction('approve');
    fetcher.submit(
      { batchTransactionId: selectedRow.id },
      { method: 'POST', action: '/api/approve-batch' }
    );
  };

  const submitReject = () => {
    if (!selectedRow) return;
    setLastAction('reject');
    fetcher.submit(
      { batchTransactionId: selectedRow.id },
      { method: 'POST', action: '/api/reject-batch' }
    );
  };

  return (
    <>
      {selectedRow ? (
        <TransactionDetailsDialog
          row={selectedRow}
          open={detailsOpen}
          onOpenChange={(open) => {
            setDetailsOpen(open);
            if (!open) setSelectedRow(null);
          }}
          showApproveActions={showApproveActions}
          approving={approving}
          onApprove={submitApprove}
          onReject={submitReject}
        />
      ) : null}

      {result ? (
        <TransactionActionResultDialog
          open={resultOpen}
          onOpenChange={(open) => {
            setResultOpen(open);
            if (!open) setResult(null);
          }}
          title={result.title}
          description={result.description}
          variant={result.variant}
        />
      ) : null}

      <Table>
        <TableHeader>
          <TableHeaderRow>
            <TableHeadCell>
              <SortableColumnHeader
                label='Transaction Date'
                sortDirection={dateSort}
                onSort={onToggleDateSort}
              />
            </TableHeadCell>
            <TableHeadCell>Account Number</TableHeadCell>
            <TableHeadCell>Account Holder Name</TableHeadCell>
            <TableHeadCell align='right'>Amount</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Batch Name / ID</TableHeadCell>
            <TableHeadCell>Approver</TableHeadCell>
            <TableHeadCell align='center'>Actions</TableHeadCell>
          </TableHeaderRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{formatDisplayDate(row.transactionDate)}</TableCell>
              <TableCell muted>{row.accountNumber}</TableCell>
              <TableCell>{row.accountHolderName}</TableCell>
              <TableCell align='right'>
                <CurrencyCell amount={row.amount} />
              </TableCell>
              <TableCell>
                <BatchTransactionBadge
                  status={row.status}
                  errors={row.errors}
                />
              </TableCell>
              <TableCell>
                <BatchNameIdCell
                  batchName={row.batchName}
                  batchId={row.batchId}
                />
              </TableCell>
              <TableCell>{row.approver.name}</TableCell>
              <TableCell align='center'>
                <RowActionsMenu
                  row={row}
                  onViewDetails={onViewDetails}
                  showApprove={canApproveRow(row)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
