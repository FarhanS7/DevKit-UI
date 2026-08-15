/* eslint-disable no-unused-vars */
import * as React from 'react';

import { cn } from '../../utils/cn.js';

interface TabsContextValue {
  value: string;
  setValue: (_value: string) => void;
  orientation: 'horizontal' | 'vertical';
  activationMode: 'automatic' | 'manual';
  baseId: string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs sub-components must be nested within a <Tabs> provider.');
  }
  return context;
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (_value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  activationMode?: 'automatic' | 'manual';
}

export function Tabs({
  children,
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  orientation = 'horizontal',
  activationMode = 'automatic',
  className,
  ...props
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const value = controlledValue ?? uncontrolledValue;

  const setValue = React.useCallback(
    (nextValue: string) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [controlledValue, onValueChange]
  );

  const baseId = React.useId();

  return (
    <TabsContext.Provider value={{ value, setValue, orientation, activationMode, baseId }}>
      <div
        className={cn(
          'flex',
          orientation === 'vertical' ? 'flex-row gap-4' : 'flex-col',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, externalRef) => {
    const { orientation } = useTabsContext();
    const internalRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(externalRef, () => internalRef.current as HTMLDivElement);

    // Handle arrow key navigation between tab triggers
    React.useEffect(() => {
      const list = internalRef.current;
      if (!list) return;

      function handleKeyDown(event: KeyboardEvent) {
        if (!list) return;
        const activeElement = document.activeElement as HTMLElement;
        if (!activeElement || activeElement.getAttribute('role') !== 'tab') return;

        const tabs = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]'));
        const index = tabs.indexOf(activeElement);
        if (index === -1) return;

        let nextIndex = index;
        if (orientation === 'horizontal') {
          if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
          if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else {
          if (event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
          if (event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
        }

        if (nextIndex !== index) {
          event.preventDefault();
          const nextTab = tabs[nextIndex];
          nextTab?.focus();

          if (nextTab && nextTab.dataset.activation === 'automatic') {
            nextTab.click();
          }
        }
      }

      list.addEventListener('keydown', handleKeyDown);
      return () => {
        list.removeEventListener('keydown', handleKeyDown);
      };
    }, [orientation]);

    return (
      <div
        ref={internalRef}
        role="tablist"
        aria-orientation={orientation}
        className={cn(
          'inline-flex items-center justify-center rounded-[var(--radius-lg,0.5rem)] bg-[var(--color-background-subtle,#f3f4f6)] p-1 text-[var(--color-text-secondary,#4b5563)]',
          orientation === 'vertical' ? 'flex-col items-stretch' : 'flex-row',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsList.displayName = 'Tabs.List';

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: activeValue, setValue, activationMode, baseId } = useTabsContext();
    const isSelected = activeValue === value;

    const triggerId = `${baseId}-trigger-${value}`;
    const panelId = `${baseId}-panel-${value}`;

    const handleSelect = () => {
      setValue(value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (activationMode === 'manual' && (event.key === ' ' || event.key === 'Enter')) {
        event.preventDefault();
        handleSelect();
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={triggerId}
        aria-selected={isSelected}
        aria-controls={panelId}
        tabIndex={isSelected ? 0 : -1}
        data-activation={activationMode}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-md,0.375rem)] px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus,#3b82f6)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          isSelected
            ? 'bg-[var(--color-background-default,#ffffff)] text-[var(--color-text-primary,#111827)] shadow-sm'
            : 'hover:text-[var(--color-text-primary,#111827)]',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TabsTrigger.displayName = 'Tabs.Trigger';

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: activeValue, baseId } = useTabsContext();
    const isSelected = activeValue === value;

    const triggerId = `${baseId}-trigger-${value}`;
    const panelId = `${baseId}-panel-${value}`;

    if (!isSelected) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={panelId}
        aria-labelledby={triggerId}
        tabIndex={0}
        className={cn(
          'mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus,#3b82f6)] focus-visible:ring-offset-2',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsContent.displayName = 'Tabs.Content';

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;
