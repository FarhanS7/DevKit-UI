# Task E.8 — Popover

**Phase:** E — Tier 2 Interactive Components  
**Blocked by:** D.2, C.1  
**Blocks:** Overlay dropdowns  
**Week:** 7  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

An unstyled popover component (`Popover`) that mounts contextual content wrappers dynamically beside trigger targets, with automatic Esc key and click-outside dismissal handlers.

---

## 2. Architectural Decisions & Trade-offs

- **Radix Popover Primitive Foundation**: Using the Radix popover primitive handles complex requirements natively (Esc key closures, click outside triggers, and absolute positioning updates).
- **Aria-haspopup Type**: Setting `aria-haspopup="dialog"` ensures that screen readers announce the overlay container as an interactive dialog on mount.

---

## 3. Implementation Plan & Approach

### 1. Create `packages/core/src/components/Popover/Popover.tsx`

Create the component:

```typescript
import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '../../utils/cn';

export interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Popover({ children, open, onOpenChange }: PopoverProps) {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </PopoverPrimitive.Root>
  );
}

export interface PopoverTriggerProps {
  children: React.ReactElement;
}

Popover.Trigger = function PopoverTrigger({ children }: PopoverTriggerProps) {
  return <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>;
};

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

Popover.Content = function PopoverContent({
  className,
  children,
  align = 'center',
  sideOffset = 4,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-72 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-background-default)] p-4 text-[var(--color-text-primary)] shadow-[var(--shadow-md)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
};
```

### 2. Update Barrel Exports

Export components from `packages/core/src/index.ts`:

```typescript
export { Popover } from './components/Popover/Popover';
export type {
  PopoverProps,
  PopoverTriggerProps,
  PopoverContentProps,
} from './components/Popover/Popover';
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Click-outside portal exceptions**: Because popover menus are portalled and rendered as children of `body`, standard target containment checks (like `.contains(e.target)`) might mistake popover clicks for click-outside actions. Ensure that click-outside listeners ignore clicks inside portal content boundaries.
- **Focus Restoration**: Focus must return to the trigger element when the popover is closed via keyboard or mouse.

---

## 5. Definition of Done

- [ ] `Popover` component exists.
- [ ] Export is accessible from packages root barrel.
- [ ] Component handles click-outside and Esc key dismissals correctly.
- [ ] Accessibility audits show 0 violations.

---

## 6. QA Test Scenarios

| Scenario                  | Command                                  | Expected Result                                           |
| ------------------------- | ---------------------------------------- | --------------------------------------------------------- |
| Verify rendering output   | Mount `<Popover>`                        | Renders trigger, showing portalled content menu on click. |
| Test Click-outside        | Click anywhere outside portalled content | Popover menu closes.                                      |
| Verify Escape key closure | Focus popover content and press Escape   | Popover closes and focus returns to trigger.              |

---

## 7. AI Code Loop Prompt

```
TASK: E.8 — Popover

Create packages/core/src/components/Popover/Popover.tsx.
Support Popover, Popover.Trigger, and Popover.Content compound components.
Wrap triggers and content containers using Radix UI popover primitive packages.
Configure WAI-ARIA states: role="dialog" or setting aria-haspopup="dialog" descriptors.
Assert render states, click-outside triggers, Esc key closures, and accessibility in Popover.test.tsx.
Update core index.ts to export Popover and its typings.
```
