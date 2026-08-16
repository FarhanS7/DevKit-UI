# Phase I Agent Instructions — Documentation & Launch

> **Agent:** Read `AGENT-CONTEXT.md` fully before starting this file.
> **Goal:** Document architecture records, audit stories for styling/accessibility compliance, and publish the final design system package.
> **Commit target:** `feat(phase-I): Documentation, Story Audit, and Public Launch`

---

## PHASE OVERVIEW

**What this phase produces:**
- Root `README.md` — Quickstart guides, local setup guidelines, installation instructions, and contribution notes.
- Architecture Decision Records (ADRs) — 5 MDX files inside Storybook detailing monorepo design, token schemas, Radix primitive decisions, polymorphic types, and streaming SSE patterns.
- Story audit — Validation checks confirming every component story has zero WCAG accessibility violations.
- Production launch build — Storybook compiled site successfully deployed to public hosting.

**Why this order matters:**
- MDX pages and story compliance audits must be validated inside Storybook before compiling and deploying the final production site.
- The README should reference verified production assets and links.

**Skills to read first:**
- `.agents/skills/senior-frontend/SKILL.md`
- `.agents/skills/frontend-design/SKILL.md`
- `.agents/skills/frontend-ui-ux-engineer/SKILL.md`

---

## DOCUMENTATION & AUDITING STANDARDS

### 1. MDX ADR Rules
ADRs must explain:
- **Context**: What problem did we face?
- **Decision**: What choice did we make?
- **Consequences**: What are the trade-offs (positive/negative)?

### 2. Story Auditing standards
Check every component story under `@storybook/addon-a11y` browser panels. The build is not ready for launch if any story displays contrast or labeling warnings.

---

## TASK EXECUTION SEQUENCE

---

### TASK I.1 — README
**File:** `Implementation Plan/Phase I - Documentation/Task I.1 - README.md`

- **Technical Spec:**
  Write the root `README.md`. It must contain pnpm installation scripts, usage quickstarts (importing css and importing Button), local dev verification commands, and AI tools instructions.
- **Verification:**
  Verify that all installation paths and command steps align with the actual project files.

---

### TASK I.2 — ADRs as MDX Pages
**File:** `Implementation Plan/Phase I - Documentation/Task I.2 - ADRs as MDX Pages.md`

- **Technical Spec:**
  Create 5 MDX ADR pages under `apps/docs/pages/adrs/`. They must cover monorepos, Radix primitives, token schemas, polymorphic types, and SSE streaming.
- **Verification:**
  Verify that the MDX pages render cleanly in Storybook and are visible in the sidebar navigation directory.

---

### TASK I.3 — Story Standards Compliance Audit
**File:** `Implementation Plan/Phase I - Documentation/Task I.3 - Story Standards Compliance Audit.md`

- **Technical Spec:**
  Audit all component stories. Every story must render cleanly in light and dark modes and have 0 violations under the storybook a11y panel.
- **Verification:**
  Open Storybook, check the a11y tab for each component, and verify 0 violations.

---

### TASK I.4 — Storybook Polish and Public Launch
**File:** `Implementation Plan/Phase I - Documentation/Task I.4 - Storybook Polish and Public Launch.md`

- **Technical Spec:**
  Compile, build, and deploy the Storybook site (`pnpm build-storybook`) to static hosting platforms (Chromatic or Vercel).
- **Verification:**
  Verify that all public URLs load quickly and that all links resolve correctly.

---

## PHASE I COMPLETION PROTOCOL

### Run Final Phase Check
```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build-storybook
# Confirm build output exists under apps/docs/storybook-static
ls apps/docs/storybook-static
```

### Create Walkthrough
Create a final walkthrough file `Walkthroughs/Phase I - Documentation/Walkthrough.md` detailing:
1. Documentation structure overview.
2. Story audit findings (any visual corrections made).
3. The deployed public hosting URL link coordinates.

### Git Commit
```bash
git add .
git commit -m "feat(phase-I): Documentation, Story Audit, and Public Launch

- Root README.md: installation, local developer setups, and usage guides
- 5 MDX Architecture Decision Records (ADRs) integrated into Storybook
- Comprehensive Storybook audit: verified a11y parameters have 0 violations
- Storybook production build compiled and deployed to public hosting
- Launch packages officially published on npm registries

Phase: I
Tasks: I.1, I.2, I.3, I.4
Tests: Story audit passed | 0 compiler warnings
Breaking: none"

git push origin dev
```

### Update Master Index
Open `00-MASTER-INDEX.md` and mark all Phase I tasks as ✅.

---

## WHAT RECRUITER SEES IN THIS COMMIT

A recruiter reviewing this commit sees:
- **"They document technical decisions"** — MDX ADRs prove clear communication and understanding of trade-offs.
- **"They audit for compliance"** — auditing Storybook stories for zero violations shows a commitment to high engineering standards.
- **"They publish packages"** — a deployed Storybook and published npm package prove launch-ready full-lifecycle execution capability.
