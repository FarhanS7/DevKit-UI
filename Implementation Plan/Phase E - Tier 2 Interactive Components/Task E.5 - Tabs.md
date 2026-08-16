# Task E.5 — Tabs

**Phase:** E — Tier 2 Interactive Components  
**Blocked by:** C.1, B.4  
**Blocks:** Layout wrappers  
**Week:** 7  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

An accessible tab layout component (`Tabs`) that coordinates view switches using standard keyboard overrides, implementing the compound component pattern.

---

## 2. Architectural Decisions & Trade-offs

- **WAI-ARIA Tabs Keyboard Focus Pattern**: Left and Right arrow keys move focus between tab list triggers, while the Tab key moves focus into the active tab panel. This reduces keyboard navigation friction for screen reader users.
- **Dynamic Content Activation**: We support both `automatic` (focusing a tab trigger immediately activates its panel) and `manual` (focusing a tab trigger requires pressing Enter/Space to activate the panel).

---

## 3. Implementation Plan & Approach

### 1. Create `packages/core/src/components/Tabs/Tabs.tsx`

Create the compound components:

```typescript
import * as React from 'react';
import { cn } from '../../utils/cn';

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  orientation: 'horizontal' | 'vertical';
  activationMode: 'automatic' | 'manual';
  baseId: string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs sub-components must be nested within a <Tabs> provider.');
  }
  return context;
}

export interface TabsProps {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  activationMode?: 'automatic' | 'manual';
}

export function Tabs({
  children,
  value: controlledValue,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  activationMode = 'automatic',
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? '');
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
      <div className={cn('flex', orientation === 'vertical' ? 'flex-row' : 'flex-col')}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

Tabs.List = function TabsList({ className, children, ...props }: TabsListProps) {
  const { orientation } = useTabsContext();
  const listRef = React.useRef<HTMLDivElement>(null);

  // Arrow key navigation between triggers
  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    function handleKeyDown(e: KeyboardEvent) {
      const activeElement = document.activeElement as HTMLElement;
      if (!activeElement || activeElement.getAttribute('role') !== 'tab') return;

      const tabs = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]'));
      const index = tabs.indexOf(activeElement);
      if (index === -1) return;

      let nextIndex = index;
      if (orientation === 'horizontal') {
        if (e.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
        if (e.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else {
        if (e.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
        if (e.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
      }

      if (nextIndex !== index) {
        e.preventDefault();
        const nextTab = tabs[nextIndex];
        nextTab?.focus();

        // Automatic activation mode immediately switches value
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
      ref={listRef}
      role="tablist"
      aria-orientation={orientation}
      className={cn(
        'inline-flex items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-background-subtle)] p-1 text-[var(--color-text-secondary)]',
        orientation === 'vertical' ? 'flex-col items-stretch' : 'flex-row',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

Tabs.Trigger = function TabsTrigger({ className, value, children, ...props }: TabsTriggerProps) {
  const { value: activeValue, setValue, activationMode, baseId } = useTabsContext();
  const isSelected = activeValue === value;

  const triggerId = `${baseId}-trigger-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  const handleSelect = () => {
    setValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (activationMode === 'manual' && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      handleSelect();
    }
  };

  return (
    <button
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
        'inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-md)] px-3 py-1.5 text-[var(--font-size-sm)] font-[var(--font-weight-medium)] ring-offset-[var(--color-background-default)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isSelected
          ? 'bg-[var(--color-background-default)] text-[var(--color-text-primary)] shadow-sm'
          : 'hover:text-[var(--color-text-primary)]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

Tabs.Content = function TabsContent({ className, value, children, ...props }: TabsContentProps) {
  const { value: activeValue, baseId } = useTabsContext();
  const isSelected = activeValue === value;

  const triggerId = `${baseId}-trigger-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  if (!isSelected) return null;

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={triggerId}
      tabIndex={0}
      className={cn(
        'mt-2 ring-offset-[var(--color-background-default)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2',
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
export { Tabs } from './components/Tabs/Tabs';
export type {
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
} from './components/Tabs/Tabs';
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Keyboard Focus outlines**: Use `focus-visible` to hide focus borders when clicking triggers with a mouse, displaying them only when keyboard navigation is active.
- **Auto-generated IDs**: Always generate matched IDs for `aria-labelledby` on the content panels and `aria-controls` on the trigger buttons to prevent screen reader warnings.

---

## 5. Definition of Done

- [ ] `Tabs` compound component is written.
- [ ] Export is accessible from packages root barrel.
- [ ] Arrow keys cycle focus across tab triggers correctly.
- [ ] Unselected panels return null (lazy rendering).
- [ ] Axe-core check has 0 violations.

---

## 6. QA Test Scenarios

| Scenario                | Command                                  | Expected Result                                                          |
| ----------------------- | ---------------------------------------- | ------------------------------------------------------------------------ |
| Verify rendering output | Mount `<Tabs defaultValue="t1">`         | HTML outputs list, triggers, and active panel.                           |
| Verify Arrow Navigation | Focus t1 and press ArrowRight            | Focus moves to t2 tab trigger.                                           |
| Test activation mode    | Focus t2 under `activationMode="manual"` | Focus is on t2 but panel remains t1. Press Enter -> panel changes to t2. |

---

## 7. AI Code Loop Prompt

```
TASK: E.5 — Tabs

Create packages/core/src/components/Tabs/Tabs.tsx.
Support Tabs, Tabs.List, Tabs.Trigger, and Tabs.Content compound components.
Manage state value in Context, supporting orientation (horizontal/vertical) and activationMode (automatic/manual).
Implement keyboard arrow navigation triggers within Tabs.List.
Configure WAI-ARIA states: role="tablist", role="tab", role="tabpanel", mapping tabIndex values, aria-selected, and descriptive ID links.
Create Tabs.test.tsx containing keyboard arrow check, manual vs automatic click checks, and an accessibility scan.
Update core index.ts to export Tabs.
```
