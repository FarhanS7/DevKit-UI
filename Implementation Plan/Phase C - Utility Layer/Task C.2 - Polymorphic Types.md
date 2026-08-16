# Task C.2 — Polymorphic Types

**Phase:** C — Utility Layer  
**Blocked by:** A.2, B.5  
**Blocks:** D.3, D.5  
**Week:** 3  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

The generic TypeScript typing definitions that allow components (e.g. Button) to dynamically render as alternate HTML elements (such as `a` or `span`) while keeping element-specific type constraints.

---

## 2. Architectural Decisions & Trade-offs

- **Explicit ForwardRef Generic Casting:** Standard React typings do not infer generic elements through `forwardRef`. We use explicit casting to generic Component definitions to preserve type checking.
- **Strict Omit Merging:** Overwriting standard element attributes (like `size` on inputs vs `size` on buttons) using `Omit` avoids type collisions.

---

## 3. Implementation Plan & Approach

1. Create `packages/core/src/utils/polymorphic.ts`.
2. Define types: `PolymorphicRef`, `PolymorphicComponentProp`, and `PolymorphicComponentPropWithRef`.
3. Add helper comments explaining type usage for downstream tasks.

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Hydration Warning:** Make sure polymorphic components do not mismatch rendered elements during dynamic layout shifts.

---

## 5. Definition of Done

- [ ] `polymorphic.ts` compiles in TypeScript with strict settings.
- [ ] No runtime code exports are created.
- [ ] Type check scripts validate that illegal props (e.g., `href` on a standard button element) are flagged as compiler errors.

---

## 6. AI Code Loop Prompt

```
TASK: C.2 — Polymorphic Types

Create packages/core/src/utils/polymorphic.ts. Export type definitions PolymorphicRef, PolymorphicComponentProp, and PolymorphicComponentPropWithRef. Ensure types support ref-forwarding and generic tag overrides.
```
