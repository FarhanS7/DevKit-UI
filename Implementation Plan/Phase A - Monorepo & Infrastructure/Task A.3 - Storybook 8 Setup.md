# Task A.3 — Storybook 8 Setup (apps/docs)

**Phase:** A — Monorepo & Infrastructure  
**Blocked by:** A.1  
**Blocks:** B.5, G.1, I.1, I.2  
**Week:** 1 (parallel with A.2 and A.4)  
**AI Skill to use:** `senior-frontend`, `frontend-design`

---

## 1. What I'm Building

Storybook 8 inside `apps/docs`. This becomes the live documentation site, the visual regression test target, and the host for the AI developer tools.

After this task:

- `pnpm dev` from repo root starts Storybook at `localhost:6006`
- `@storybook/addon-a11y` tab is visible (in-browser axe auditing per story)
- `@storybook/addon-interactions` is available (for play function tests)
- The Storybook Vite builder is used (not webpack)
- A placeholder story renders without console errors

---

## 2. Architectural Decisions

### Why Storybook Lives in `apps/docs`, Not `packages/core`

Storybook is a **documentation tool**, not a library concern. If it lived in `packages/core`, its devDependencies (dozens of Storybook packages) would pollute the library package. Keeping it in `apps/docs` separates concerns:

- `packages/core`: only what consumers need
- `apps/docs`: development tooling, stories, docs, AI tools

### Storybook 8 + Vite Builder (Not Webpack)

```javascript
// apps/docs/.storybook/main.ts
export default {
  framework: '@storybook/react-vite', // Vite builder — NOT react-webpack5
  stories: ['../stories/**/*.stories.{ts,tsx}'],
  addons: [
    '@storybook/addon-essentials', // Controls, Actions, Docs, Viewport, Backgrounds
    '@storybook/addon-a11y', // axe-core per story (accessibility panel)
    '@storybook/addon-interactions', // play() function support
  ],
};
```

Why Vite builder: consistent with the library's own build tooling. Webpack would be a second bundler in the project with its own config, loader ecosystem, and slower HMR. Vite gives sub-second story reloads.

### The `preview.ts` File

```typescript
// apps/docs/.storybook/preview.ts
import type { Preview } from '@storybook/react';
// Token CSS is imported here — this is where the design system comes alive in Storybook
// These imports will be added in B.5 — placeholder comments until then:
// import '@yourusername/tokens/dist/tokens.css';
// import '@yourusername/tokens/dist/tokens.dark.css';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
    a11y: {
      // Config for @storybook/addon-a11y — axe-core options
      config: {},
      options: {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      },
    },
  },
  // Dark mode toggle will be added in B.5
};

export default preview;
```

### ThemeBuilder SSE Stub (for G.6)

Per the original planning docs, a stub channel listener for the ThemeBuilder live preview should be wired now:

```typescript
// apps/docs/.storybook/preview.ts — add this after token imports in B.5
// Stub for ThemeBuilder live CSS var injection (wired fully in G.6)
if (typeof window !== 'undefined') {
  window.__STORYBOOK_THEME_CHANNEL__ = {
    applyTokenOverrides: (tokens: Record<string, string>) => {
      for (const [key, value] of Object.entries(tokens)) {
        document.documentElement.style.setProperty(key, value);
      }
    },
  };
}
```

This stub is harmless until G.6 uses it. Adding it now means G.6 doesn't need to touch the Storybook config.

---

## 3. System Design Notes

Storybook is a dev/docs tool — no production system design impact. The Chromatic CI integration (H.2) deploys the Storybook build to Chromatic's hosting.

---

## 4. DSA Notes

Not applicable.

---

## 5. Token/Database Notes

Token CSS will be imported in `preview.ts` after B.5. At this stage, a placeholder comment documents where the import will go. Components render unstyled until B.5 is complete — this is expected and acceptable.

---

## 6. Best Practices

- **Install `@storybook/addon-a11y` from Day 1.** Not after components are built. If you add it later, you'll have to fix accumulated violations. Zero violations from the first story is the goal.
- **The Storybook Vite builder does not need `vite.config.ts` in `apps/docs`.** Storybook reads its own Vite config from `.storybook/main.ts`. If a `vite.config.ts` exists alongside it, there may be conflicts. Keep `vite.config.ts` out of `apps/docs` unless you have a specific need.
- **`stories` glob pattern:** `'../stories/**/*.stories.{ts,tsx}'` — the `..` is relative to `.storybook/`. Stories live in `apps/docs/stories/`, one directory up from `.storybook/`.

---

## 7. Real-Life Engineering Gotchas

1. **Storybook 8 changed the config format.** Older tutorials use `.storybook/main.js` with CommonJS (`module.exports = ...`). Storybook 8 uses ES modules (`export default ...`). Use TypeScript: `.storybook/main.ts` and `.storybook/preview.ts`.

2. **`@storybook/react-vite` vs `@storybook/react-webpack5`.** Many auto-generated Storybook configs default to webpack. Verify the framework is `@storybook/react-vite` in `main.ts`. A webpack config will be slow and potentially conflict with the project's Vite setup.

3. **Port conflicts.** Storybook defaults to port 6006. If something else runs on 6006, Storybook will fail to start. Add `--port 6006` explicitly to the dev script so the port is never ambiguous.

4. **TypeScript path aliases in Storybook.** Storybook's Vite builder reads the `tsconfig.json` path aliases automatically. But verify that `@yourusername/ui` resolves to the local `packages/core/src/index.ts` inside stories. If not, add an explicit Vite alias in `.storybook/main.ts`:
   ```typescript
   viteFinal: config => ({
     ...config,
     resolve: { alias: { '@yourusername/ui': '/packages/core/src' } },
   });
   ```

---

## 8. Code Review Checklist

- [ ] `pnpm dev` starts Storybook without errors
- [ ] Browser opens to `localhost:6006` — no console errors
- [ ] `@storybook/addon-a11y` tab visible in the story panel
- [ ] Framework in `main.ts` is `@storybook/react-vite` (not webpack)
- [ ] `preview.ts` is TypeScript (`.ts` extension, not `.js`)
- [ ] Placeholder story renders (any story — even the Storybook default "Introduction" page)
- [ ] ThemeBuilder stub channel is registered in `preview.ts` (as a comment or stub function)

---

## 9. QA Test Scenarios

| Scenario                     | Expected                                                       |
| ---------------------------- | -------------------------------------------------------------- |
| `pnpm dev` from repo root    | Storybook starts at localhost:6006                             |
| No console errors in browser | Zero errors in DevTools console                                |
| `@storybook/addon-a11y` tab  | Visible in story panel on the right                            |
| Story renders                | Any placeholder story displays                                 |
| Dark mode toggle             | Not yet functional (will be in B.5) — button may not exist yet |

---

## 10. AI Code Loop Prompt

```
TASK: A.3 — Storybook 8 setup (apps/docs)

Context:
- Storybook 8 in apps/docs (NOT in packages/core)
- React Vite framework: @storybook/react-vite (NOT webpack)
- TypeScript config files (.ts extension, ES module syntax)
- apps/docs has its own package.json

Required addons:
1. @storybook/addon-essentials
2. @storybook/addon-a11y (axe-core per story)
3. @storybook/addon-interactions (play function support)

Rules:
1. Framework MUST be @storybook/react-vite
2. main.ts and preview.ts must be TypeScript
3. Stories glob: ../stories/**/*.stories.{ts,tsx}
4. preview.ts must have placeholder comments for token CSS imports (will be added in B.5)
5. Add window.__STORYBOOK_THEME_CHANNEL__ stub in preview.ts for G.6
6. a11y addon config: run wcag2a, wcag2aa, wcag21a, wcag21aa tags

Output:
- apps/docs/.storybook/main.ts
- apps/docs/.storybook/preview.ts
- apps/docs/package.json (with Storybook 8 dev dependencies)
- A placeholder story at apps/docs/stories/Introduction.stories.tsx
```
