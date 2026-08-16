# Task G.5 — AccessibilityChecker UI

**Phase:** G — AI Developer Tools  
**Blocked by:** G.2  
**Blocks:** a11y testing workflows  
**Week:** 10  
**AI Skill to use:** `senior-frontend`, `frontend-design`

---

## 1. What I'm Building

The user interface inside Storybook that lets developers submit code descriptions or component structures to scan for accessibility issues and view suggestions.

---

## 2. Architectural Decisions & Trade-offs

- **Structured Report Parser:** Parsing output markdown tokens like `**WCAG Criterion:**` dynamically splits text blocks into distinct custom visual layouts.
- **Copy Code block utility:** Providing standard inline copy actions for the suggested code fix blocks.

---

## 3. Implementation Plan & Approach

1. Create `apps/docs/components/ai-tools/A11yChecker.tsx`.
2. Map visual input blocks to gather logs or code strings.
3. Call `/api/ai/check-accessibility` using streaming fetch rules.
4. Render output reports using layout cards.

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Loading Bounds:** Standardize layout dimensions during processing states to avoid visual shifting.

---

## 5. Definition of Done

- [ ] `A11yChecker` UI is queryable in Storybook documentation panels.
- [ ] Analysis blocks output correct WCAG classifications.
- [ ] Clean copy shortcuts extract suggested fix scripts.

---

## 6. AI Code Loop Prompt

```
TASK: G.5 — AccessibilityChecker UI

Create apps/docs/components/ai-tools/A11yChecker.tsx. Map output components to display structured report nodes for WCAG rules, issues, and code fixes.
```
