import * as React from 'react';

import { cn } from '~/lib/utils';

import styles from './input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  iconStart?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', iconStart, ...props }, ref) => {
    if (iconStart) {
      return (
        <div className={styles.wrap}>
          <span className={styles.iconStart} aria-hidden>
            {iconStart}
          </span>
          <input
            type={type}
            className={cn(styles.input, styles.withIconStart, className)}
            ref={ref}
            {...props}
          />
        </div>
      );
    }
    return (
      <input
        type={type}
        className={cn(styles.input, className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
