# Task D.2 — Portal

**Phase:** D — Tier 1 Foundation Components  
**Blocked by:** C.1  
**Blocks:** E.3, E.7, E.8  
**Week:** 3  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

A server-safe portal wrapper component (`Portal`) that uses `ReactDOM.createPortal` to render child elements into alternative DOM containers (such as `document.body`) to prevent layout clipping and layering overflow issues.

---

## 2. Architectural Decisions & Trade-offs

- **SSR Hydration Guard**: In Next.js and server setups, the global `document` element is undefined on the server. If the portal attempts to access `document.body` immediately on render, it will crash the server. We wrap portal logic with a client-only state check (`mounted` boolean set in a `useEffect` loop) to ensure rendering only runs on the client.
- **Dynamic Container Insertion**: Defaulting container references to `document.body` but accepting arbitrary `HTMLElement` refs enables maximum rendering layout flexibility.

---

## 3. Implementation Plan & Approach

### 1. Create `packages/core/src/components/Portal/Portal.tsx`

Implement the component with a client rendering state check:

```typescript
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface PortalProps {
  children: React.ReactNode;
  container?: HTMLElement | null; // Defaults to document.body on mount
}

const Portal = ({ children, container }: PortalProps) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // SSR Safe: return nothing on server
  }

  const targetContainer = container ?? document.body;
  return ReactDOM.createPortal(children, targetContainer);
};

Portal.displayName = 'Portal';

export { Portal };
```

### 2. Update Barrel Exports

Export the component from `packages/core/src/index.ts`:

```typescript
export { Portal } from './components/Portal/Portal';
export type { PortalProps } from './components/Portal/Portal';
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Dynamic Cleanup**: Avoid dynamically appending custom wrapper elements to `document.body` inside the portal render loop without cleanups, as it leads to orphan node build-ups when parents toggle rendering states.
- **Event Bubbling**: Even though portals render outside the parent's DOM layout, React events still bubble up through the React tree. Keep this in mind when managing click triggers on portalled overlay dialogs.

---

## 5. Definition of Done

- [ ] `Portal` component exists in core components directory.
- [ ] Renders nothing on server-side compilation paths.
- [ ] Appends child elements to `document.body` by default on mount.
- [ ] Appends children to a custom container reference if passed.

---

## 6. QA Test Scenarios

| Scenario                  | Command                                                           | Expected Result                                                                       |
| ------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Verify rendering position | Mount portal and inspect body                                     | Target child elements render inside `document.body` instead of parent layout wrapper. |
| Test custom container     | Render portal with `container={customNode}`                       | Children render inside custom element node path.                                      |
| Verify SSR stability      | Call render under Node.js mock container lacking browser features | Renders safely returning null without throwing global errors.                         |

---

## 7. AI Code Loop Prompt

```
TASK: D.2 — Portal

Create packages/core/src/components/Portal/Portal.tsx.
Ensure it uses a mounted check state in useEffect to bypass portal rendering on the server (return null if not mounted).
Use ReactDOM.createPortal to render children to container or document.body if container is null.
Create packages/core/src/components/Portal/Portal.test.tsx using Vitest and React Testing Library to assert that child elements mount inside document.body or a passed container node.
Update packages/core/src/index.ts to re-export Portal and PortalProps.
```
