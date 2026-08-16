# Task F.2 — CommandPalette

**Phase:** F — Tier 3 DSA Components  
**Blocked by:** E.7, F.1  
**Blocks:** Search overlays  
**Week:** 8  
**AI Skill to use:** `senior-frontend`, `system-design`

---

## 1. What I'm Building

An accessible command palette dialog (`CommandPalette`) supporting trigram-based fuzzy search. It filters results using Sørensen-Dice coefficients and uses WAI-ARIA `aria-activedescendant` attributes to manage focus.

---

## 2. Architectural Decisions, DSA & Trade-offs

- **Sørensen-Dice Trigram Similarity (O(n log n) per query)**: Simple substring matches miss minor typos and abbreviations. We break strings into overlapping 3-character slices (trigrams) and compute similarity scores. Items scoring below `0.2` are discarded, and the rest are sorted in descending order.
- **WAI-ARIA Activedescendant Bindings**: To keep the screen reader active during typing, focus remains on the search text input. We update the input's `aria-activedescendant` attribute to point to the ID of the highlighted list item, ensuring screen readers announce focus shifts.

---

## 3. Implementation Plan & Approach

### 1. Create Trigram scoring utility `packages/core/src/utils/trigram.ts`

Write the fuzzy matching algorithm:

```typescript
function buildTrigrams(str: string): Set<string> {
  const normalized = `  ${str.toLowerCase().trim()}  `;
  const trigrams = new Set<string>();
  for (let i = 0; i < normalized.length - 2; i++) {
    trigrams.add(normalized.slice(i, i + 3));
  }
  return trigrams;
}

export function trigramSimilarity(query: string, target: string): number {
  if (!query || !target) return 0;
  const trigramsQuery = buildTrigrams(query);
  const trigramsTarget = buildTrigrams(target);

  let intersection = 0;
  for (const tri of trigramsQuery) {
    if (trigramsTarget.has(tri)) {
      intersection++;
    }
  }

  return (2 * intersection) / (trigramsQuery.size + trigramsTarget.size);
}
```

### 2. Create `packages/core/src/components/CommandPalette/CommandPalette.tsx`

Create the components:

```typescript
import * as React from 'react';
import { Dialog } from '../Dialog/Dialog';
import { VirtualList } from '../VirtualList/VirtualList';
import { trigramSimilarity } from '../../utils/trigram';
import { cn } from '../../utils/cn';

export interface CommandItem {
  value: string;
  label: string;
  category?: string;
  onSelect?: (value: string) => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandItem[];
  placeholder?: string;
}

export function CommandPalette({
  open,
  onOpenChange,
  items,
  placeholder = 'Type a command or search...',
}: CommandPaletteProps) {
  const [search, setSearch] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const baseId = React.useId();

  // 1. Run trigram similarity scoring: O(n log n)
  const filteredItems = React.useMemo(() => {
    if (!search) return items;
    return items
      .map((item) => ({
        item,
        score: trigramSimilarity(search, item.label),
      }))
      .filter((res) => res.score > 0.2)
      .sort((a, b) => b.score - a.score)
      .map((res) => res.item);
  }, [items, search]);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  // 2. Keyboard event handlers
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const activeOption = filteredItems[activeIndex];
      if (activeOption) {
        activeOption.onSelect?.(activeOption.value);
        onOpenChange(false);
      }
    }
  };

  const activeOptionId = filteredItems[activeIndex]
    ? `${baseId}-option-${filteredItems[activeIndex].value}`
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="overflow-hidden p-0 max-w-2xl">
        <div className="flex items-center border-b border-[var(--color-border-default)] px-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 opacity-50 text-[var(--color-text-primary)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls={`${baseId}-listbox`}
            aria-activedescendant={activeOptionId}
            placeholder={placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex h-12 w-full rounded-md bg-transparent py-3 pl-2 text-sm outline-none placeholder:text-[var(--color-text-secondary)] text-[var(--color-text-primary)]"
          />
        </div>

        <div id={`${baseId}-listbox`} role="listbox" className="p-2">
          {filteredItems.length === 0 && (
            <div className="py-6 text-center text-sm text-[var(--color-text-secondary)]">
              No results found.
            </div>
          )}
          {filteredItems.length > 0 && (
            <VirtualList
              items={filteredItems}
              itemHeight={44}
              containerHeight={300}
              renderItem={(item, index) => {
                const isHighlighted = index === activeIndex;
                return (
                  <div
                    id={`${baseId}-option-${item.value}`}
                    role="option"
                    aria-selected={isHighlighted}
                    onClick={() => {
                      item.onSelect?.(item.value);
                      onOpenChange(false);
                    }}
                    className={cn(
                      'flex h-11 cursor-default select-none items-center rounded-sm px-3 text-sm outline-none hover:bg-[var(--color-background-subtle)] transition-colors',
                      isHighlighted && 'bg-[var(--color-background-subtle)] font-semibold'
                    )}
                  >
                    <span>{item.label}</span>
                  </div>
                );
              }}
            />
          )}
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
```

### 3. Update Barrel Exports

Export components from `packages/core/src/index.ts`:

```typescript
export { CommandPalette } from './components/CommandPalette/CommandPalette';
export type { CommandPaletteProps, CommandItem } from './components/CommandPalette/CommandPalette';
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Input Focus retention**: Keyboard events must be handled inside the text input to prevent focus from escaping to other page elements.
- **Trigram thresholds**: Using `0.2` as a similarity threshold is a standard balance. A higher threshold hides slight typos, while a lower threshold pollutes results with irrelevant items.

---

## 5. Definition of Done

- [ ] `CommandPalette` component is written in core.
- [ ] Trigram fuzzy search scoring is verified via unit tests.
- [ ] Keyboard navigation updates `aria-activedescendant` pointers correctly.
- [ ] Integrates `VirtualList` for rendering when results exceed 50 items.
- [ ] Axe-core check has 0 violations.

---

## 6. QA Test Scenarios

| Scenario                | Command                         | Expected Result                                                                  |
| ----------------------- | ------------------------------- | -------------------------------------------------------------------------------- |
| Verify rendering output | Toggle palette open             | Input focused, listing all command elements.                                     |
| Test Typo tolerance     | Type "butn" into search         | "Button" option is matched and sorted to the top.                                |
| Test Arrow selection    | Focus input and press ArrowDown | Active selection moves down, updating the input's `aria-activedescendant` value. |

---

## 7. AI Code Loop Prompt

```
TASK: F.2 — CommandPalette

Create packages/core/src/utils/trigram.ts containing Sørensen-Dice trigram similarity calculations.
Create packages/core/src/components/CommandPalette/CommandPalette.tsx.
Integrate dialog and VirtualList components.
Implement trigram scoring queries to filter and sort option results.
Set up combobox and listbox role patterns, using aria-activedescendant to track focus on Arrow keys.
Verify fuzzy search calculations, arrow key selections, active descendants, and axe WCAG compliance in CommandPalette.test.tsx.
Update core index.ts to export CommandPalette.
```
