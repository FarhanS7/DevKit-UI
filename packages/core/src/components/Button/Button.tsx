import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn.js';
import type { PolymorphicForwardRefComponent } from '../../utils/polymorphic.js';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-md)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-interactive-default)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-hover)] active:bg-[var(--color-interactive-active)]',
        secondary:
          'border border-[var(--color-border-default)] bg-transparent hover:bg-[var(--color-background-subtle)] active:bg-[var(--color-border-default)] text-[var(--color-text-primary)]',
        ghost:
          'hover:bg-[var(--color-background-subtle)] text-[var(--color-text-primary)] active:bg-[var(--color-border-default)]',
        destructive:
          'bg-[var(--color-status-error)] text-[var(--color-text-inverse)] hover:bg-[var(--color-status-error)] hover:opacity-90 active:opacity-100',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-8 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonOwnProps extends VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  disabled?: boolean;
}

/**
 * Button — the primary polymorphic interactive trigger element.
 *
 * It supports multiple variants and sizes, and accepts `isLoading` and
 * optional icon slots. Defaults to `<button type="button">` to prevent
 * accidental form submissions.
 */
const Button = React.forwardRef(
  (
    {
      as,
      variant,
      size,
      isLoading,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...rest
    }: ButtonOwnProps & { as?: React.ElementType; className?: string; [key: string]: unknown },
    ref: React.Ref<HTMLButtonElement>
  ) => {
    const Component = as ?? 'button';
    const isNativeButton = Component === 'button';

    // Ensure native buttons don't accidentally submit forms unless overridden
    const extraProps = isNativeButton ? { type: 'button' } : {};
    const isDisabled = disabled || isLoading;

    return (
      <Component
        ref={ref}
        disabled={isDisabled}
        aria-busy={isLoading ? 'true' : undefined}
        className={cn(buttonVariants({ variant, size }), className)}
        {...extraProps}
        {...rest}
      >
        {isLoading && (
          <span
            className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {!isLoading && leftIcon && (
          <span className="mr-2 inline-flex" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="ml-2 inline-flex" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </Component>
    );
  }
) as PolymorphicForwardRefComponent<'button', ButtonOwnProps>;

(Button as React.FC).displayName = 'Button';

export { Button };
