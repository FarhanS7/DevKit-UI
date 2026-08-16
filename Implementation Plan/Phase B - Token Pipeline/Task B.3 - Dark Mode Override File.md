# Task B.3 — Dark Mode Override File

**Phase:** B — Token Pipeline  
**Blocked by:** B.2  
**Blocks:** B.5  
**Week:** 2  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

The dark mode override stylesheet that overrides semantic background, text, and border custom properties using a theme selection selector.

---

## 2. Architectural Decisions & Trade-offs

- **Only Semantic Overrides:** Dark mode does not affect layout sizes, margin scales, or typographic heights. Restricting overrides to visual semantics reduces output bundle size.
- **Explicit Selector Trigger:** Mapping the dark mode CSS overrides under the selector `[data-theme="dark"]` allows components to be manually toggled or set based on preferences.

---

## 3. Implementation Plan & Approach

1. Add a second output platform configuration in `sd.config.js` to compile `tokens.dark.css`.
2. Configure a filter function that excludes primitive scales and outputs only overridden variables.
3. Map colors using the design decisions outlined in `database-schema.md §4`.

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Do not overwrite primitives:** Overwriting raw base values can create cascading theme bugs if multiple themes are active simultaneously.

---

## 5. Definition of Done

- [ ] Running `pnpm build:tokens` creates `packages/tokens/dist/tokens.dark.css`.
- [ ] Only semantic custom properties appear under the `[data-theme="dark"]` selector block.

---

## 6. AI Code Loop Prompt

```
TASK: B.3 — Dark Mode Override File

Extend Style Dictionary config in packages/tokens/sd.config.js to output packages/tokens/dist/tokens.dark.css. Filter the output to map semantic color overrides to [data-theme="dark"].
```
