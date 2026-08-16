# Task I.4 — Storybook Polish and Public Launch

**Phase:** I — Documentation & Launch  
**Blocked by:** I.3  
**Blocks:** N/A (Final Task)  
**Week:** 12  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

The production build of the Storybook documentation site, and deploying it to public static hosting platforms (Chromatic or Vercel) alongside the published npm packages.

---

## 2. Architectural Decisions & Trade-offs

- **Static Storybook builds**: Storybook generates a static build (`storybook-static/`). Deploying it to CDNs like Chromatic or Vercel provides fast page loads and global scalability.
- **Production Asset caching**: Fingerprinted filename configurations ensure browser caches are invalidated on new releases.

---

## 3. Implementation Plan & Approach

### 1. Compile Storybook

Run the production compiler script inside `apps/docs`:

```bash
pnpm --filter docs build-storybook
```

This compiles static assets into `apps/docs/storybook-static/`.

### 2. Verify local static build

Use local HTTP servers to verify the built assets render correctly:

```bash
pnpm exec http-server apps/docs/storybook-static
# Browser opens http://localhost:8080.
# Check that all components, stories, and MDX ADRs display cleanly.
```

### 3. Deploy Storybook

Configure static deployments to your target hosting platform:

- **Chromatic**: Deploys automatically on git main pushes via `release.yml`.
- **Vercel**: Link your GitHub repository to Vercel, pointing builds to `apps/docs/storybook-static` and deploying the docs site statically.

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Relative Asset Paths**: If Storybook is deployed under a subpath (e.g. `https://yourusername.github.io/ui/`), absolute imports like `/logo.png` will fail. Ensure assets use relative import paths (such as `./logo.png`) inside MDX pages.
- **Public API Keys environment check**: Ensure the Vercel hosting parameters include the `ANTHROPIC_API_KEY` environment variable so the AI tools can stream responses in the production deployment.

---

## 5. Definition of Done

- [ ] Storybook production build compiles with 0 errors or warnings.
- [ ] Static folder `apps/docs/storybook-static/` exists.
- [ ] Deployed public URL is live and accessible.
- [ ] Deployed AI tools query and stream responses cleanly.

---

## 6. QA Test Scenarios

| Scenario                   | Command                             | Expected Result                                                            |
| -------------------------- | ----------------------------------- | -------------------------------------------------------------------------- |
| Run production compilation | `pnpm build-storybook`              | Output directory `storybook-static` generates without warnings.            |
| Verify Deployed Site       | Open public deployed URL in browser | Site loads, sidebar displays all components, and navigation is functional. |
| Test Deployed AI Tools     | Run generator prompt on live URL    | AI tool communicates with Next.js endpoint and streams JSX templates.      |

---

## 7. AI Code Loop Prompt

```
TASK: I.4 — Storybook Polish and Public Launch

Run pnpm build-storybook inside apps/docs.
Assert that the static compile finishes successfully.
Verify that the output storybook-static directory contains index.html, JS, and CSS custom variables.
Verify that the deployed Storybook URL is accessible and live.
```
