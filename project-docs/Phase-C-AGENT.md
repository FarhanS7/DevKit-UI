# Phase C Agent Instructions — Utility Layer

> **Agent:** Read `AGENT-CONTEXT.md` fully before starting this file.
> **Prerequisite:** Phase A + B commits exist. `pnpm build:tokens` produces all 3 dist files.
> **Goal:** Build the three utility foundations that every component depends on.
> **Commit target:** `feat(phase-C): Utility Layer — cn(), Polymorphic Types, Focus Helpers`

---

## PHASE OVERVIEW

**What this phase produces:**
- `cn()` — class merging utility (clsx + tailwind-merge)
- `polymorphic.ts` — TypeScript types for the `as` prop pattern
- `focus.ts` — `getFocusableElements()` for Dialog and focus trap

**Why these must exist before any component:**
- Every component calls `cn()` to merge className props
- Button, Text, Heading use the polymorphic types
- Dialog's `useFocusTrap` calls `getFocusableElements`

**Skills to read first:**
- `.agents/skills/senior-frontend/SKILL.md`

---

## TASK EXECUTION ORDER

---

### TASK C.1 — cn() Utility
**File:** `Implementation Plan/Phase C - Utility Layer/Task C.1 - cn() Utility.md`

**What to build:** `packages/core/src/utils/cn.ts`

```typescript
// packages/core/src/utils/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names with clsx (handles conditionals/arrays/objects)
 * then resolves Tailwind class conflicts deterministically with tailwind-merge.
 *
 * Example: cn('p-2', 'p-4') → 'p-4' (last wins, not both)
 * Example: cn('p-2', condition && 'p-4') → 'p-2' or 'p-4' based on condition
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

**Tests to write:**
```typescript
// cn.test.ts
import { cn } from './cn';

test('last conflicting Tailwind class wins', () => {
  expect(cn('p-2', 'p-4')).toBe('p-4');
});
test('conditional false is excluded', () => {
  expect(cn('p-2', false && 'p-4')).toBe('p-2');
});
test('undefined is ignored', () => {
  expect(cn(undefined, 'text-sm')).toBe('text-sm');
});
test('arrays are flattened', () => {
  expect(cn(['p-2', 'text-sm'])).toBe('p-2 text-sm');
});
```

**Barrel export update:**
```typescript
// packages/core/src/index.ts — add:
export { cn } from './utils/cn';
```

**Checklist:**
- [ ] `cn('p-2', 'p-4')` returns `'p-4'`
- [ ] `cn('p-2', false && 'p-4')` returns `'p-2'`
- [ ] Exported from `packages/core/src/index.ts`
- [ ] All tests pass

---

### TASK C.2 — Polymorphic Types
**File:** `Implementation Plan/Phase C - Utility Layer/Task C.2 - Polymorphic Types.md`

**What to build:** `packages/core/src/utils/polymorphic.ts`

```typescript
// packages/core/src/utils/polymorphic.ts
import * as React from 'react';

/**
 * Gets the ref type for a given React element type.
 * Preserves ref types through the polymorphic wrapper.
 */
export type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>['ref'];

/**
 * Merges component's own props with the HTML attributes of the `as` element.
 * Uses Omit to remove HTML attributes that conflict with own props.
 *
 * Usage: type ButtonProps<C extends React.ElementType = 'button'> =
 *   PolymorphicComponentProp<C, { variant?: 'primary' | 'secondary' }>
 */
export type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = {}
> = Props &
  Omit<React.ComponentPropsWithoutRef<C>, keyof Props> & {
    as?: C;
  };

/**
 * Same as PolymorphicComponentProp but includes the ref.
 * Use this for components wrapped in React.forwardRef.
 */
export type PolymorphicComponentPropWithRef<
  C extends React.ElementType,
  Props = {}
> = PolymorphicComponentProp<C, Props> & { ref?: PolymorphicRef<C> };
```

**Type tests to write (`.test-d.ts` — Vitest type testing):**
```typescript
// polymorphic.test-d.ts
import { expectTypeOf } from 'vitest';
// These tests are verified by 'pnpm typecheck' — they don't run at runtime

// Button renders as button by default — onClick is valid
expectTypeOf({ onClick: () => {} }).toMatchTypeOf<React.ComponentProps<'button'>>();

// As anchor: href becomes valid
type AnchorProps = PolymorphicComponentProp<'a', {}>;
expectTypeOf<AnchorProps['href']>().toBeString();

// As button: href is NOT valid (Omit removes it)
type ButtonProps = PolymorphicComponentProp<'button', {}>;
// @ts-expect-error href doesn't exist on button
const _: ButtonProps = { href: '/path' };
```

**Barrel export update:**
```typescript
// packages/core/src/index.ts — add:
export type { PolymorphicRef, PolymorphicComponentProp, PolymorphicComponentPropWithRef } from './utils/polymorphic';
```

**Checklist:**
- [ ] Three types are exported
- [ ] No runtime code (types only — tree-shaken away completely)
- [ ] `pnpm typecheck` passes with the type tests in place
- [ ] JSDoc comments on each type explaining when to use it

---

### TASK C.3 — Focus Utility Helpers
**File:** `Implementation Plan/Phase C - Utility Layer/Task C.3 - Focus Utility Helpers.md`

**What to build:** `packages/core/src/utils/focus.ts`

```typescript
// packages/core/src/utils/focus.ts

/**
 * Complete CSS selector for all natively focusable elements.
 * Order matters for consistency — matches DOM tab order.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  'details > summary',
].join(', ');

/**
 * Returns all focusable elements within a container, in DOM order.
 * DO NOT sort the result — DOM order IS the tab order.
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter(isElementFocusable);
}

/**
 * Returns true if an element is focusable (not hidden, not display:none)
 */
export function isElementFocusable(el: HTMLElement): boolean {
  if (el.hasAttribute('hidden')) return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none') return false;
  if (style.visibility === 'hidden') return false;
  return true;
}
```

**Tests to write:**
```typescript
// focus.test.ts — uses jsdom (Vitest default)
test('finds all focusable elements', () => {
  document.body.innerHTML = `
    <button>Click</button>
    <a href="/path">Link</a>
    <button disabled>Disabled</button>
    <input type="text" />
  `;
  const focusable = getFocusableElements(document.body);
  expect(focusable).toHaveLength(3); // Not the disabled button
});

test('excludes hidden elements', () => {
  document.body.innerHTML = `<button style="display:none">Hidden</button>`;
  expect(getFocusableElements(document.body)).toHaveLength(0);
});

test('returns elements in DOM order, not sorted', () => {
  document.body.innerHTML = `
    <button id="first">First</button>
    <button id="second">Second</button>
  `;
  const els = getFocusableElements(document.body);
  expect(els[0].id).toBe('first');
  expect(els[1].id).toBe('second');
});
```

**Checklist:**
- [ ] Disabled buttons are excluded
- [ ] `display: none` elements are excluded
- [ ] `a` without `href` is excluded
- [ ] Results are in DOM order (not sorted)
- [ ] `audio[controls]` and `video[controls]` are included in the selector

---

## PHASE C COMPLETION PROTOCOL

### Run Final Phase Check
```bash
pnpm lint               # 0 violations
pnpm typecheck          # 0 errors
pnpm test               # All pass
```

### Create Walkthroughs
After all pass, create walkthrough files in `Walkthroughs/Phase C - Utility Layer/`:
- `C.1 Walkthrough.md` — Explain why both clsx AND tailwind-merge are needed
- `C.2 Walkthrough.md` — Explain the polymorphic type system and the forwardRef cast
- `C.3 Walkthrough.md` — Explain the focusable selector and why DOM order must not be sorted

### Git Commit
```bash
git add .
git commit -m "feat(phase-C): Utility Layer — cn(), Polymorphic Types, Focus Helpers

- cn(): clsx + tailwind-merge for deterministic class conflict resolution
- polymorphic.ts: PolymorphicComponentProp/WithRef types for type-safe as-prop pattern
- focus.ts: getFocusableElements with complete ARIA-correct focusable selector
- All utilities tested with unit tests and type tests

Phase: C
Tasks: C.1, C.2, C.3
Tests: 7 unit | 0 axe
Breaking: none"

git push origin main
```

### Update Master Index
Mark all C tasks ✅ in `00-MASTER-INDEX.md`.
