import * as React from 'react';

import { cn } from '../../utils/cn.js';
import { Label } from '../Label/Label.js';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  errorMessage?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Input — an accessible text input component.
 *
 * Supports custom sizes, focus border rings, validation handlers, helpers,
 * and dynamic error state configurations.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type = 'text', label, helperText, errorMessage, size = 'md', id, ...props },
    ref
  ) => {
    const defaultId = React.useId();
    const inputId = id ?? defaultId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const hasError = !!errorMessage;
    const describedBy = cn(helperText && !hasError && helperId, hasError && errorId) || undefined;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <input
          id={inputId}
          ref={ref}
          type={type}
          aria-describedby={describedBy}
          aria-invalid={hasError ? 'true' : undefined}
          className={cn(
            'flex w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-transparent text-[var(--color-text-primary)] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            size === 'sm' && 'h-8 px-3 py-1 text-[var(--font-size-sm)]',
            size === 'md' && 'h-10 px-3 py-2 text-[var(--font-size-base)]',
            size === 'lg' && 'h-12 px-4 py-3 text-[var(--font-size-lg)]',
            hasError &&
              'border-[var(--color-status-error)] focus-visible:ring-[var(--color-status-error)]',
            className
          )}
          {...props}
        />
        {helperText && !hasError && (
          <p
            id={helperId}
            className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]"
          >
            {helperText}
          </p>
        )}
        {hasError && (
          <p id={errorId} className="text-[var(--font-size-xs)] text-[var(--color-status-error)]">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
