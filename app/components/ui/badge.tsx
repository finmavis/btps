import * as React from 'react';

import { cn } from '~/lib/utils';

import styles from './badge.module.css';

const VARIANT_MAP = {
  default: styles.variantDefault,
  success: styles.variantSuccess,
  warning: styles.variantWarning,
  error: styles.variantError,
} as const;

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof VARIANT_MAP;
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(styles.badge, VARIANT_MAP[variant], className)}
      {...props}
    />
  );
}
