# Task C.1 — cn() Utility

**Phase:** C — Utility Layer  
**Blocked by:** A.2, B.5  
**Blocks:** D.1–D.8, E.1–E.8  
**Week:** 3  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

The standard CSS class-merging utility function combining `clsx` and `tailwind-merge` to resolve layout conflicts deterministically.

---

## 2. Architectural Decisions & Trade-offs

- **Class-Conflict Resolution:** Using `twMerge` avoids layout bugs when consumers supply class overrides (e.g., `className="px-8"` overrides the internal `px-4`).
- **Dynamic Condition Support:** Using `clsx` permits syntax such as `condition && "active"` directly within variable expressions.

---

## 3. Implementation Plan & Approach

1. Install `clsx` and `tailwind-merge` dependencies in `packages/core`.
2. Implement the utility function `cn` under `packages/core/src/utils/cn.ts`.
3. Export the utility from the main index barrel.

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Execution Order:** Ensure `clsx` runs BEFORE `twMerge`. Running them in the reverse order will bypass conflict checking.

---

## 5. Definition of Done

- [ ] `packages/core/src/utils/cn.ts` exists.
- [ ] `cn("px-4", "px-8")` evaluates to `"px-8"`.
- [ ] Export is verified in build outputs.

---

## 6. AI Code Loop Prompt

```
TASK: C.1 — cn() Utility

Implement packages/core/src/utils/cn.ts. The function cn should accept ClassValue inputs, execute clsx, and resolve tailwind class conflicts using twMerge.
```
