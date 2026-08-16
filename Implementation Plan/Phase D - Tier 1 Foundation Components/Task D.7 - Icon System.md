# Task D.7 — Icon System

**Phase:** D — Tier 1 Foundation Components  
**Blocked by:** C.1, D.1  
**Blocks:** D.8  
**Week:** 4  
**AI Skill to use:** `senior-frontend`, `vercel-react-best-practices`

---

## 1. What I'm Building

A high-performance, lazy-loaded icon component (`Icon`) that dynamically imports SVG elements only when they are rendered. It enforces compile-time accessibility assertions requiring either label descriptors or hidden settings, with zero initial bundle footprint.

---

## 2. Architectural Decisions & Trade-offs

- **React.lazy + Dynamic Import**: Rather than statically importing 1000+ icons (which bloats bundles and degrades startup times), we dynamic-import individual icon files (`lazy(() => import('./icons/ArrowRight'))`). The bundler outputs small chunk assets that are fetched on demand.
- **Strict Accessibility Discriminated Union**: If an icon is decorative, it must be marked `aria-hidden="true"`. If it acts as a standalone button or trigger, it must have `aria-label="Description"`. We use a TypeScript discriminated union to enforce this compile-time constraint, preventing unlabeled icons.

---

## 3. Implementation Plan & Approach

### 1. Configure the Icon file registry and types

Define the union of available icons and the props schema in `packages/core/src/components/Icon/Icon.tsx`:

```typescript
import * as React from 'react';

export const iconRegistry = {
  ArrowRight: React.lazy(() => import('./icons/ArrowRight')),
  Check: React.lazy(() => import('./icons/Check')),
  X: React.lazy(() => import('./icons/X')),
} as const;

export type IconName = keyof typeof iconRegistry;

export type BaseIconProps = {
  name: IconName;
  size?: number;
  className?: string;
};

// Discriminated union: must specify aria-hidden="true" OR aria-label="description"
export type IconProps = BaseIconProps & (
  | { 'aria-hidden': 'true'; 'aria-label'?: never }
  | { 'aria-label': string; 'aria-hidden'?: never }
);

const Icon = ({ name, size = 24, className, ...props }: IconProps) => {
  const LazyIcon = iconRegistry[name];

  return (
    <React.Suspense fallback={<span style={{ width: size, height: size }} className="inline-block" aria-hidden="true" />}>
      <LazyIcon
        className={className}
        style={{ width: size, height: size }}
        {...props}
      />
    </React.Suspense>
  );
};

Icon.displayName = 'Icon';

export { Icon };
```

### 2. Add sample icon templates

Create sample icon files in a subfolder (e.g. `packages/core/src/components/Icon/icons/ArrowRight.tsx`):

```typescript
import * as React from 'react';

const ArrowRight = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

export default ArrowRight;
```

_(Similarly write Check.tsx and X.tsx)_

### 3. Update Barrel Exports

Export the component from `packages/core/src/index.ts`:

```typescript
export { Icon } from './components/Icon/Icon';
export type { IconProps, IconName } from './components/Icon/Icon';
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Layout Shift Prevention**: Always set explicit dimensions (width/height matching the `size` prop) on the Suspense fallback. If the fallback has no height, the layout will collapse during network requests, causing content jumps when the SVG arrives.
- **Direct exports block dynamic paths**: Do not use dynamic string patterns like `import(\`./icons/\${name}\`)` because modern bundlers cannot tree-shake dynamic paths. The registry dictionary is required.

---

## 5. Definition of Done

- [ ] `Icon` component is written.
- [ ] TypeScript compilation fails if both `aria-label` and `aria-hidden` are missing.
- [ ] SVGs are lazy-loaded on mount (verified in test mocks).
- [ ] Suspense wrapper handles loading delay states gracefully without layout jumps.

---

## 6. QA Test Scenarios

| Scenario                   | Command                                                | Expected Result                                                         |
| -------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------- |
| Verify rendering output    | Mount `<Icon name="Check" aria-hidden="true" />`       | HTML outputs a fallback, then resolves to the check SVG node.           |
| Test Type Safety (Fail)    | Try `<Icon name="Check" />` inside code files          | TypeScript flags compile error because accessibility union is violated. |
| Test Type Safety (Success) | Try `<Icon name="Check" aria-label="Confirm check" />` | Component compiles cleanly.                                             |

---

## 7. AI Code Loop Prompt

```
TASK: D.7 — Icon System

Create packages/core/src/components/Icon/Icon.tsx and subfolder icons/ for ArrowRight, Check, and X SVG components.
Use React.lazy to dynamic-import icons, wrapping renders in a Suspense loader.
Configure a strict TypeScript discriminated union on IconProps requiring either aria-hidden="true" or aria-label="desc" but never both or neither.
Add explicit dimensions on Suspense fallbacks.
Create Icon.test.tsx and a type check test file Icon.test-d.ts to assert the accessibility union rules.
Update core index.ts to export Icon, IconProps, and IconName.
```
