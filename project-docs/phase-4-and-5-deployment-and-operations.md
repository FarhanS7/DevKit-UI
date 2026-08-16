# Phase 4 — Deployment & Release
## Project: AI-Powered Design System & Component Library

> **Purpose:** Ship the library to npm, ship the docs to a public URL, and establish the first stable version. This phase is run once for the initial v1.0.0 release, then partially re-run for each subsequent release.

---

## 4.1 — Pre-Release Checklist

Do not skip any item. Each one is here because it has caused a bad release in the past (either for this type of project or the pattern it follows).

### Package Health

- [ ] `package.json` `files` field is set correctly — only `dist/` is published, not `src/`, `node_modules/`, `.storybook/`, or test files
  ```json
  {
    "files": ["dist", "README.md", "CHANGELOG.md"],
    "main": "./dist/index.cjs",
    "module": "./dist/index.mjs",
    "types": "./dist/index.d.ts",
    "exports": {
      ".": {
        "import": "./dist/index.mjs",
        "require": "./dist/index.cjs",
        "types": "./dist/index.d.ts"
      }
    }
  }
  ```
- [ ] `peerDependencies` are correct — React and ReactDOM at `">=18.0.0"`, Radix packages at their compatible versions
- [ ] `sideEffects: false` is set — enables tree-shaking in consumers' bundlers
- [ ] Version is `1.0.0` in `package.json` (not `0.0.0` or `0.1.0-alpha`)
- [ ] LICENSE file exists (MIT) and is referenced in `package.json`

### Build Verification

- [ ] `pnpm build:tokens && pnpm build` completes without warnings
- [ ] `dist/` directory contains all expected files:
  ```
  dist/
  ├── index.mjs      (ESM — for bundlers like Vite, webpack 5)
  ├── index.cjs      (CJS — for Node.js, older bundlers)
  ├── index.d.ts     (TypeScript declarations)
  └── index.d.ts.map (source maps for declarations)
  ```
- [ ] Tree-shaking test: create a minimal consumer app that imports only `Button`. Run its bundler. Verify `Dialog`, `VirtualList`, etc. are NOT in the output bundle. (Rollup's `rollup-plugin-visualizer` can confirm this.)
- [ ] Bundle size check: `dist/index.mjs` gzipped is < 80KB

### Documentation Completeness

- [ ] README.md has: install command, import example, basic usage, peer dependencies, browser support, license badge
- [ ] All 5 ADRs are written and accessible as Storybook pages
- [ ] Every component has at least one Storybook story
- [ ] Every component story has a dark mode variant
- [ ] Story source code is visible in Storybook (enables the "show code" panel for every story)
- [ ] Storybook's `parameters.docs.description.component` is set for every component (shows in the Docs tab)

### Accessibility Gate

- [ ] `pnpm test` — all axe tests pass, zero violations
- [ ] Manual keyboard test: ran Tab-only navigation through every Tier 1 and Tier 2 component's primary story
- [ ] VoiceOver manual test: verified role and label announcement for Button, Input, Dialog, Select, Tabs

### npm Account Setup

- [ ] npm account created: `https://www.npmjs.com`
- [ ] Package name `@yourusername/ui` is available (check: `npm view @yourusername/ui`)
- [ ] npm access token created (type: Automation) and stored as `NODE_AUTH_TOKEN` in GitHub repo secrets
- [ ] Two-factor authentication enabled on npm account

---

## 4.2 — Release Procedure (v1.0.0)

This is a one-time procedure for the initial release. Future releases follow the shorter §4.4 procedure.

### Step 1: Final Branch Merge

```bash
git checkout main
git merge dev --no-ff -m "chore: merge dev into main for v1.0.0 release"
git push origin main
```

Verify CI passes on the `main` branch after the merge.

### Step 2: Create the Release Changeset

```bash
pnpm changeset
```

Select:
- Package: `@yourusername/ui`
- Bump type: `major` (1.0.0 is the first public API commitment)
- Summary: `Initial stable release of the AI-Powered Design System & Component Library v1.0.0`

This creates a `.changeset/*.md` file. Commit it:
```bash
git add .changeset/
git commit -m "chore: add changeset for v1.0.0"
git push origin main
```

### Step 3: Version Bump

```bash
pnpm changeset version
```

This:
- Bumps `packages/core/package.json` to `1.0.0`
- Bumps `packages/tokens/package.json` to `1.0.0`
- Generates `CHANGELOG.md` with the release notes
- Deletes the `.changeset/*.md` file

Commit the version bump:
```bash
git add .
git commit -m "chore: release v1.0.0"
git push origin main
```

### Step 4: Build and Publish

```bash
pnpm build:tokens
pnpm build
pnpm changeset publish
```

This publishes `@yourusername/ui@1.0.0` and `@yourusername/tokens@1.0.0` to npm.

Verify:
```bash
npm view @yourusername/ui
# Should show version: 1.0.0
```

### Step 5: GitHub Release

```bash
git tag v1.0.0
git push origin v1.0.0
```

Then on GitHub: Releases → Draft a new release → Tag `v1.0.0` → Title "v1.0.0 — Initial Release" → Copy the CHANGELOG.md entry as the body → Publish release.

### Step 6: Storybook Deployment

```bash
pnpm build:storybook
# Outputs to apps/docs/storybook-static/
```

Deploy to Chromatic (permanent public URL):
```bash
npx chromatic --project-token=$CHROMATIC_PROJECT_TOKEN --build-script-name=build:storybook
```

Chromatic provides a permanent public URL: `https://yourusername.chromatic.com`. Include this URL in the README and GitHub repo description.

**Alternative: deploy to GitHub Pages** (if Chromatic public URL is not preferred):
Add a `.github/workflows/deploy-storybook.yml` workflow that runs `pnpm build:storybook` on push to `main` and deploys `storybook-static/` to `gh-pages` branch.

---

## 4.3 — Post-Release Verification (Smoke Test the Published Package)

This is critical. Run it within 10 minutes of publishing.

```bash
# Create a temporary test directory outside the monorepo
mkdir /tmp/ui-smoke-test && cd /tmp/ui-smoke-test
npx create-vite@latest . --template react-ts
npm install @yourusername/ui
```

Create `src/App.tsx`:
```tsx
import { Button, Dialog, Input, Label } from '@yourusername/ui';
import '@yourusername/tokens/dist/tokens.css';

export function App() {
  return (
    <div>
      <Label htmlFor="test-input">Test Input</Label>
      <Input id="test-input" placeholder="Type here..." />
      <Button variant="primary">Click me</Button>
      <Dialog>
        <Dialog.Trigger>Open Dialog</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Smoke Test</Dialog.Title>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}
```

```bash
npm run dev
# Open http://localhost:5173
```

Verify:
- [ ] No import errors (TypeScript resolves all types)
- [ ] Components render with correct styling (tokens.css is applied)
- [ ] Button is clickable
- [ ] Dialog opens and closes
- [ ] No console errors

If any of these fail: investigate and publish a patch release immediately (`1.0.1`).

---

## 4.4 — Subsequent Release Procedure (Patch / Minor)

For releases after v1.0.0:

1. `pnpm changeset` — add a changeset for the change (in the PR that introduces the change, not after)
2. After the PR merges to `main`, Changesets Bot opens a "Release PR" automatically (via the GitHub Actions release workflow)
3. Review the Release PR: verify version bump is correct (patch/minor/major)
4. Merge the Release PR
5. The `release.yml` workflow runs automatically: `changeset publish` + `git tag` + GitHub Release

Subsequent releases are fully automated after the initial setup. The only manual step is reviewing the Release PR's version bump.

---

---

# Phase 5 — Post-Launch Operations
## Project: AI-Powered Design System & Component Library

> **Purpose:** After the library is published, there are ongoing maintenance tasks. For a portfolio project, these also serve as content for blog posts, case studies, and interview talking points. This phase has no end — it's the ongoing cadence.

---

## 5.1 — Issue Triage (Weekly, ~30 minutes)

Even for a portfolio project, GitHub Issues are a signal of real-world usage and real problems. Check weekly.

**Issue categories:**

| Label | Response SLA | Action |
|-------|-------------|--------|
| `bug` | 72 hours | Reproduce locally → fix → patch release |
| `accessibility` | 48 hours | Priority — an a11y bug is a blocking issue for some users |
| `enhancement` | Backlog | Evaluate against roadmap; add to Phase 1 task tree if appropriate |
| `question` | 24 hours | Answer + update documentation if the question indicates a gap |

For a portfolio project, even 3–5 GitHub issues with thoughtful responses demonstrate that you treat the library as a real product.

---

## 5.2 — Dependency Updates (Monthly)

```bash
pnpm outdated    # Lists all outdated packages
```

**Priority updates:**
1. **Security patches:** `npm audit` — fix immediately if a vulnerability is in a direct dependency
2. **Radix UI updates:** Radix frequently releases a11y fixes — stay current
3. **TypeScript updates:** Test on a branch before merging — TS version bumps can introduce new errors in strict mode
4. **React updates:** Follow React's release notes for any breaking changes to hooks or rendering behavior

**Update process:**
```bash
pnpm up --recursive @radix-ui/react-dialog  # Update one package
pnpm test                                    # Verify tests still pass
pnpm changeset                               # Add a patch changeset
```

---

## 5.3 — Documentation Improvements

After launch, the most common gap found is documentation. Track these specifically:

**Common documentation gaps in design systems:**
- Missing "why" explanations — consumers see what a prop does but not when to use it
- Missing composition examples — components shown in isolation but not composed together
- Missing migration guides — if a v1.1 changes a prop name, how do consumers update?
- Missing dark mode screenshots — Storybook shows the component but the README only shows light mode

**Documentation improvement process:**
1. Check the Storybook docs page for each component after launch
2. Read it as a first-time user who has not seen the PRD
3. List every question you have that is not answered
4. Answer those questions in the story's `parameters.docs` content

---

## 5.4 — Performance Monitoring

For a portfolio project, "performance monitoring" means tracking two things:

**Bundle size over time:**
- The GitHub Actions `bundle-analysis` job logs the bundle size on every commit
- Track this in a simple `bundle-history.csv` file committed to the repo (date, version, size in bytes)
- An unexpected jump of > 5KB warrants investigation before publishing

**Storybook build time:**
- `pnpm build:storybook` time should stay under 60 seconds
- If it grows significantly, investigate which stories or assets are causing the slowdown
- Large SVG imports in stories are a common culprit

---

## 5.5 — Roadmap: Post-v1.0.0 Enhancements

These are the deferred items from Phase -1's scope line, prioritized as a v1.1 and v2.0 roadmap:

### v1.1 (Next 4–6 weeks after launch)

| Feature | Module | Rationale |
|---------|--------|-----------|
| Variable-height VirtualList | F.1 extension | Unlocks F.3 DataGrid with dynamic row heights |
| Tooltip component | Tier 2 | Common component, deferred due to floating position complexity |
| prefers-color-scheme auto dark mode | B.3 extension | One CSS media query wrapping the existing dark override |
| Real Figma Tokens plugin integration | B.1 | Document the round-trip: Figma → tokens.json → Style Dictionary |

### v2.0 (Breaking changes, 3–6 months)

| Feature | Module | Rationale |
|---------|--------|-----------|
| DatePicker with i18n | Tier 3 | Requires scoping locale support (date-fns or Intl API) |
| Full DataGrid (sort + filter + pagination) | F.3 | Scope-limited in v1 to sort only |
| Form abstraction layer | New module | A `<Form>` component wrapping Input, Label, error message association |
| Icon set > 50 | D.7 extension | Expand the icon library based on consumer requests |

---

## 5.6 — Portfolio Presentation Guide

This library's architecture decisions should be documented in three formats for interview use:

### Format 1: GitHub README (public, always on)
- Project description, install instructions, live demo link (Chromatic URL), tech stack, key decisions (link to ADRs)
- Keep it under 200 lines — interviewers scan, not read

### Format 2: Case Study (medium-length, for portfolio site)
Structure: Problem → Constraints → Key Decisions → What I'd Do Differently → Results

Key decisions to highlight:
1. **Token architecture:** Two-tier primitive → semantic system enables dark mode without touching component code
2. **Polymorphic TypeScript:** The `as`-prop pattern with full type narrowing — demonstrate the TypeScript challenge
3. **useFocusTrap implementation:** How the hook saves and restores focus — the WCAG criterion it satisfies
4. **VirtualList binary search:** The algorithm choice and why O(n) scan was insufficient at 10k items
5. **AI tool prompt engineering:** How the system prompt embeds the component API to constrain LLM output

### Format 3: 5-Minute Technical Presentation (interviews)

Slide 1: What it is + one live demo (show the AI Component Generator generating something)
Slide 2: Architecture diagram (packages/core, packages/tokens, apps/docs)
Slide 3: The hardest thing (pick one: focus trap, polymorphic TS, or VirtualList binary search)
Slide 4: What I learned / would do differently

The "what I'd do differently" answer demonstrates engineering maturity more than the implementation itself.

---

*Phase 5 has no end date. The library is a living product for as long as it's maintained.*

---

## Full Project Phase Map (Summary)

| Phase | Name | When | Output |
|-------|------|------|--------|
| -1 | PRD Sanity Check | Before any code | Gaps document, scope decisions, risk register |
| 0 | Project Foundation | Before any code | ARCHITECTURE.md — referenced by all tasks |
| 1 | Modules & Tasks | Before any code | Task tree with dependencies and checklists |
| 1.5 | Dev Env + CI Bootstrap | After Modules A + B | Working CI, local dev verified, integration tests |
| 2 | AI Code Loop | Per task, repeating | Implemented + tested + storied component |
| 3 | Code Review | After each Phase 2 | PR with review notes, interviewer explanations |
| 4 | Deployment & Release | Once (v1.0.0), then automated | npm package, public Storybook, GitHub Release |
| 5 | Post-Launch Operations | Ongoing | Issues, dependency updates, roadmap, docs |
