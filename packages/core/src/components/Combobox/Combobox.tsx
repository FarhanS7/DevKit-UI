/* eslint-disable no-unused-vars */
import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '../../utils/cn.js';
import { Label } from '../Label/Label.js';

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  placeholder = 'Select an option...',
  label,
  id,
  disabled,
  className,
}: ComboboxProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const value = controlledValue ?? uncontrolledValue;
  const activeOption = options.find(opt => opt.value === value);

  const [search, setSearch] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const defaultId = React.useId();
  const comboboxId = id ?? defaultId;

  const filteredOptions = React.useMemo(() => {
    return options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  const handleSelect = (val: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(val);
    }
    onValueChange?.(val);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <Label htmlFor={comboboxId}>{label}</Label>}

      {/* aria-live polite region to announce filtered count to screen readers */}
      <span className="sr-only" aria-live="polite">
        {open ? `${filteredOptions.length} options available.` : ''}
      </span>

      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            id={comboboxId}
            role="combobox"
            aria-expanded={open}
            aria-controls={`${comboboxId}-list`}
            disabled={disabled}
            className={cn(
              'flex h-10 w-full items-center justify-between rounded-[var(--radius-md,#0.375rem)] border border-[var(--color-border-default,#d1d5db)] bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus,#3b82f6)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-[var(--color-text-primary,#111827)]',
              className
            )}
          >
            <span>{activeOption ? activeOption.label : placeholder}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4 opacity-50"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
              />
            </svg>
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[8rem] overflow-hidden rounded-[var(--radius-md,#0.375rem)] border border-[var(--color-border-default,#d1d5db)] bg-[var(--color-background-default,#ffffff)] p-1 text-[var(--color-text-primary,#111827)] shadow-md"
          >
            <div className="flex items-center border-b border-[var(--color-border-default,#d1d5db)] px-3">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex h-9 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-[var(--color-text-secondary,#6b7280)] disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div id={`${comboboxId}-list`} role="listbox" className="max-h-60 overflow-y-auto mt-1">
              {filteredOptions.length === 0 && (
                <div className="py-6 text-center text-sm text-[var(--color-text-secondary,#6b7280)]">
                  No results found.
                </div>
              )}
              {filteredOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={opt.value === value}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-[var(--color-background-subtle,#f3f4f6)] focus:bg-[var(--color-background-subtle,#f3f4f6)] disabled:pointer-events-none disabled:opacity-50 text-left transition-colors',
                    opt.value === value &&
                      'font-semibold bg-[var(--color-background-subtle,#f3f4f6)]'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}
