import * as React from 'react';

import { cn } from '~/lib/utils';

import styles from './table.module.css';

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className={styles.wrapper}>
    <table ref={ref} className={cn(styles.table, className)} {...props} />
  </div>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={className} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={className} {...props} />
));
TableBody.displayName = 'TableBody';

const TableHeaderRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn(styles.headerRow, className)} {...props} />
));
TableHeaderRow.displayName = 'TableHeaderRow';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn(styles.bodyRow, className)} {...props} />
));
TableRow.displayName = 'TableRow';

const TableHeadCell = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & {
    align?: 'left' | 'right' | 'center';
  }
>(({ className, align = 'left', ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      styles.headCell,
      {
        [styles.headCellRight]: align === 'right',
        [styles.headCellCenter]: align === 'center',
      },
      className
    )}
    {...props}
  />
));
TableHeadCell.displayName = 'TableHeadCell';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    align?: 'left' | 'right' | 'center';
    muted?: boolean;
  }
>(({ className, align = 'left', muted, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      styles.cell,
      {
        [styles.cellRight]: align === 'right',
        [styles.cellMuted]: muted,
      },
      className
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

export {
  Table,
  TableHeader,
  TableBody,
  TableHeaderRow,
  TableHeadCell,
  TableRow,
  TableCell,
};
