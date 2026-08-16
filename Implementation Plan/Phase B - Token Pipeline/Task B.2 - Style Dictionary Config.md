# Task B.2 — Style Dictionary Config

**Phase:** B — Token Pipeline  
**Blocked by:** B.1  
**Blocks:** B.3, B.4, B.5  
**Week:** 2  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

The Style Dictionary translation pipeline to compile the source JSON schema into a browser-readable CSS file containing custom variables.

---

## 2. Architectural Decisions & Trade-offs

- **Output References Resolution:** Resolving aliases during compilation (`outputReferences: false`) generates direct hex values in the output CSS. This reduces runtime resolution complexity on some legacy mobile engines.
- **Root Selector Target:** Exposing the base values under `:root` to make them globally queryable across all HTML layouts.

---

## 3. Implementation Plan & Approach

1. Install Style Dictionary into `packages/tokens`.
2. Create `packages/tokens/sd.config.js` defining custom transform routines.
3. Configure the kebab-case transform pattern for token names (`--category-subcategory-variant`).
4. Write build commands in `package.json` to generate files in a `dist` subdirectory.

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Missing Build Paths:** Style Dictionary does not always create output subfolders automatically. Ensure the target directory is resolved or created during execution.

---

## 5. Definition of Done

- [ ] `packages/tokens/sd.config.js` builds correctly.
- [ ] Running `pnpm build:tokens` generates `packages/tokens/dist/tokens.css`.
- [ ] The generated CSS matches standard custom property naming syntax.

---

## 6. AI Code Loop Prompt

```
TASK: B.2 — Style Dictionary Config

Set up Style Dictionary in packages/tokens/sd.config.js. It must read packages/tokens/tokens.json and generate packages/tokens/dist/tokens.css, mapping token structures to standard kebab-case CSS custom properties.
```
