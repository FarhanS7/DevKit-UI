/* eslint-disable no-unused-vars */
import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '../../utils/cn.js';

export interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (_open: boolean) => void;
}

export function Popover({ children, open, defaultOpen, onOpenChange }: PopoverProps) {
  const rootProps: PopoverPrimitive.PopoverProps = { children };
  if (open !== undefined) rootProps.open = open;
  if (defaultOpen !== undefined) rootProps.defaultOpen = defaultOpen;
  if (onOpenChange !== undefined) rootProps.onOpenChange = onOpenChange;

  return <PopoverPrimitive.Root {...rootProps} />;
}

export interface PopoverTriggerProps {
  children: React.ReactElement;
}

function PopoverTrigger({ children }: PopoverTriggerProps) {
  return <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>;
}

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, children, align = 'center', sideOffset = 4, ...props }, ref) => {
    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={ref}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            'z-50 w-72 rounded-[var(--radius-md,#0.375rem)] border border-[var(--color-border-default,#d1d5db)] bg-[var(--color-background-default,#ffffff)] p-4 text-[var(--color-text-primary,#111827)] shadow-md outline-none transition-all',
            className
          )}
          {...props}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    );
  }
);

PopoverContent.displayName = 'Popover.Content';

Popover.Trigger = PopoverTrigger;
Popover.Content = PopoverContent;
