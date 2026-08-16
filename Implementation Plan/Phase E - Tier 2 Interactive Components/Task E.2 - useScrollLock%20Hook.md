# Task E.2 — useScrollLock Hook

**Phase:** E — Tier 2 Interactive Components  
**Blocked by:** C.1  
**Blocks:** E.3  
**Week:** 6  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

A custom React hook (`useScrollLock`) that prevents background page scrolling when modal dialogs, drawer menus, and popups are active, avoiding layout shifts.

---

## 2. Architectural Decisions & Trade-offs

- **Position Fixed Strategy**: Setting `overflow: hidden` on the body works on desktop, but fails on iOS Safari due to mobile scroll bouncing. Setting `position: fixed` and `width: 100%` on the body provides a bulletproof scroll lock across desktop and mobile platforms.
- **Scrollbar Shift Compensation**: Removing scrollbars causes pages to jump horizontally (layout shift) by the scrollbar's width. We compute the scrollbar width and apply it as padding-right on the body, keeping page positions stable.

---

## 3. Implementation Plan & Approach

### 1. Create `packages/core/src/hooks/useScrollLock.ts`

Implement the custom hook:

```typescript
import * as React from 'react';

export function useScrollLock(lock: boolean) {
  React.useEffect(() => {
    if (!lock) return;

    // 1. Record original styles
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    const originalPaddingRight = document.body.style.paddingRight;

    // 2. Compute scrollbar width to prevent horizontal layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const scrollY = window.scrollY;

    // 3. Apply scroll lock styles
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      // 4. Restore original styles
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      document.body.style.paddingRight = originalPaddingRight;

      // 5. Restore original scroll position
      window.scrollTo(0, scrollY);
    };
  }, [lock]);
}
```

### 2. Update Barrel Exports

Export the hook from `packages/core/src/index.ts`:

```typescript
export { useScrollLock } from './hooks/useScrollLock';
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Nested Scroll Locks**: If multiple modals open, cleanups must not run until the last lock releases. For a v1 implementation, we assume basic single-lock controls.
- **Jumping viewport**: Ensure `window.scrollTo(0, scrollY)` is called during cleanup to restore the scroll position without user-perceptible flickering.

---

## 5. Definition of Done

- [ ] `useScrollLock` hook is written.
- [ ] Export is accessible from packages root barrel.
- [ ] Activating the lock sets the body to `fixed` and locks scroll.
- [ ] Deactivating the lock restores scroll and style parameters without page jumps.

---

## 6. QA Test Scenarios

| Scenario             | Command                                  | Expected Result                                                        |
| -------------------- | ---------------------------------------- | ---------------------------------------------------------------------- |
| Verify lock layout   | Trigger lock on scrolling page           | Document body styles update to fixed, page position remains identical. |
| Verify layout shifts | Inspect body padding when lock is active | `padding-right` matches the system's scrollbar width.                  |
| Verify lock release  | Deactivate lock                          | Page scroll position returns to original values.                       |

---

## 7. AI Code Loop Prompt

```
TASK: E.2 — useScrollLock Hook

Create packages/core/src/hooks/useScrollLock.ts.
Set up body locking using position fixed, width 100%, and overflow hidden.
Compute viewport scrollbar widths and apply as padding offsets on the body.
Store and restore body layout styles on hook lifecycle triggers.
Create packages/core/src/hooks/useScrollLock.test.tsx using Vitest mock body updates to assert scroll locks.
Update core index.ts to export useScrollLock.
```
