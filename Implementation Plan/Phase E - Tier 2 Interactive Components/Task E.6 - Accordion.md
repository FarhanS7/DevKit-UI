# Task E.6 — Accordion

**Phase:** E — Tier 2 Interactive Components  
**Blocked by:** C.1, B.4  
**Blocks:** Disclosure items  
**Week:** 7  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

An accessible accordion component (`Accordion`) using the compound component pattern. It allows users to toggle expanded and collapsed text panels safely.

---

## 2. Architectural Decisions & Trade-offs

- **Semantic Heading triggers**: WAI-ARIA states that accordion triggers must be wrapped in semantic HTML headings (e.g. `<h2>`, `<h3>`). We support configuring heading levels via props.
- **Single vs Multi Mode**: We support both `single` (only one panel can be open at a time) and `multiple` (several panels can be expanded simultaneously) mode configs.
- **Motion Reduction**: Slide transitions must respect the `prefers-reduced-motion` media queries.

---

## 3. Implementation Plan & Approach

### 1. Create `packages/core/src/components/Accordion/Accordion.tsx`

Create the compound components:

```typescript
import * as React from 'react';
import { cn } from '../../utils/cn';
import { Heading, type HeadingTag } from '../Heading/Heading';

interface AccordionContextValue {
  activeValues: string[];
  toggleItem: (value: string) => void;
  baseId: string;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion sub-components must be nested within an <Accordion> provider.');
  }
  return context;
}

export interface AccordionProps {
  children: React.ReactNode;
  type?: 'single' | 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  className?: string;
}

export function Accordion({
  children,
  type = 'single',
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  className,
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
          ? activeValues.filter((v) => v !== itemValue)
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
      <div className={cn('divide-y divide-[var(--color-border-default)] border-b border-t border-[var(--color-border-default)]', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

interface ItemContextValue {
  value: string;
  isOpen: boolean;
}

const ItemContext = React.createContext<ItemContextValue | null>(null);

Accordion.Item = function AccordionItem({ className, value, children, ...props }: AccordionItemProps) {
  const { activeValues } = useAccordionContext();
  const isOpen = activeValues.includes(value);

  return (
    <ItemContext.Provider value={{ value, isOpen }}>
      <div className={cn('flex flex-col', className)} {...props}>
        {children}
      </div>
    </ItemContext.Provider>
  );
};

function useItemContext() {
  const context = React.useContext(ItemContext);
  if (!context) {
    throw new Error('Accordion.Trigger must be nested within <Accordion.Item>');
  }
  return context;
}

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  asHeading?: HeadingTag;
}

Accordion.Trigger = function AccordionTrigger({ className, children, asHeading = 'h3', ...props }: AccordionTriggerProps) {
  const { toggleItem, baseId } = useAccordionContext();
  const { value, isOpen } = useItemContext();

  const triggerId = `${baseId}-trigger-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  return (
    <Heading as={asHeading} className="flex">
      <button
        type="button"
        role="button"
        id={triggerId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => toggleItem(value)}
        className={cn(
          'flex flex-1 items-center justify-between py-4 font-[var(--font-weight-semibold)] transition-all hover:underline [&[aria-expanded=true]>svg]:rotate-180 text-[var(--color-text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2',
          className
        )}
        {...props}
      >
        {children}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 shrink-0 transition-transform duration-200" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
    </Heading>
  );
};

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

Accordion.Content = function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  const { baseId } = useAccordionContext();
  const { value, isOpen } = useItemContext();

  const triggerId = `${baseId}-trigger-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  if (!isOpen) return null;

  return (
    <div
      role="region"
      id={panelId}
      aria-labelledby={triggerId}
      className={cn(
        'overflow-hidden text-sm transition-all duration-200 ease-out pb-4 text-[var(--color-text-secondary)] motion-reduce:transition-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
```

### 2. Update Barrel Exports

Export components from `packages/core/src/index.ts`:

```typescript
export { Accordion } from './components/Accordion/Accordion';
export type {
  AccordionProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionContentProps,
} from './components/Accordion/Accordion';
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Slide transition rules**: In CSS, animating `height` from `0` to `auto` causes layout calculations to fail. You can toggle rendering (`if (!isOpen) return null`) or animate `max-height`.
- **Keyboard navigation**: Triggers behave like standard buttons. Tab moves focus sequentially between accordion headers.

---

## 5. Definition of Done

- [ ] `Accordion` compound component is written.
- [ ] Export is accessible from packages root barrel.
- [ ] Trigger buttons are nested inside dynamic HTML headings.
- [ ] Single vs Multi expansion modes are supported and functional.
- [ ] Axe-core check has 0 violations.

---

## 6. QA Test Scenarios

| Scenario                | Command                                              | Expected Result                                                          |
| ----------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------ |
| Verify rendering output | Mount `<Accordion>`                                  | HTML renders headers containing buttons with `aria-expanded` attributes. |
| Test single mode        | Open item-1 and click item-2                         | Item-2 opens and item-1 closes automatically.                            |
| Test multiple mode      | Open item-1 and click item-2 under `type="multiple"` | Both item-1 and item-2 are expanded.                                     |

---

## 7. AI Code Loop Prompt

```
TASK: E.6 — Accordion

Create packages/core/src/components/Accordion/Accordion.tsx.
Support Accordion, Accordion.Item, Accordion.Trigger, and Accordion.Content compound components.
Manage state value list in Context, supporting single vs multiple modes.
Configure triggers to render nested inside Heading tags, supporting configurable heading tag levels.
Implement WAI-ARIA states: aria-expanded on triggers, and role="region" linked via descriptive IDs on contents.
Create Accordion.test.tsx containing mode check validations, toggling checks, heading level checks, and an accessibility scan.
Update core index.ts to export Accordion.
```
