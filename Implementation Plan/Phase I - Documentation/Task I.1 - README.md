# Task I.1 — README

**Phase:** I — Documentation & Launch  
**Blocked by:** H.5  
**Blocks:** I.2  
**Week:** 11  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

The root `README.md` file for the repository. It provides clear quickstart guides, installation commands, local developer setups, and CSS import instructions.

---

## 2. Architectural Decisions & Trade-offs

- **Clear CSS import guidelines**: Developers installing component libraries often forget to import the required visual stylesheets. The README must prominently explain the import paths for the CSS custom properties files.
- **Explain Tailwind PostCSS dependencies**: Because our components use Tailwind utility classes, consumers need to configure PostCSS to resolve styles correctly. We document these requirements clearly.

---

## 3. Implementation Plan & Approach

Create `README.md` in the repository root. Structure it with the following sections:

1. **Title & Badges**: NPM version, bundle size, and build status.
2. **Introduction**: A short description of `@yourusername/ui` and its features.
3. **Installation**:
   ```bash
   pnpm add @yourusername/ui @yourusername/tokens
   ```
4. **CSS Imports**: Instruct consumers to import the stylesheet in their main entry file (e.g. `index.tsx`):
   ```typescript
   import '@yourusername/tokens/dist/tokens.css';
   import '@yourusername/tokens/dist/tokens.dark.css'; // Optional for dark mode
   ```
5. **Tailwind Config integration**: Show the config setup required to process visual variables:
   ```javascript
   // tailwind.config.js
   module.exports = {
     content: ['./node_modules/@yourusername/ui/dist/**/*.mjs', './src/**/*.{ts,tsx}'],
     theme: {
       extend: {},
     },
     plugins: [],
   };
   ```
6. **Quickstart usage**: Show a clean component rendering example (e.g. `<Button onClick={...}>Click</Button>`).
7. **Local Contribution workflow**: Detail command scripts (`pnpm install`, `pnpm build:tokens`, `pnpm --filter docs dev`).

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Tailwind content paths**: If consumers forget to add `"./node_modules/@yourusername/ui/dist/**/*.mjs"` to their `tailwind.config.js` content array, Tailwind will not compile our library's component classes, causing styles to break. Highlight this rule.
- **Peer dependencies warning**: Remind consumers that React, ReactDOM, and Radix packages must be installed separately.

---

## 5. Definition of Done

- [ ] Root `README.md` is written.
- [ ] Contains clear installation commands, CSS import guides, and usage examples.
- [ ] Deployed Storybook URLs are documented.

---

## 6. QA Test Scenarios

| Scenario                  | Command                      | Expected Result                                                       |
| ------------------------- | ---------------------------- | --------------------------------------------------------------------- |
| Verify README readability | Open README in editor        | All markdown headings, code highlights, and tables display correctly. |
| Test quickstart accuracy  | Copy and run quickstart code | The code compiles cleanly in a mock consumer application.             |

---

## 7. AI Code Loop Prompt

```
TASK: I.1 — README

Create a comprehensive README.md in the root directory.
Include NPM badges, library descriptions, installation steps, CSS import requirements, tailwind.config.js configurations, and usage quickstarts.
Document local contributor build workflows.
```
