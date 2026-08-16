# Task C.3 — Focus Utility Helpers

**Phase:** C — Utility Layer  
**Blocked by:** A.2, B.5  
**Blocks:** E.1  
**Week:** 3  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

Helper scripts to parse and list focusable elements within HTML node containers. This underpins modal and dropdown focus traps.

---

## 2. Architectural Decisions & Trade-offs

- **Custom DOM Traverser:** Parsing DOM layouts directly via CSS selectors is lighter than importing third-party focus-management packages.
- **Strict Element Visibility Check:** Filtering out computed hidden elements (`display: none` or parents with visibility properties) prevents trap loops.

---

## 3. Implementation Plan & Approach

1. Create `packages/core/src/utils/focus.ts`.
2. Define a complete search selector for all HTML elements capable of receiving tab focus.
3. Write visibility checks that recursively traverse node paths.
4. Export functions `getFocusableElements` and `isElementFocusable`.

---

## 4. Best Practices & Real-life Engineering Gotchas

- **DOM Order Resolution:** `querySelectorAll` returns items in layout order. Ensure you do not sort results, as this violates standard sequential tab rules.

---

## 5. Definition of Done

- [ ] `packages/core/src/utils/focus.ts` exists.
- [ ] Selector handles anchor tags without `href` properly (excludes them).
- [ ] Helper runs successfully on mock DOM nodes in testing files.

---

## 6. AI Code Loop Prompt

```
TASK: C.3 — Focus Utility Helpers

Implement packages/core/src/utils/focus.ts. Export getFocusableElements and isElementFocusable, checking element visibility, attributes, and typical focus selectors.
```
