# Task E.7 — Select and Combobox

**Phase:** E — Tier 2 Interactive Components  
**Blocked by:** D.5, D.6, B.4  
**Blocks:** F.2  
**Week:** 7  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

An accessible dropdown select (`Select`) and search combobox (`Combobox`) widget with inline filtering and an option count screen reader live announcement panel.

---

## 2. Architectural Decisions & Trade-offs

- **Screen Reader Live Announcements**: Combobox elements must announce the number of filtered results as users type. We render a hidden `aria-live="polite"` element that updates with the matching count (e.g. "5 options available").
- **Radix Primitive for Viewport Collision**: Toggling select options dropdowns in dense layouts can cause menus to overflow off the screen. We use the unstyled Radix Popover primitive to handle absolute positioning and screen edge collision containment.

---

## 3. Implementation Plan & Approach

### 1. Create `packages/core/src/components/Select/Select.tsx`

Create the accessible select component:

```typescript
import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '../../utils/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  disabled?: boolean;
}

export function Select({
  options,
  value: controlledValue,
  defaultValue,
  onValueChange,
  placeholder = 'Select an option...',
  label,
  id,
  disabled,
}: SelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? '');
  const value = controlledValue ?? uncontrolledValue;
  const activeOption = options.find((opt) => opt.value === value);

  const defaultId = React.useId();
  const selectId = id ?? defaultId;

  const handleSelect = (val: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(val);
    }
    onValueChange?.(val);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label htmlFor={selectId} className="text-[var(--font-size-sm)] font-[var(--font-weight-medium)] leading-[var(--line-height-tight)] text-[var(--color-text-primary)]">{label}</label>}
      <PopoverPrimitive.Root>
        <PopoverPrimitive.Trigger
          id={selectId}
          disabled={disabled}
          className="flex h-10 w-full items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-[var(--color-text-primary)]"
        >
          <span>{activeOption ? activeOption.label : placeholder}</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 opacity-50">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
          </svg>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[8rem] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-background-default)] p-1 text-[var(--color-text-primary)] shadow-[var(--shadow-md)]"
          >
            <div className="max-h-60 overflow-y-auto">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-[var(--color-background-subtle)] focus:bg-[var(--color-background-subtle)] disabled:pointer-events-none disabled:opacity-50 text-left',
                    opt.value === value && 'font-semibold bg-[var(--color-background-subtle)]'
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
```

### 2. Create `packages/core/src/components/Combobox/Combobox.tsx`

Create the filterable search widget:

```typescript
import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '../../utils/cn';

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
}

export function Combobox({
  options,
  value: controlledValue,
  defaultValue,
  onValueChange,
  placeholder = 'Select an option...',
  label,
  id,
  disabled,
}: ComboboxProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? '');
  const value = controlledValue ?? uncontrolledValue;
  const activeOption = options.find((opt) => opt.value === value);

  const [search, setSearch] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const defaultId = React.useId();
  const comboboxId = id ?? defaultId;

  const filteredOptions = React.useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
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
      {label && <label htmlFor={comboboxId} className="text-[var(--font-size-sm)] font-[var(--font-weight-medium)] leading-[var(--line-height-tight)] text-[var(--color-text-primary)]">{label}</label>}

      {/* aria-live polite region to announce filtered count */}
      <span className="sr-only" aria-live="polite">
        {open ? `${filteredOptions.length} options available.` : ''}
      </span>

      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <button
            id={comboboxId}
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="flex h-10 w-full items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-[var(--color-text-primary)]"
          >
            <span>{activeOption ? activeOption.label : placeholder}</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 opacity-50">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
            </svg>
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[8rem] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-background-default)] p-1 text-[var(--color-text-primary)] shadow-[var(--shadow-md)]"
          >
            <div className="flex items-center border-b border-[var(--color-border-default)] px-3">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-[var(--color-text-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="max-h-60 overflow-y-auto mt-1">
              {filteredOptions.length === 0 && (
                <div className="py-6 text-center text-sm text-[var(--color-text-secondary)]">No results found.</div>
              )}
              {filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-[var(--color-background-subtle)] focus:bg-[var(--color-background-subtle)] disabled:pointer-events-none disabled:opacity-50 text-left',
                    opt.value === value && 'font-semibold bg-[var(--color-background-subtle)]'
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
```

### 3. Update Barrel Exports

Export components from `packages/core/src/index.ts`:

```typescript
export { Select } from './components/Select/Select';
export type { SelectProps, SelectOption } from './components/Select/Select';
export { Combobox } from './components/Combobox/Combobox';
export type { ComboboxProps, ComboboxOption } from './components/Combobox/Combobox';
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Input lag**: Re-filtering lists of 1000+ items on every keypress causes input latency. For large datasets, render option lists inside the `VirtualList` component (Phase F).
- **Collision containment**: Radix portals append elements to `body`, ensuring that parent overflow clipping settings do not hide popover dropdown elements.

---

## 5. Definition of Done

- [ ] `Select` and `Combobox` components exist in core.
- [ ] Keyboard navigation matches WAI-ARIA combobox recommendations.
- [ ] Filter action outputs update active polite announcement regions with item counts.
- [ ] Axe-core check has 0 violations.

---

## 6. QA Test Scenarios

| Scenario                     | Command                                      | Expected Result                                                                |
| ---------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------ |
| Verify rendering output      | Mount `<Select>`                             | Trigger element renders, toggles options on click, and portals dropdown items. |
| Test Combobox Filter         | Type "ap" in input                           | Options filter down, and polite live region announces filtered options count.  |
| Verify keyboard navigability | Focus dropdown option button and press Enter | Select value updates and popover closes.                                       |

---

## 7. AI Code Loop Prompt

```
TASK: E.7 — Select and Combobox

Create packages/core/src/components/Select/Select.tsx and Combobox.tsx.
Install Radix UI popover primitive package as a dependency in core.
Implement dropdown triggers and portals content boxes.
Configure inline filtering on Combobox inputs.
Set up an aria-live="polite" screen reader node to announce filtered counts.
Assert select values, options lists, keyboard navigability, and axe WCAG compliance in Select.test.tsx and Combobox.test.tsx.
Update core index.ts to export both select and combobox configurations.
```
