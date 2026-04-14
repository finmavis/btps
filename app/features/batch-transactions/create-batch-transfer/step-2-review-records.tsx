import { CheckIcon, XCircleIcon } from '@phosphor-icons/react';
import { memo, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { type BatchTransferCsvTransaction } from '~/features/batch-transactions/utils/batch-transfer-csv';
import { BATCH_TRANSFER_ROW_FIELD_LABELS } from '~/features/batch-transactions/utils/batch-transfer-validation-messages';
import {
  Table,
  TableBody,
  TableCell,
  TableHeadCell,
  TableHeader,
  TableHeaderRow,
  TableRow,
} from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';

import styles from './create-batch-transfer-dialog.module.css';

export type ValidationPopoverProps = {
  rowIndex: number;
  errors: Array<[string, string]>;
};

function ValidationPopover({ rowIndex, errors }: ValidationPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          aria-label={`Row ${rowIndex} invalid. Show details.`}
          className={`${styles.validBad} ${styles.step2ValidationTrigger}`}
        >
          <span className={styles.validCell}>
            <XCircleIcon size={16} weight='bold' aria-hidden /> Invalid
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' sideOffset={8}>
        <div className={styles.validationPopoverBody}>
          <div className={styles.validationPopoverTitle}>
            Row {rowIndex} errors
          </div>
          {errors.length > 0 ? (
            <ul className={`${styles.errList} ${styles.errListCompact}`}>
              {errors.map(([k, msg]) => (
                <li key={k}>
                  {BATCH_TRANSFER_ROW_FIELD_LABELS[k] ?? k}: {msg}
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.dropHint}>Invalid row.</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export type ReviewTransactionsProps = {
  transactions: BatchTransferCsvTransaction[];
  onBack: () => void;
  onNext: () => void;
  isSubmitting: boolean;
};

function ReviewTransactions({
  transactions,
  onBack,
  onNext,
  isSubmitting,
}: ReviewTransactionsProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 49,
    overscan: 5,
  });

  const totalSize = rowVirtualizer.getTotalSize();
  const virtualItems = rowVirtualizer.getVirtualItems();

  const canContinue = useMemo(
    () => transactions.length > 0,
    [transactions.length]
  );

  return (
    <div>
      <h3 className={styles.sectionTitle}>Review records</h3>
      <p className={`${styles.dropHint} ${styles.step2Hint}`}>
        Each row is validated. Fix your CSV and re-upload from step 1 if needed.
      </p>
      <div ref={parentRef} className={styles.tableWrap}>
        <Table className={styles.step2ReviewTable}>
          <TableHeader className={styles.step2VirtualThead}>
            <TableHeaderRow>
              <TableHeadCell>#</TableHeadCell>
              <TableHeadCell>Transaction Date</TableHeadCell>
              <TableHeadCell>Account Number</TableHeadCell>
              <TableHeadCell>Account Holder Name</TableHeadCell>
              <TableHeadCell align='right'>Amount</TableHeadCell>
              <TableHeadCell>Validation</TableHeadCell>
            </TableHeaderRow>
          </TableHeader>
          <TableBody
            className={styles.step2VirtualTbody}
            style={{ height: totalSize }}
          >
            {/* <div style={{
              display: "block",
              width: '100%',
              position: "relative",
              height: totalSize,
            }}> */}
            {virtualItems.map((virtualRow) => {
              const row = transactions[virtualRow.index]!;
              const ok = row.isValid;
              const errEntries = Object.entries(row.errors).filter(
                ([, msg]) => !!msg
              );
              return (
                <TableRow
                  key={virtualRow.key}
                  className={styles.step2VirtualRow}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <TableCell muted>{row.rowIndex}</TableCell>
                  <TableCell muted={!!row.errors.date}>{row.date}</TableCell>
                  <TableCell muted={!!row.errors.accountNumber}>
                    {row.accountNumber}
                  </TableCell>
                  <TableCell muted={!!row.errors.name}>{row.name}</TableCell>
                  <TableCell align='right' muted={!!row.errors.amount}>
                    {row.amountRaw}
                  </TableCell>
                  <TableCell>
                    {ok ? (
                      <span className={styles.validOk}>
                        <CheckIcon size={16} weight='bold' aria-hidden />
                        OK
                      </span>
                    ) : (
                      <ValidationPopover
                        rowIndex={row.rowIndex}
                        errors={errEntries}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {/* </div> */}
          </TableBody>
        </Table>
      </div>

      <div className={styles.step2ActionsRow}>
        <Button
          type='button'
          variant='outline'
          disabled={isSubmitting}
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          type='button'
          disabled={isSubmitting || !canContinue}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export const MemoizedReviewTransactions = memo(ReviewTransactions);
