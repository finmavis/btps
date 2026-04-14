import { MagnifyingGlassIcon } from '@phosphor-icons/react';

import type { DateRangeValue, StatusFilterValue } from '~/types/transaction';
import { Input, type InputProps } from '~/components/ui/input';

import { DateRangeFilter } from './date-range-filter';
import { StatusFilter } from './status-filter';

import styles from './batch-transactions-toolbar.module.css';

export type BatchTransactionsSearchFieldProps = Omit<
  InputProps,
  'value' | 'onChange'
> & {
  value: string;
  onChange: (value: string) => void;
};

export function BatchTransactionsSearchField({
  value,
  onChange,
  ...props
}: BatchTransactionsSearchFieldProps) {
  return (
    <div className={styles.searchField}>
      <Input
        {...props}
        type='search'
        placeholder='Search by batch name, account, approver…'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete='off'
        iconStart={<MagnifyingGlassIcon size={16} weight='bold' />}
      />
    </div>
  );
}

export interface BatchTransactionsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  dateApplied: DateRangeValue;
  onDateApply: (next: DateRangeValue) => void;
  statusApplied: StatusFilterValue;
  onStatusApply: (value: StatusFilterValue) => void;
}

export function BatchTransactionsToolbar({
  search,
  onSearchChange,
  dateApplied,
  onDateApply,
  statusApplied,
  onStatusApply,
}: BatchTransactionsToolbarProps) {
  return (
    <div className={styles.container}>
      <BatchTransactionsSearchField value={search} onChange={onSearchChange} />
      <DateRangeFilter applied={dateApplied} onApply={onDateApply} />
      <StatusFilter applied={statusApplied} onApply={onStatusApply} />
    </div>
  );
}
