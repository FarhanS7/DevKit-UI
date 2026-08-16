# Task E.2 — useScrollLock Hook

**Phase:** E — Tier 2 Interactive Components  
**Blocked by:** C.1  
**Blocks:** E.3  
**Week:** 6  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

A custom React hook that prevents background scrolling when modal components are active.

---

## 2. Architectural Decisions & Trade-offs

- **Position Fixed Strategy:** Setting `position: fixed` on the body wrapper prevents scroll shifts across desktop browsers. This is more reliable than setting `overflow: hidden`, which can fail on some mobile platforms.
- **Visual Shift Compensation:** Recording scroll offsets and applying matching padding properties prevents pages from jumping vertically when locks are applied.

---

## 3. Implementation Plan & Approach

1. Create `packages/core/src/hooks/useScrollLock.ts`.
2. Extract current scroll offsets before locking.
3. Lock body layouts and apply offset properties to retain current scroll alignments.
4. Restore original scroll settings during cleanup.

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Multiple Locks:** Ensure that opening nested modals does not overwrite original scroll position offsets.

---

## 5. Definition of Done

- [ ] `useScrollLock` hook exists.
- [ ] Activating the lock stops page scrolling.
- [ ] Cleanup restores scroll positions without layout jumps.

---

## 6. AI Code Loop Prompt

```
TASK: E.2 — useScrollLock Hook

Create packages/core/src/hooks/useScrollLock.ts. Prevent body scroll using position fixed attributes. Compensate offsets to avoid layout jumps.
```
