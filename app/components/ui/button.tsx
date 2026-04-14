import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '~/lib/utils';

import styles from './button.module.css';

const VARIANT_MAP = {
  default: styles.variantDefault,
  outline: styles.variantOutline,
  ghost: styles.variantGhost,
} as const;

const SIZE_MAP = {
  default: styles.sizeDefault,
  sm: styles.sizeSm,
  lg: styles.sizeLg,
  icon: styles.sizeIcon,
} as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANT_MAP;
  size?: keyof typeof SIZE_MAP;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        type={asChild ? undefined : type}
        className={cn(
          styles.root,
          VARIANT_MAP[variant],
          SIZE_MAP[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
