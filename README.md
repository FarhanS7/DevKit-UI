# DevKit UI

[![CI Build](https.github.com/FarhanS7/DevKit-UI/actions/workflows/ci.yml/badge.svg)](https://github.com/FarhanS7/DevKit-UI/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Bundle Size](https://img.shields.io/badge/gzipped%20size-20.99%20KB-emerald)](https://github.com/FarhanS7/DevKit-UI)
[![A11y: WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA%20Compliant-purple)](https://github.com/FarhanS7/DevKit-UI)

> An accessible, high-performance, token-driven React component library and AI developer tool suite built with TypeScript, Tailwind CSS, and Style Dictionary.

---

## 🌟 Key Features

- 🎨 **Token-Driven Design System**: Style Dictionary pipeline generating multi-brand CSS custom properties (`@devkit-ui/tokens`).
- ⚡ **High-Performance DSA Components**: Virtualized scrolling (`VirtualList`) with O(log n) binary search indexing, Sørensen-Dice trigram fuzzy search (`CommandPalette`), and 2D keyboard navigation (`DataGrid`).
- ♿ **WCAG 2.1 AA Compliant**: 122 automated unit & `axe-core` accessibility tests asserting 0 violations.
- 📦 **Ultra Lightweight**: Gzipped library footprint of **20.99 KB** (80 KB strict budget gate in CI).
- 🤖 **AI Developer Tool Suite**: Real-time component generation, instant WCAG accessibility scanner, and dynamic theme builder powered by Server-Sent Events (SSE).

---

## 📦 Packages in Monorepo

| Package                                  | Version | Description                                                   |
| ---------------------------------------- | ------- | ------------------------------------------------------------- |
| [`@devkit-ui/core`](./packages/core)     | `0.0.0` | Accessible React component primitives, DSA components & hooks |
| [`@devkit-ui/tokens`](./packages/tokens) | `0.0.0` | Style Dictionary design system tokens & CSS variables         |

---

## 🚀 Quickstart Guide

### 1. Installation

Install `@devkit-ui/core` and `@devkit-ui/tokens`:

```bash
pnpm add @devkit-ui/core @devkit-ui/tokens
# or
npm install @devkit-ui/core @devkit-ui/tokens
# or
yarn add @devkit-ui/core @devkit-ui/tokens
```

### 2. Import CSS Design Tokens

Import token stylesheets at the root of your application (e.g. `main.tsx` or `_app.tsx`):

```tsx
import '@devkit-ui/tokens/dist/tokens.css';
import '@devkit-ui/tokens/dist/tokens.dark.css'; // Optional for dark mode support
```

### 3. Configure Tailwind CSS Content Path

Add the package path to your `tailwind.config.js` `content` array so Tailwind compiles all component utility classes:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './node_modules/@devkit-ui/core/dist/**/*.mjs'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 4. Basic Usage Example

```tsx
import React from 'react';
import { Button, Input, Dialog, Text, Heading } from '@devkit-ui/core';

export function UserProfileCard() {
  return (
    <Dialog>
      <Dialog.Trigger>
        <Button variant="primary">Edit Profile</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Heading as="h3" variant="heading-md">
          User Settings
        </Heading>
        <Text variant="body-sm" className="mt-1">
          Update your profile preferences below.
        </Text>

        <div className="mt-4 space-y-3">
          <Input label="Full Name" defaultValue="Alex Rivera" />
          <Input label="Email" defaultValue="alex@example.com" />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Dialog.Close>
            <Button variant="secondary">Cancel</Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button variant="primary">Save Changes</Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
```

---

## 🛠️ Local Development Setup

### Prerequisites

- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 8.0.0` (`pnpm@9.15.4` recommended)

### Workspace Commands

```bash
# 1. Clone repository
git clone https://github.com/FarhanS7/DevKit-UI.git
cd DevKit-UI

# 2. Install dependencies & verify environment
pnpm install

# 3. Build design tokens & core library
pnpm build:tokens
pnpm build:core

# 4. Start Storybook documentation server
pnpm dev

# 5. Run Vitest & axe-core test suite
pnpm test

# 6. Audit gzipped bundle size (80KB budget)
pnpm check-size

# 7. Run ESLint & TypeScript typechecks
pnpm lint
pnpm typecheck
```

---

## 🤖 AI Developer Tools

DevKit UI includes built-in AI developer assistant API routes and Storybook interfaces:

1. **Component Generator**: `POST /api/ai/generate-component` — Streams JSX layouts based on prompt requests using Server-Sent Events.
2. **Accessibility Checker**: `POST /api/ai/check-accessibility` — Audits code snippets against WCAG 2.1 AA guidelines and streams structured markdown fix reports.
3. **Theme Builder**: `POST /api/ai/build-theme` — Generates Style Dictionary semantic token JSON overrides and injects CSS custom properties dynamically.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
