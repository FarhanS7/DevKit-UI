# Phase G — AI Developer Tools Walkthrough

## Overview

Phase G built the AI Developer Tool suite in Next.js and Storybook, incorporating Server-Sent Events (SSE) streaming API endpoints and interactive developer interfaces powered by Claude / Anthropic SDK.

## API Proxy Routes & UI Tools Summary

1. **Proxy Route: `generate-component`** (`apps/docs/pages/api/ai/generate-component.ts`):
   - Zod request body prompt validation (`prompt` max 1,000 characters).
   - In-memory rate limiting (max 20 requests per IP per hour).
   - Server-side Anthropic SDK streaming with token-by-token SSE output (`text_delta`).
   - Interactive SSE stream fallback when `ANTHROPIC_API_KEY` environment variable is omitted.

2. **Proxy Route: `check-accessibility`** (`apps/docs/pages/api/ai/check-accessibility.ts`):
   - Audits React code snippets against WCAG 2.1 AA guidelines.
   - Streams structured markdown audit reports containing `WCAG Criterion`, `The Problem`, and `Code Fix`.

3. **Proxy Route: `build-theme`** (`apps/docs/pages/api/ai/build-theme.ts`):
   - Generates Style Dictionary semantic token override JSON trees from natural language prompts.
   - Enforces minimum 4.5:1 WCAG contrast ratios between color pairs.

4. **ComponentGenerator UI & Story** (`apps/docs/stories/AITools/ComponentGenerator.tsx`):
   - Interactive prompt input, token-by-token code stream display, and one-click clipboard copy utility.

5. **AccessibilityChecker UI & Story** (`apps/docs/stories/AITools/AccessibilityChecker.tsx`):
   - Instant WCAG audit scanner interface displaying structured violation reports.

6. **ThemeBuilder UI & Story** (`apps/docs/stories/AITools/ThemeBuilder.tsx`):
   - Interactive theme builder with live CSS custom property injection (`--color-interactive-default`).

## Test & Integrity Metrics

- **122 total unit & axe tests** passing 100% across `@devkit-ui/core` and `@devkit-ui/tokens`
- Zero lint or TypeScript errors
