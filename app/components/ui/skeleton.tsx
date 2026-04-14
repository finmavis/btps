import * as React from 'react';

import { cn } from '~/lib/utils';

import styles from './skeleton.module.css';

export type SkeletonProps = React.HTMLAttributes<HTMLSpanElement>;

export const Skeleton = React.forwardRef<HTMLSpanElement, SkeletonProps>(
  ({ className, 'aria-hidden': ariaHidden = true, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(styles.root, className)}
      aria-hidden={ariaHidden}
      {...props}
    />
  )
);
Skeleton.displayName = 'Skeleton';
