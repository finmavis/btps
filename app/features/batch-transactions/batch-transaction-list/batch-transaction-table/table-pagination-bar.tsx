import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';

import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { cn } from '~/lib/utils';

import styles from './table-pagination-bar.module.css';

export interface TablePaginationBarProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function TablePaginationBar({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: TablePaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, totalItems);

  const windowSize = 4;
  let startPage = Math.max(1, safePage - Math.floor(windowSize / 2));
  const endPage = Math.min(totalPages, startPage + windowSize - 1);
  if (endPage - startPage + 1 < windowSize) {
    startPage = Math.max(1, endPage - windowSize + 1);
  }
  const pageNumbers: number[] = [];
  for (let p = startPage; p <= endPage; p++) pageNumbers.push(p);

  return (
    <div className={styles.root}>
      <p className={styles.summary}>
        Showing {start}-{end} of {totalItems} results
      </p>

      <div className={styles.pages}>
        <Button
          type='button'
          variant='outline'
          size='icon'
          aria-label='Previous page'
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          <CaretLeftIcon size={16} weight='bold' />
        </Button>
        {pageNumbers.map((p) => (
          <Button
            key={p}
            type='button'
            variant='outline'
            className={cn(styles.pageBtn, {
              [styles.pageBtnActive]: p === safePage,
            })}
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}
        <Button
          type='button'
          variant='outline'
          size='icon'
          aria-label='Next page'
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          <CaretRightIcon size={16} weight='bold' />
        </Button>
      </div>

      <div className={styles.rowsPerPage}>
        <Label htmlFor='rows-per-page'>Rows per page:</Label>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => onPageSizeChange(Number(v))}
        >
          <SelectTrigger id='rows-per-page' className={styles.rowsSelect}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
