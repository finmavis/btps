import { useRef, useState } from 'react';

import { Badge } from '~/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { BATCH_TRANSFER_ROW_FIELD_LABELS } from '~/features/batch-transactions/utils/batch-transfer-validation-messages';
import type {
  BatchTransactionFieldErrors,
  BatchTransactionStatus,
} from '~/types/transaction';

import styles from './batch-transaction-badge.module.css';

const variantMap: Record<
  BatchTransactionStatus,
  'success' | 'warning' | 'error'
> = {
  settled: 'success',
  pending: 'warning',
  failed: 'error',
};

const LABELS: Record<BatchTransactionStatus, string> = {
  settled: 'Settled',
  pending: 'Pending',
  failed: 'Failed',
};

export interface BatchTransactionBadgeProps {
  status: BatchTransactionStatus;
  errors?: BatchTransactionFieldErrors;
}

export function BatchTransactionBadge({
  status,
  errors,
}: BatchTransactionBadgeProps) {
  const label = LABELS[status];
  const errorEntries = Object.entries(errors ?? {}).filter(([, msg]) => !!msg);
  const showErrorTooltip = status === 'failed' && errorEntries.length > 0;

  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };
  const cancelClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };

  if (!showErrorTooltip) {
    return <Badge variant={variantMap[status]}>{label}</Badge>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          onMouseEnter={() => {
            cancelClose();
            setOpen(true);
          }}
          onMouseLeave={scheduleClose}
          onFocus={() => setOpen(true)}
          onBlur={scheduleClose}
          className={styles.triggerWrap}
        >
          <Badge variant={variantMap[status]} className={styles.badgeHelp}>
            {label}
          </Badge>
        </div>
      </PopoverTrigger>
      <PopoverContent
        align='center'
        sideOffset={8}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        onFocus={cancelClose}
        onBlur={scheduleClose}
      >
        <div className={styles.popoverBody}>
          <div className={styles.popoverTitle}>Failed</div>
          <ul className={styles.errorsList}>
            {errorEntries.map(([k, msg]) => (
              <li key={k}>
                {BATCH_TRANSFER_ROW_FIELD_LABELS[k] ?? k}: {msg}
              </li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}
