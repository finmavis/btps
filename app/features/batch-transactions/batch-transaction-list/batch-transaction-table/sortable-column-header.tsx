import { ArrowDownIcon, ArrowUpIcon } from '@phosphor-icons/react';

import { Button } from '~/components/ui/button';

import styles from './sortable-column-header.module.css';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortableColumnHeaderProps {
  label: string;
  sortDirection: SortDirection;
  onSort: () => void;
}

export function SortableColumnHeader({
  label,
  sortDirection,
  onSort,
}: SortableColumnHeaderProps) {
  return (
    <div className={styles.wrap}>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        className={styles.trigger}
        onClick={onSort}
      >
        <span>{label}</span>
        <span className={styles.icon} aria-hidden>
          {sortDirection === 'asc' ? (
            <ArrowUpIcon size={14} weight='bold' />
          ) : sortDirection === 'desc' ? (
            <ArrowDownIcon size={14} weight='bold' />
          ) : (
            <ArrowDownIcon size={14} weight='bold' className={styles.muted} />
          )}
        </span>
      </Button>
    </div>
  );
}
