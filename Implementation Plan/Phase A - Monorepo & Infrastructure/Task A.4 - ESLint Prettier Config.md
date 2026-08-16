# Task A.4 — ESLint + Prettier + TypeScript Strict Config

**Phase:** A — Monorepo & Infrastructure  
**Blocked by:** A.1  
**Blocks:** Nothing directly (but A.4 enables H.1 CI linting gate)  
**Week:** 1 (parallel with A.2 and A.3)  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

The complete linting, formatting, and strict TypeScript toolchain for the monorepo.

After this task:

- `pnpm lint` passes on the scaffold (zero violations)
- `pnpm format --check` passes
- Pre-commit hooks via Husky + lint-staged run on staged files
- TypeScript strict mode is fully enforced across all packages
- `@typescript-eslint/no-explicit-any` is an error (not a warning)
- `jsx-a11y` catches ARIA mistakes at lint time (before tests run)

---

## 2. Architectural Decisions

### ESLint Config Structure

ESLint 9 uses a flat config (`eslint.config.js`). This replaces the older `.eslintrc.json` format.

```javascript
// eslint.config.js (root)
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import a11yPlugin from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json', './packages/*/tsconfig.json', './apps/*/tsconfig.json'],
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': a11yPlugin,
      import: importPlugin,
    },
    rules: {
      // TypeScript: strictest settings
      '@typescript-eslint/no-explicit-any': 'error', // Zero any — hard gate
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off', // Too verbose for React
      '@typescript-eslint/consistent-type-imports': 'error', // import type { X } not import { X }

      // React
      'react/jsx-uses-react': 'off', // Not needed with JSX transform
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+ JSX transform
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Accessibility — catches ARIA mistakes BEFORE tests run
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',

      // Imports
      'import/no-duplicates': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],
      'no-default-export': 'off', // We enforce this via code review and convention
    },
  },
];
```

### Why `jsx-a11y` is Set to `error` (Not `warn`)

Warnings get ignored. If `jsx-a11y/aria-role` is a warning, a developer sees it in their editor and dismisses it. If it's an error, `pnpm lint` fails and the CI pipeline blocks. Setting accessibility rules as errors creates a hard gate — the same discipline as setting `@typescript-eslint/no-explicit-any` to error.

**The pragmatic result:** `jsx-a11y` catches approximately 40% of common ARIA mistakes statically — before any tests run. This includes: wrong `role` values, `role` without required `aria-*` props, click handlers on non-interactive elements (should be `role="button"` with keyboard handlers). These are cheap to catch at lint time and expensive to catch in production.

### Prettier Config

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

Prettier is non-negotiable in formatting — it's not a style guide (which requires judgment calls), it's a formatter. Every file it touches looks the same, regardless of who wrote it.

### Pre-commit Hooks: Husky + lint-staged

```json
// package.json (root)
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

`lint-staged` runs only on **staged files**, not the whole codebase. This keeps the pre-commit hook fast (< 3 seconds) even in a large codebase.

---

## 3. System Design Notes

Build/dev tooling only. No runtime impact.

---

## 4. DSA Notes

Not applicable.

---

## 5. Token/Database Notes

Not applicable.

---

## 6. Best Practices

- **ESLint 9 flat config is the future.** The old `.eslintrc.json` format is deprecated. Use `eslint.config.js` with the flat config API.
- **Separate `eslint.config.js` for `packages/core` vs `apps/docs`** if needed. The root config applies everywhere by default. Override per-directory by adding a second `eslint.config.js` in that directory (they compose).
- **`@typescript-eslint/recommended-type-checked`** is the strictest TypeScript ESLint preset. It requires `parserOptions.project` pointing to `tsconfig.json` files. This enables rules that require type information (e.g., detecting `any` from third-party types, not just explicit `any` in source).

---

## 7. Real-Life Engineering Gotchas

1. **`parserOptions.project` must include all tsconfig paths.** If `apps/docs/tsconfig.json` is missing from the array, TypeScript-aware ESLint rules won't apply there. Use a glob: `['./tsconfig.json', './**/tsconfig.json']`.

2. **`lint-staged` + pre-commit hooks need `husky install` to run.** Add `"prepare": "husky install"` to root `package.json`. This runs after `pnpm install` and sets up the hooks. Forgetting this means hooks don't run on new clone.

3. **ESLint's `no-default-export` vs. our component convention.** We use named exports (`export { Button }`) not default exports (`export default Button`). ESLint has a `no-default-export` rule. However, Storybook stories use default exports (`export default meta`). The ESLint rule must be disabled for `*.stories.{ts,tsx}` files via an override.

4. **`@typescript-eslint/consistent-type-imports`** forces `import type { ButtonProps }` instead of `import { ButtonProps }`. This improves tree-shaking (type imports are erased at compile time, regular imports may not be). Turn this on from Day 1 — retrofitting it later requires touching hundreds of files.

---

## 8. Code Review Checklist

- [ ] `pnpm lint` passes on scaffold (zero violations)
- [ ] `pnpm format --check` passes
- [ ] `@typescript-eslint/no-explicit-any` is set to `'error'`
- [ ] `jsx-a11y/aria-role`, `jsx-a11y/role-has-required-aria-props` are `'error'`
- [ ] `react-hooks/rules-of-hooks` is `'error'`
- [ ] Pre-commit hook runs on `git commit` (test with a staged file)
- [ ] `husky install` runs automatically after `pnpm install` (check `prepare` script)
- [ ] Stories files (`.stories.tsx`) have no-default-export rule disabled

---

## 9. QA Test Scenarios

| Scenario           | Command                             | Expected                           |
| ------------------ | ----------------------------------- | ---------------------------------- |
| Lint scaffold      | `pnpm lint`                         | Zero violations                    |
| Format check       | `pnpm format --check`               | Zero violations                    |
| TypeScript check   | `pnpm typecheck`                    | Zero errors                        |
| Any rule violation | Write `const x: any = 5;` in a file | ESLint error                       |
| Pre-commit hook    | Stage a file, `git commit`          | lint-staged runs before commit     |
| ARIA mistake       | Add `<div role="buton">`            | ESLint error (wrong role spelling) |

---

## 10. AI Code Loop Prompt

```
TASK: A.4 — ESLint + Prettier + TypeScript strict config

Context:
- ESLint 9 with flat config (eslint.config.js)
- TypeScript strict mode + exactOptionalPropertyTypes (already in tsconfigs from A.1)
- pnpm workspaces monorepo
- React 18 + TypeScript components
- Storybook stories use default exports (need override)

Plugins required:
- @typescript-eslint/eslint-plugin + @typescript-eslint/parser
- eslint-plugin-react + eslint-plugin-react-hooks
- eslint-plugin-jsx-a11y
- eslint-plugin-import

Rules — set ALL of these to 'error' (not 'warn'):
- @typescript-eslint/no-explicit-any
- jsx-a11y/aria-role
- jsx-a11y/role-has-required-aria-props
- jsx-a11y/interactive-supports-focus
- react-hooks/rules-of-hooks

Pre-commit hooks:
- husky + lint-staged
- "prepare": "husky install" in root package.json
- lint-staged: run eslint --fix + prettier --write on staged .ts/.tsx files

Output:
- eslint.config.js (root, flat config)
- .prettierrc
- .husky/pre-commit
- Update root package.json: add lint-staged config, prepare script, devDependencies
```
