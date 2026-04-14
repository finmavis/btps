import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { formatCurrency, formatDisplayDate } from '~/lib/format';
import type { BatchTransaction } from '~/types/transaction';

import { BatchTransactionBadge } from './batch-transaction-badge';

import styles from './transaction-details-dialog.module.css';

function TransactionSummaryBody({ row }: { row: BatchTransaction }) {
  const {
    id,
    batchId,
    approver,
    transactionDate,
    accountNumber,
    accountHolderName,
    amount,
    batchName,
    status,
    errors,
  } = row;

  return (
    <dl className={styles.summary}>
      <dt className={styles.term}>Record ID</dt>
      <dd className={styles.value}>
        <code className={styles.mono}>{id}</code>
      </dd>
      <dt className={styles.term}>Transaction Date</dt>
      <dd className={styles.value}>{formatDisplayDate(transactionDate)}</dd>
      <dt className={styles.term}>Account Number</dt>
      <dd className={styles.value}>{accountNumber}</dd>
      <dt className={styles.term}>Account Holder Name</dt>
      <dd className={styles.value}>{accountHolderName}</dd>
      <dt className={styles.term}>Amount</dt>
      <dd className={`${styles.value} ${styles.amount}`}>
        {formatCurrency(amount)}
      </dd>
      <dt className={styles.term}>Status</dt>
      <dd className={styles.value}>
        <BatchTransactionBadge status={status} errors={errors} />
      </dd>
      <dt className={styles.term}>Approver</dt>
      <dd className={styles.value}>{approver.name}</dd>
      <dt className={styles.term}>Batch name</dt>
      <dd className={styles.value}>{batchName}</dd>
      <dt className={styles.term}>Batch ID</dt>
      <dd className={styles.value}>{batchId}</dd>
    </dl>
  );
}

export interface TransactionDetailsDialogProps {
  row: BatchTransaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showApproveActions: boolean;
  approving: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export function TransactionDetailsDialog({
  row,
  open,
  onOpenChange,
  showApproveActions,
  approving,
  onApprove,
  onReject,
}: TransactionDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transaction details</DialogTitle>
          <DialogDescription>
            Review the transaction details below.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <TransactionSummaryBody row={row} />
        </DialogBody>
        <DialogFooter className={styles.footer}>
          {showApproveActions ? (
            <>
              <Button
                type='button'
                variant='outline'
                disabled={approving}
                onClick={onReject}
              >
                Reject
              </Button>
              <Button
                type='button'
                variant='default'
                disabled={approving}
                onClick={onApprove}
              >
                {approving ? 'Submitting…' : 'Approve'}
              </Button>
            </>
          ) : (
            <Button
              type='button'
              variant='default'
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
