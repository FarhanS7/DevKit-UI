# Task B.5 — Storybook Global CSS + Toggle

**Phase:** B — Token Pipeline  
**Blocked by:** A.3, B.3, B.4  
**Blocks:** C.1  
**Week:** 2  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

The integration of compiled CSS variable files into the Storybook configuration, alongside a global theme toggle switch inside the Storybook toolbar.

---

## 2. Architectural Decisions & Trade-offs

- **Global Theme Selector Decorator:** Renders a wrapper that sets the `data-theme` attribute dynamically on the root HTML element inside Storybook previews. This isolates preview component styling without affecting the Storybook chrome.
- **Vite Path Aliasing:** Mapping token paths within the Storybook configuration to allow importing directly from `@yourusername/tokens` instead of relative file system paths.

---

## 3. Implementation Plan & Approach

1. Import token stylesheets (`tokens.css` and `tokens.dark.css`) inside `apps/docs/.storybook/preview.ts`.
2. Configure a `globalTypes` toolbar button to toggle between Light and Dark values.
3. Apply a custom story decorator function to inject active states.

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Hydration Syncing:** Ensure the preview template sets attributes on `document.documentElement` rather than the body wrapper so that elements inside portals receive correct theme properties.

---

## 5. Definition of Done

- [ ] Storybook toolbar shows the theme toggle selector.
- [ ] Toggling options changes background colors in the component sandbox window.
- [ ] Console contains no errors related to missing CSS references.

---

## 6. AI Code Loop Prompt

```
TASK: B.5 — Storybook Global CSS + Toggle

Configure apps/docs/.storybook/preview.ts to load tokens.css and tokens.dark.css. Add globalTypes metadata for a theme toggle with light and dark values, and apply a decorator to append [data-theme] updates.
```
