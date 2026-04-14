import { useEffect, useState } from 'react';
import { CalendarIcon } from '@phosphor-icons/react';

import { Button } from '~/components/ui/button';
import { usePopup } from '~/hooks/use-popup';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import type { DateRangeValue } from '~/types/transaction';

import styles from './date-range-filter.module.css';

export type { DateRangeValue };

export interface DateRangeFilterProps {
  applied: DateRangeValue;
  onApply: (next: DateRangeValue) => void;
}

const ELLIPSIS = '…';

export function DateRangeFilter({ applied, onApply }: DateRangeFilterProps) {
  const popover = usePopup();
  const [draft, setDraft] = useState<DateRangeValue>(applied);

  useEffect(() => {
    if (popover.isOpen) setDraft(applied);
  }, [popover.isOpen, applied]);

  const label =
    applied.from && applied.to
      ? `${applied.from} - ${applied.to}`
      : applied.from || applied.to
        ? `${applied.from || ELLIPSIS} - ${applied.to || ELLIPSIS}`
        : 'Date range';

  return (
    <Popover open={popover.isOpen} onOpenChange={popover.setOpen}>
      <PopoverTrigger asChild>
        <Button type='button' variant='outline' size='default'>
          <span className={styles.triggerInner}>
            <CalendarIcon size={16} weight='bold' aria-hidden />
            {label}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className={styles.popover}>
        <div className={styles.row}>
          <div className={styles.labelRow}>
            <span className={styles.label}>From</span>
            <input
              type='date'
              className={styles.dateInput}
              value={draft.from}
              onChange={(e) =>
                setDraft((d) => ({ ...d, from: e.target.value }))
              }
            />
          </div>
          <div className={styles.labelRow}>
            <span className={styles.label}>To</span>
            <input
              type='date'
              className={styles.dateInput}
              value={draft.to}
              onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
            />
          </div>
        </div>
        <div className={styles.actions}>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => setDraft({ from: '', to: '' })}
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
