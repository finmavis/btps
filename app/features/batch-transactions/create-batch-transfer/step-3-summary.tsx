import { memo, useMemo } from 'react';

import { Button } from '~/components/ui/button';
import { formatCurrency } from '~/lib/format';
import type { BatchTransferCsvTransaction } from '~/features/batch-transactions/utils/batch-transfer-csv';

import styles from './create-batch-transfer-dialog.module.css';

export type SummaryProps = {
  batchName: string;
  approverName: string | null;
  transactions: BatchTransferCsvTransaction[];
  serverError: string | null;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
};

function Summary({
  batchName,
  approverName,
  transactions,
  serverError,
  isSubmitting,
  onBack,
  onSubmit,
}: SummaryProps) {
  const stats = useMemo(() => {
    let total = 0;
    for (const r of transactions) {
      if (r.isValid && Number.isFinite(r.amount)) total += r.amount;
    }
    const count = transactions.length;
    const avg = count > 0 ? total / count : 0;
    return { total, count, avg };
  }, [transactions]);

  return (
    <div className={styles.summaryGrid}>
      <h3 className={`${styles.sectionTitle} ${styles.summaryTitleFull}`}>
        Summary
      </h3>
      <div className={styles.summaryBlock}>
        <p className={styles.summaryLabel}>Batch Transfer Name</p>
        <p className={styles.summaryValue}>{batchName}</p>
      </div>
      <div className={styles.summaryBlock}>
        <p className={styles.summaryLabel}>Approver</p>
        <p className={styles.summaryValue}>{approverName ?? '—'}</p>
      </div>
      <div className={`${styles.statsRow} ${styles.summaryStatsFull}`}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total amount</p>
          <p className={styles.statValue}>{formatCurrency(stats.total)}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Number of payments</p>
          <p className={styles.statValue}>{stats.count}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Average payment</p>
          <p className={styles.statValue}>{formatCurrency(stats.avg)}</p>
        </div>
      </div>
      {serverError ? (
        <p
          className={`${styles.errorText} ${styles.summaryErrorFull}`}
          role='alert'
        >
          {serverError}
        </p>
      ) : null}
      <div className={styles.summaryActionsRow}>
        <Button
          type='button'
          variant='outline'
          disabled={isSubmitting}
          onClick={onBack}
        >
          Back
        </Button>
        <div className={styles.summarySubmitRow}>
          <Button type='button' disabled={isSubmitting} onClick={onSubmit}>
            {isSubmitting ? 'Working…' : 'Submit batch'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export const MemoizedSummary = memo(Summary);
