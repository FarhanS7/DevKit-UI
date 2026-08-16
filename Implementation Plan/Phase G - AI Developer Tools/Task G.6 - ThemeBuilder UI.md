# Task G.6 — ThemeBuilder UI

**Phase:** G — AI Developer Tools  
**Blocked by:** G.3, B.5  
**Blocks:** Theming tools  
**Week:** 10  
**AI Skill to use:** `senior-frontend`, `frontend-design`, `frontend-ui-ux-engineer`

---

## 1. What I'm Building

The user interface inside Storybook that lets developers request themes, view color combinations, check text contrast, and apply visual shifts across Storybook in real time.

---

## 2. Architectural Decisions & Trade-offs

- **Dynamic CSS Injection:** Calling `document.documentElement.style.setProperty` dynamically applies themes by overriding custom properties.
- **Client-Side Contrast Validation:** Computing color contrast ratios (WCAG 4.5:1) in the browser flags invalid combinations before they are applied.

---

## 3. Implementation Plan & Approach

1. Create `apps/docs/components/ai-tools/ThemeBuilder.tsx`.
2. Construct preview panels displaying generated palettes.
3. Apply math checks to verify contrast ratios on background/text pairs.
4. Bind event triggers to update global styles inside Storybook previews.

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Reset Trigger:** Always provide a clear visual mechanism to reset variables to their default light/dark states.

---

## 5. Definition of Done

- [ ] `ThemeBuilder` UI renders in Storybook.
- [ ] Submitting prompts applies overrides across Storybook in real time.
- [ ] Contrast checks validate combinations and highlight warnings for invalid pairs.

---

## 6. AI Code Loop Prompt

```
TASK: G.6 — ThemeBuilder UI

Create apps/docs/components/ai-tools/ThemeBuilder.tsx. Implement contrast validation formulas. Integrate preview event triggers to update document CSS variables dynamically.
```
