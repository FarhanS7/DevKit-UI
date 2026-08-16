# Task E.1 — useFocusTrap Hook

**Phase:** E — Tier 2 Interactive Components  
**Blocked by:** C.3  
**Blocks:** E.3  
**Week:** 6  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

A custom React hook (`useFocusTrap`) that traps keyboard focus inside a target HTML element container. It intercepts tab key triggers to contain focus within modal windows, popups, and dropdown menus.

---

## 2. Architectural Decisions & Trade-offs

- **Active State Toggle binding**: Event listeners only bind when an active parameter is set. This avoids performance overhead when overlays are closed or hidden.
- **Previous Focus Restoration**: The hook records the active element (`document.activeElement`) before trapping focus. On cleanup, it programmatically restores focus to that element, keeping keyboard navigation flows continuous.

---

## 3. Implementation Plan & Approach

### 1. Create `packages/core/src/hooks/useFocusTrap.ts`

Implement the custom hook:

```typescript
import * as React from 'react';
import { getFocusableElements } from '../utils/focus';

export function useFocusTrap(ref: React.RefObject<HTMLElement>, isActive: boolean) {
  React.useEffect(() => {
    if (!isActive || !ref.current) return;

    const container = ref.current;

    // Save previously focused element to restore on cleanup
    const previouslyFocused = document.activeElement as HTMLElement;

    // Find all focusable elements and focus the first one
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      const elements = getFocusableElements(container);
      if (elements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];

      if (e.shiftKey) {
        // Shift+Tab backward: wrap from first to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab forward: wrap from last to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      // Restore focus to the trigger
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [isActive, ref]);
}
```

### 2. Update Barrel Exports

Export the hook from `packages/core/src/index.ts`:

```typescript
export { useFocusTrap } from './hooks/useFocusTrap';
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Dynamic DOM mutations**: The list of focusable elements must be recalculated inside the `keydown` event listener, not just once on mount. If child elements dynamically appear or hide, a cached array will trap focus on stale nodes.
- **Empty container protection**: If the container has zero focusable elements, intercept the tab event (`e.preventDefault()`) so focus doesn't leak to browser bars.

---

## 5. Definition of Done

- [ ] `useFocusTrap` hook is implemented.
- [ ] Hook is exported from the packages index.
- [ ] Focus wraps correctly inside target containers on Tab/Shift+Tab keys.
- [ ] Focus is restored to the triggering element on unmount.

---

## 6. QA Test Scenarios

| Scenario                | Command                           | Expected Result                                      |
| ----------------------- | --------------------------------- | ---------------------------------------------------- |
| Verify focus trap setup | Mount container and trigger hook  | Focus moves to the first focusable child node.       |
| Test forward wrapping   | Tab from the last focusable child | Focus wraps and activates the first focusable child. |
| Test backward wrapping  | Shift+Tab from the first child    | Focus wraps and activates the last focusable child.  |
| Test hook cleanup       | Unmount the container             | Focus returns to the original triggering button.     |

---

## 7. AI Code Loop Prompt

```
TASK: E.1 — useFocusTrap Hook

Create packages/core/src/hooks/useFocusTrap.ts.
Configure it to query active focusable elements using getFocusableElements() on keydown.
Intercept Tab keys to wrap focus, supporting Shift+Tab.
Store and restore document.activeElement on hook mount and unmount.
Create packages/core/src/hooks/useFocusTrap.test.tsx containing keyboard tab wraps, empty child protections, and cleanup validations.
Update core index.ts to export useFocusTrap.
```
