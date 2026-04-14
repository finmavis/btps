import { CheckCircleIcon, WarningCircleIcon } from '@phosphor-icons/react';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';

import { cn } from '~/lib/utils';

import styles from './transaction-action-result-dialog.module.css';

export interface TransactionActionResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  variant: 'success' | 'error';
}

export function TransactionActionResultDialog({
  open,
  onOpenChange,
  title,
  description,
  variant,
}: TransactionActionResultDialogProps) {
  const Icon = variant === 'success' ? CheckCircleIcon : WarningCircleIcon;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.content}>
        <DialogHeader className={styles.header}>
          <span
            className={cn(styles.iconWrap, {
              [styles.iconWrapSuccess]: variant === 'success',
              [styles.iconWrapError]: variant === 'error',
            })}
            aria-hidden
          >
            <Icon size={22} weight='fill' />
          </span>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className={styles.footer}>
          <Button
            type='button'
            variant={variant === 'error' ? 'outline' : 'default'}
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
