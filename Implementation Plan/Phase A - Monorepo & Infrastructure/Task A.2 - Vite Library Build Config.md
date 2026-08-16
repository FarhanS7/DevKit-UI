# Task A.2 — Vite Library Build Config (packages/core)

**Phase:** A — Monorepo & Infrastructure  
**Blocked by:** A.1  
**Blocks:** C.1, C.2, C.3, H.3  
**Week:** 1  
**AI Skill to use:** `senior-frontend`, `vercel-react-best-practices`

---

## 1. What I'm Building

The Vite configuration for `packages/core` in **library mode** — not app mode. This is the build system that transforms React component source code into the distributable npm package output.

After this task:

- `pnpm build` in `packages/core` produces `dist/index.mjs` (ESM) and `dist/index.cjs` (CJS)
- React, ReactDOM, and all Radix UI packages are excluded from the bundle (external)
- `rollup-plugin-visualizer` is installed for bundle analysis
- `package.json` `exports` field correctly maps to both output formats

---

## 2. Architectural Decisions

### Why Vite in Library Mode

Vite's library mode is designed exactly for this use case: building a JavaScript library (not an app) that:

- Has a single entry point (`src/index.ts`)
- Outputs multiple formats (ESM + CJS)
- Externalizes peer dependencies (React, Radix)
- Is tree-shakeable by default

The alternative (Rollup directly) gives more control but requires more configuration. Vite wraps Rollup and provides sensible defaults for libraries — the right level of abstraction for this project.

### ESM + CJS Dual Output

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'YourusernameUI', // UMD global name (rarely used but required)
      formats: ['es', 'cjs'], // ESM and CommonJS
      fileName: format => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        /^@radix-ui\/.*/, // Regex: all @radix-ui/* packages
      ],
      output: {
        preserveModules: false, // Single bundle per format (not code-split)
        globals: {
          // UMD global names for externals
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
  plugins: [react(), visualizer({ filename: 'dist/stats.html', open: false })],
});
```

### The `external` Array — Most Important Setting

Every package in `external` is NOT bundled into the library output. This is critical because:

- React must come from the consumer's app. If we bundle React, the consumer has **two React instances** — the library's and their app's. React hooks (`useState`, `useEffect`) silently fail across two React instances.
- Radix UI packages are peer dependencies — consumers install them. If we bundle Radix, consumers have duplicate Radix code and may experience state bugs.

**The regex `/^@radix-ui\/.*/`** matches all `@radix-ui/*` scoped packages. This is future-proof — any new Radix package we add is automatically external.

### `package.json` `exports` Field

```json
{
  "main": "./dist/index.cjs", // Legacy: require() consumers
  "module": "./dist/index.mjs", // Legacy: bundlers that read "module" field
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "types": "./dist/index.d.ts",
  "sideEffects": false, // CRITICAL: enables tree-shaking
  "files": ["dist"] // Only publish dist/ to npm
}
```

The `exports` field is the modern standard. `main` and `module` are for older toolchains that don't read `exports`. Having all three ensures maximum compatibility.

**`"sideEffects": false`** is the tree-shaking enabler. It tells bundlers: "importing any module from this package has no side effects — it's safe to remove unused exports." Without this, bundlers include the entire library even when only one component is imported.

---

## 3. System Design Notes

Build-time only. No runtime system design impact.

**Build output:**

- `dist/index.mjs` — ESM (modern bundlers: Vite, webpack 5, Rollup)
- `dist/index.cjs` — CJS (Node.js `require()`, older bundlers)
- `dist/index.d.ts` — TypeScript declarations
- `dist/stats.html` — Bundle visualizer (not published, for local analysis)

---

## 4. DSA Notes

Not applicable.

---

## 5. Token/Database Notes

`packages/core` has no direct dependency on tokens at this stage. Token imports will be added when we build components in Module D. The build config treats tokens as an external dependency — specifically, `@yourusername/tokens` is added to the external list so token files are not bundled into the library output.

---

## 6. Best Practices

- **`preserveModules: false`** — single bundle output is simpler for a library of this size. Code-splitting per component would require consumers to import from subpaths (`@yourusername/ui/Button`), which is more complex to set up.

- **TypeScript declarations** — Vite's library mode does not generate `.d.ts` files by default. Use `vite-plugin-dts` or run `tsc --emitDeclarationOnly` as a separate step. The CI pipeline should verify that `dist/index.d.ts` exists after build.

- **Development mode** — `vite build --watch` for live rebuild during development. But in practice, components are developed in Storybook (apps/docs) which has its own Vite instance. The library build is primarily for integration tests and CI.

---

## 7. Real-Life Engineering Gotchas

1. **The "two React instances" bug.** If you forget to add `react` to `external`, the consumer's app will have two Reacts. Symptoms: hooks throw "invalid hook call" errors. The fix is adding React to external — but finding the cause is time-consuming. Verify after every build that `react` is not in `dist/index.mjs` by running `grep "useState" dist/index.mjs`.

2. **`@types/react` in dependencies vs. devDependencies.** TypeScript types for React must be in `devDependencies` (they're only needed at compile time) but NOT in `peerDependencies`. Consumers provide their own React types. Getting this wrong produces "duplicate identifiers" TypeScript errors in consumers.

3. **The visualizer reports gzip vs. non-gzip sizes.** `rollup-plugin-visualizer` reports raw bundle sizes, not gzip. The CI bundle size check gzips the output. A 200KB raw bundle may be < 80KB gzipped. Don't conflate the two numbers.

---

## 8. Code Review Checklist

- [ ] `pnpm build` in `packages/core` produces `dist/index.mjs` and `dist/index.cjs`
- [ ] Neither `react` nor `react-dom` appear in the bundle: `grep "useState" dist/index.mjs` returns nothing
- [ ] No `@radix-ui` package code appears in the bundle
- [ ] `package.json` `exports` field has `import`, `require`, and `types` paths
- [ ] `"sideEffects": false` in `package.json`
- [ ] `"files": ["dist"]` in `package.json`
- [ ] TypeScript declarations exist at `dist/index.d.ts`
- [ ] `node -e "require('./dist/index.cjs')"` does not throw

---

## 9. QA Test Scenarios

| Scenario           | How to Test                               | Expected                        |
| ------------------ | ----------------------------------------- | ------------------------------- |
| ESM build exists   | `ls dist/`                                | `index.mjs` present             |
| CJS build exists   | `ls dist/`                                | `index.cjs` present             |
| No React in bundle | `grep -l "useState" dist/index.mjs`       | No match                        |
| CJS works          | `node -e "require('./dist/index.cjs')"`   | No error                        |
| Types exist        | `ls dist/index.d.ts`                      | File present                    |
| Bundle size check  | `node ../../scripts/check-bundle-size.js` | Passes (near 0KB at this stage) |

---

## 10. AI Code Loop Prompt

```
TASK: A.2 — Vite library build config (packages/core)

Context:
- This is a React component library using Vite in library mode
- Package: packages/core
- Output: ESM (index.mjs) + CJS (index.cjs) dual format
- TypeScript declarations must also be generated

Rules:
1. React, react-dom, react/jsx-runtime must be external (never bundled)
2. All @radix-ui/* packages must be external (use regex: /^@radix-ui\/.*/)
3. sideEffects: false in package.json
4. exports field in package.json must have import, require, and types paths
5. Use rollup-plugin-visualizer for bundle analysis (writes to dist/stats.html)
6. TypeScript declarations via vite-plugin-dts

Output files to create:
- packages/core/vite.config.ts
- packages/core/package.json (with correct exports, sideEffects, files, peerDependencies)

Test after creation:
- pnpm build in packages/core produces dist/index.mjs and dist/index.cjs
- node -e "require('./dist/index.cjs')" does not throw
```
