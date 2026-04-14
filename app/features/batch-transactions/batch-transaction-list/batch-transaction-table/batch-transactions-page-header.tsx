import { PlusIcon } from '@phosphor-icons/react';

import { Button } from '~/components/ui/button';

import styles from './batch-transactions-page-header.module.css';

export interface BatchTransactionsPageHeaderProps {
  showBatchTransfer?: boolean;
  handleClickCreateBatchTransfer?: () => void;
}

export function BatchTransactionsPageHeader({
  showBatchTransfer = true,
  handleClickCreateBatchTransfer,
}: BatchTransactionsPageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.titles}>
        <h1 className={styles.title}>Batch Transactions</h1>
        <p className={styles.subtitle}>View and manage your batch transfers</p>
      </div>
      {showBatchTransfer ? (
        <div className={styles.actions}>
          <Button
            type='button'
            size='lg'
            onClick={handleClickCreateBatchTransfer}
          >
            <PlusIcon size={18} weight='bold' aria-hidden />
            Batch Transfer
          </Button>
        </div>
      ) : null}
    </header>
  );
}
