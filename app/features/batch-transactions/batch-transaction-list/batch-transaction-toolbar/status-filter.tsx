import { useEffect, useState } from 'react';

import { FunnelIcon } from '@phosphor-icons/react';

import { Button } from '~/components/ui/button';
import { usePopup } from '~/hooks/use-popup';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import type { StatusFilterValue } from '~/types/transaction';

import styles from './status-filter.module.css';

const OPTIONS: StatusFilterValue[] = ['all', 'settled', 'pending', 'failed'];

const LABELS: Record<StatusFilterValue, string> = {
  all: 'All statuses',
  settled: 'Settled',
  pending: 'Pending',
  failed: 'Failed',
};

export interface StatusFilterProps {
  applied: StatusFilterValue;
  onApply: (value: StatusFilterValue) => void;
}

export function StatusFilter({ applied, onApply }: StatusFilterProps) {
  const popover = usePopup();
  const [draft, setDraft] = useState<StatusFilterValue>(applied);

  useEffect(() => {
    if (popover.isOpen) setDraft(applied);
  }, [popover.isOpen, applied]);

  return (
    <Popover open={popover.isOpen} onOpenChange={popover.setOpen}>
      <PopoverTrigger asChild>
        <Button type='button' variant='outline' size='default'>
          <span className={styles.triggerInner}>
            <FunnelIcon size={16} weight='bold' aria-hidden />
            {LABELS[applied]}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className={styles.popover} align='start'>
        <ul className={styles.list} role='listbox' aria-label='Status'>
          {OPTIONS.map((key) => (
            <li key={key}>
              <button
                type='button'
                role='option'
                aria-selected={draft === key}
                className={
                  draft === key
                    ? `${styles.option} ${styles.optionSelected}`
                    : styles.option
                }
                onClick={() => setDraft(key)}
              >
                {LABELS[key]}
              </button>
            </li>
          ))}
        </ul>
        <div className={styles.actions}>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => setDraft('all')}
          >
            Clear
          </Button>
          <Button
            type='button'
            size='sm'
            onClick={() => {
              onApply(draft);
              popover.closePopup();
            }}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
