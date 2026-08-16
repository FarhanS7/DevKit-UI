# Task D.1 — VisuallyHidden

**Phase:** D — Tier 1 Foundation Components  
**Blocked by:** C.1  
**Blocks:** D.7, E.3  
**Week:** 3  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

An accessible utility component (`VisuallyHidden`) that hides DOM content from visual rendering while keeping it fully readable and queryable by screen reader user agents. This is commonly used for loading announcements, screen reader titles, and fallback buttons.

---

## 2. Architectural Decisions & Trade-offs

- **CSS Clip Strategy over Display None**: Properties like `display: none` or `visibility: hidden` remove elements from the browser accessibility tree entirely, rendering them silent. Using absolute positioning with a 1px clip boundary keeps the element navigable in screen reader virtual buffers.
- **Span wrapper default**: Defaulting to a `span` ensures the element fits cleanly inside inline text runs without breaking block layouts.

---

## 3. Implementation Plan & Approach

### 1. Create `packages/core/src/components/VisuallyHidden/VisuallyHidden.tsx`

Write the component using `React.forwardRef` and inline CSS properties matching the clip patterns:

```typescript
import * as React from 'react';
import { cn } from '../../utils/cn';

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

const VisuallyHidden = React.forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ className, style, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn('absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0', className)}
        style={{
          clip: 'rect(0, 0, 0, 0)',
          clipPath: 'inset(50%)',
          ...style,
        }}
        {...props}
      />
    );
  }
);

VisuallyHidden.displayName = 'VisuallyHidden';

export { VisuallyHidden };
```

### 2. Update Barrel Exports

Export the component from `packages/core/src/index.ts`:

```typescript
export { VisuallyHidden } from './components/VisuallyHidden/VisuallyHidden';
export type { VisuallyHiddenProps } from './components/VisuallyHidden/VisuallyHidden';
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Do not use 0px bounds**: Setting `width: 0` or `height: 0` can lead some screen reader engines (like VoiceOver) to assume the element has no content and bypass reading it. Keep the dimensions at `1px` and use visual clipping.
- **Margin clipping**: Ensure `-m-px` (margin: -1px) is used to pull the 1px square box out of normal layout flows.

---

## 5. Definition of Done

- [ ] `VisuallyHidden` component is implemented in core.
- [ ] Export is accessible from packages root barrel.
- [ ] Visual bounding box is validated at `1px` x `1px` or clipped visually.
- [ ] Axe-core check verifies zero accessibility errors.

---

## 6. QA Test Scenarios

| Scenario                | Command                                          | Expected Result                                                           |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------------------------------- |
| Verify rendering        | Mount in test and inspect DOM                    | HTML tag renders as a `<span style="clip: rect(0px, 0px, 0px, 0px)...">`. |
| Axe accessibility check | Run `pnpm test` with axe test                    | Component passes standard WCAG checks without violations.                 |
| Custom styles merging   | Pass `style={{ top: 0 }}` and `className="test"` | Styles and classes merge correctly.                                       |

---

## 7. AI Code Loop Prompt

```
TASK: D.1 — VisuallyHidden

Create packages/core/src/components/VisuallyHidden/VisuallyHidden.tsx.
Use React.forwardRef to export VisuallyHidden as a named export.
The component should render a span with inline style clip properties and tailwind classes: absolute, w-px, h-px, p-0, -m-px, overflow-hidden, whitespace-nowrap, border-0.
Create packages/core/src/components/VisuallyHidden/VisuallyHidden.test.tsx containing simple Vitest render tests and a jest-axe accessibility run.
Update packages/core/src/index.ts to re-export VisuallyHidden and VisuallyHiddenProps.
```
