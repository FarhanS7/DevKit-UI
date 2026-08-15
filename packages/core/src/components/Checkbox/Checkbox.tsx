/* eslint-disable no-unused-vars */
import * as React from 'react';

import { cn } from '../../utils/cn.js';

export type CheckedState = boolean | 'indeterminate';

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'checked' | 'defaultChecked' | 'onChange'
> {
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  onCheckedChange?: (_checked: CheckedState) => void;
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      label,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const [uncontrolledChecked, setUncontrolledChecked] =
      React.useState<CheckedState>(defaultChecked);
    const checked = controlledChecked ?? uncontrolledChecked;
    const isIndeterminate = checked === 'indeterminate';
    const isChecked = checked === true;

    const defaultId = React.useId();
    const checkboxId = id ?? defaultId;
    const innerRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    React.useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = isIndeterminate;
      }
    }, [isIndeterminate]);

    const handleToggle = () => {
      if (disabled) return;

      let nextChecked: CheckedState;
      if (isIndeterminate) {
        nextChecked = true;
      } else {
        nextChecked = !checked;
      }

      if (controlledChecked === undefined) {
        setUncontrolledChecked(nextChecked);
      }
      onCheckedChange?.(nextChecked);
    };

    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          role="checkbox"
          id={`${checkboxId}-button`}
          aria-checked={isIndeterminate ? 'mixed' : isChecked}
          aria-disabled={disabled ? 'true' : undefined}
          disabled={disabled}
          onClick={handleToggle}
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm,0.25rem)] border border-[var(--color-border-default,#d1d5db)] bg-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus,#3b82f6)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--color-interactive-default,#2563eb)] data-[state=checked]:border-[var(--color-interactive-default,#2563eb)] data-[state=checked]:text-white data-[state=indeterminate]:bg-[var(--color-interactive-default,#2563eb)] data-[state=indeterminate]:border-[var(--color-interactive-default,#2563eb)] data-[state=indeterminate]:text-white',
            className
          )}
          data-state={isIndeterminate ? 'indeterminate' : isChecked ? 'checked' : 'unchecked'}
        >
          {isChecked && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
          {isIndeterminate && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
            </svg>
          )}
        </button>

        {/* Visually hidden native input for native form submission */}
        <input
          ref={innerRef}
          type="checkbox"
          id={checkboxId}
          checked={isChecked}
          disabled={disabled}
          onChange={() => {}}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
          {...props}
        />

        {label && (
          <label
            htmlFor={`${checkboxId}-button`}
            className={cn(
              'text-sm font-medium leading-none text-[var(--color-text-primary,#111827)] select-none cursor-pointer',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
