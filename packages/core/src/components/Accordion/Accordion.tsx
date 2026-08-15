/* eslint-disable no-unused-vars */
import * as React from 'react';

import { cn } from '../../utils/cn.js';
import { Heading, type HeadingTag } from '../Heading/Heading.js';

interface AccordionContextValue {
  activeValues: string[];
  toggleItem: (_value: string) => void;
  baseId: string;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

function useAccordionContext(): AccordionContextValue {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion sub-components must be nested within an <Accordion> provider.');
  }
  return context;
}

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  type?: 'single' | 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (_value: string[]) => void;
}

export function Accordion({
  children,
  type = 'single',
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  className,
  ...props
}: AccordionProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string[]>(defaultValue);
  const activeValues = controlledValue ?? uncontrolledValue;

  const toggleItem = React.useCallback(
    (itemValue: string) => {
      let nextValue: string[];
      if (type === 'single') {
        nextValue = activeValues.includes(itemValue) ? [] : [itemValue];
      } else {
        nextValue = activeValues.includes(itemValue)
          ? activeValues.filter(v => v !== itemValue)
          : [...activeValues, itemValue];
      }

      if (controlledValue === undefined) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [type, activeValues, controlledValue, onValueChange]
  );

  const baseId = React.useId();

  return (
    <AccordionContext.Provider value={{ activeValues, toggleItem, baseId }}>
      <div
        className={cn(
          'divide-y divide-[var(--color-border-default,#e5e7eb)] border-b border-t border-[var(--color-border-default,#e5e7eb)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface ItemContextValue {
  value: string;
  isOpen: boolean;
}

const ItemContext = React.createContext<ItemContextValue | null>(null);

function useItemContext(): ItemContextValue {
  const context = React.useContext(ItemContext);
  if (!context) {
    throw new Error(
      'Accordion.Trigger and Accordion.Content must be nested within <Accordion.Item>'
    );
  }
  return context;
}

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, children, ...props }, ref) => {
    const { activeValues } = useAccordionContext();
    const isOpen = activeValues.includes(value);

    return (
      <ItemContext.Provider value={{ value, isOpen }}>
        <div ref={ref} className={cn('flex flex-col', className)} {...props}>
          {children}
        </div>
      </ItemContext.Provider>
    );
  }
);

AccordionItem.displayName = 'Accordion.Item';

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  asHeading?: HeadingTag;
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, asHeading = 'h3', ...props }, ref) => {
    const { toggleItem, baseId } = useAccordionContext();
    const { value, isOpen } = useItemContext();

    const triggerId = `${baseId}-trigger-${value}`;
    const panelId = `${baseId}-panel-${value}`;

    return (
      <Heading as={asHeading} className="flex m-0">
        <button
          ref={ref}
          type="button"
          id={triggerId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => toggleItem(value)}
          className={cn(
            'flex flex-1 items-center justify-between py-4 font-semibold text-left transition-all hover:underline text-[var(--color-text-primary,#111827)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus,#3b82f6)] focus-visible:ring-offset-2',
            className
          )}
          {...props}
        >
          {children}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={cn(
              'h-4 w-4 shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </Heading>
    );
  }
);

AccordionTrigger.displayName = 'Accordion.Trigger';

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const { baseId } = useAccordionContext();
    const { value, isOpen } = useItemContext();

    const triggerId = `${baseId}-trigger-${value}`;
    const panelId = `${baseId}-panel-${value}`;

    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        role="region"
        id={panelId}
        aria-labelledby={triggerId}
        className={cn(
          'overflow-hidden text-sm pb-4 text-[var(--color-text-secondary,#4b5563)] transition-all duration-200 motion-reduce:transition-none',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AccordionContent.displayName = 'Accordion.Content';

Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;
