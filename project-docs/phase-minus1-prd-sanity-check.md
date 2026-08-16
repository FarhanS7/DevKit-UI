# Phase -1 — PRD Sanity Check
## Project: AI-Powered Design System & Component Library

> **Purpose:** Catch gaps, contradictions, and risky assumptions *before* they get baked into architecture decisions. Everything found here feeds directly into Phase 0.

---

## -1.1 Ambiguity & Gap Scan

### Gap 1 — AI Tools: Rate Limiting Scope Unclear
**Section:** §11 AI Tools API  
**Issue:** The PRD states "20 requests / hour per IP" but does not define what happens at the limit — hard 429 error, graceful degradation message, queue + retry? Also: IP-based rate limiting is trivially bypassed. Is there any user-level or session-level limit intended?  
**Open question:** What is the user-facing behavior when the rate limit is hit? Is IP-only limiting acceptable for a public portfolio demo?

---

### Gap 2 — Token Pipeline: Figma Integration is Optional but Implied as Central
**Section:** §6 Token Pipeline Architecture  
**Issue:** The PRD says the `tokens.json` format is "compatible with the Figma Tokens plugin" but also says tokens can be maintained manually. The pipeline description shows Figma at the top — but if you're building solo without a Figma license or the plugin, the "Figma → Style Dictionary" story is demo-only. The actual source of truth would be a hand-maintained JSON file.  
**Open question:** Is the Figma integration real (requires Figma Pro + plugin setup) or is it a documented-but-not-wired path? This affects Week 2's scope.

---

### Gap 3 — Theme Builder: Live Preview Mechanism Unspecified
**Section:** §8.4 Theme Builder  
**Issue:** "Live preview: CSS variables updated in Storybook iframe immediately." — the PRD does not describe *how* this works. Storybook iframes are cross-origin by default; injecting CSS variables into the Storybook preview from a parent page requires either a Storybook addon, a `postMessage` channel, or a shared global store. None of this is specified.  
**Open question:** What is the implementation mechanism for live CSS variable injection into the Storybook preview?

---

### Gap 4 — Component Generator: JSX Validation Step
**Section:** §8.4 Component Generator  
**Issue:** "Validate generated JSX parses before showing to user (Babel `@babel/parser`)" — this is mentioned as a requirement but the error handling path is not specified. What happens if the LLM generates invalid JSX? Show the raw text anyway? Show an error? Retry?  
**Open question:** What is the fallback UX when LLM-generated JSX fails the Babel parse check?

---

### Gap 5 — DatePicker: i18n Scope Undefined
**Section:** §7 Tier 3 Components  
**Issue:** DatePicker is listed with "i18n" as a key challenge, but no i18n library is listed in the tech stack and no locale scope is defined. Full i18n (RTL, locale-aware first-day-of-week, translated month names) is a significant scope addition.  
**Open question:** Is DatePicker i18n scoped to English-only with a note about extensibility, or does it require actual locale support? If so, which library (e.g. `date-fns`, `Intl` API)?

---

### Gap 6 — Missing Non-Functional Requirements: Supported Browser Targets
**Section:** Entire PRD  
**Issue:** No browser support matrix is stated. "100% WCAG 2.1 AA" and "NVDA + Chrome + VoiceOver + Safari" implies at minimum Chrome + Safari, but the exact matrix (Firefox? Edge? Safari minimum version?) affects CSS feature usage, especially CSS custom properties edge cases and `:focus-visible` support.  
**Open question:** What is the browser support matrix? Evergreen-only (last 2 major versions)? Safari ≥ 16?

---

### Gap 7 — VirtualList: Dynamic vs. Fixed Item Heights
**Section:** §9.1 VirtualList  
**Issue:** The binary search implementation uses `this.itemHeights` (an array of per-item measured heights), implying support for variable item heights. However, variable-height virtualization requires a `ResizeObserver` per item and a layout effect to measure — significantly more complex than fixed-height virtualization. The PRD mentions `ResizeObserver` briefly but does not clarify which mode is in scope.  
**Open question:** Does the VirtualList support only fixed item height (simpler, fast) or true variable item heights (requires measurement)? This changes the Week 8 complexity significantly.

---

### Gap 8 — Accessibility Checker: WCAG Version and Context
**Section:** §8.4 Accessibility Checker  
**Issue:** The system prompt is described as having "WCAG 2.1 AA as context" but it's not specified whether this is the full WCAG spec embedded in the system prompt (too large), a curated subset, or a retrieval-augmented approach. The quality of this tool depends entirely on what's in the system prompt.  
**Open question:** What is the actual system prompt strategy for the Accessibility Checker? Full WCAG 2.1 text, curated criteria list, or RAG?

---

## -1.2 Explicit Scope Line — v1 vs. Later

### In Scope for v1 (Minimum Viable Portfolio Project)

These are the pieces that must exist for the project to tell its story end-to-end:

- Token pipeline (tokens.json → Style Dictionary → CSS vars + TypeScript types, dark mode)
- Tier 1 components: Button (polymorphic), Input, Label, Text/Heading, VisuallyHidden, Portal
- Tier 2 components: Dialog (focus trap), Select/Combobox (keyboard nav), Tabs, Accordion, Checkbox/Switch
- axe-core zero-violation CI gate on all components
- Storybook 8 with stories for every component (all required story variants per §16)
- All 3 AI DX tools: Component Generator, Accessibility Checker, Theme Builder
- Chromatic visual regression CI
- Changesets + npm publish (`@yourusername/ui`)
- Full CI pipeline (lint → type-check → test → axe → chromatic → bundle analysis)
- README, ADRs, usage documentation

### Explicitly Deferred (named, not just omitted)

| Feature | Why Deferred |
|---------|-------------|
| `Tooltip` floating position (no library) | Complex geometry; Floating UI library is a faster path; build after Tier 2 core is proven |
| `DatePicker` | Calendar grid algorithm + i18n scope; Week 8 already has VirtualList + DataGrid + CommandPalette |
| `DataGrid` full implementation | Most complex component; defer to after CommandPalette proves the pattern |
| Figma Tokens plugin real integration | Requires Figma Pro license; document the format compatibility, wire real integration post-launch |
| Variable-height VirtualList | Implement fixed-height first; variable-height is an extension |
| `prefers-color-scheme` auto dark mode | Ship `[data-theme="dark"]` manual toggle first; auto detection is a one-line CSS addition post-launch |
| Icon set > 50 icons | Ship 50 icons for portfolio; expand post-launch |
| Playwright tests beyond Dialog + Select | Budget time for the two hardest; add others post-launch |

**Why this line:** Solo build, 10–12 weeks. Every Tier 2 component is a week of real work when done to WCAG 2.1 AA standard. Tier 3 components (VirtualList, DataGrid, CommandPalette) exist to demonstrate DSA depth, not to be production-complete. Deferred items are well-documented so they're visible as future work, not hidden.

---

## -1.3 Riskiest Assumption

**The assumption:** The AI DX tools (Component Generator, Accessibility Checker, Theme Builder) will produce outputs that are accurate and useful enough to actually demonstrate value to an interviewer — and that the system prompt strategy is sufficient to constrain the LLM's output to the library's API.

**Why it's the riskiest:**
- If the Component Generator generates JSX that uses the library's components with wrong props (hallucinated variants, non-existent prop names), it actively demonstrates the opposite of engineering rigor.
- The Accessibility Checker's quality depends entirely on how the WCAG context is provided in the system prompt — if it's too vague, the output will be generic, not specific to the library.
- The Theme Builder generating token values requires the LLM to understand contrast ratios well enough to not produce inaccessible color combinations, which is not guaranteed.

**What breaks in Phase 0 if this assumption is wrong:**
- The entire AI Tools module (Tier 4) would need a different implementation strategy — possibly a retrieval-augmented approach, fine-tuning, or a much more constrained prompt structure with validation layers.
- The Next.js API route architecture (§11) may need to change if a more complex tool-use or RAG approach is needed.

**What to validate first (Week 9 spike before committing):**
Before Week 9, run a quick prompt engineering spike: write the Component Generator system prompt with the full Button/Input/Dialog API embedded, test 10 natural language inputs, and evaluate whether the output is library-accurate. If failure rate > 20%, redesign the prompt strategy before building the UI around it.

---

## Phase -1 Output Summary

| Item | Decision |
|------|----------|
| AI tool rate limiting behavior | **Open** — default to 429 + user-friendly message; revisit if demo traffic is real |
| Figma integration | **Deferred** — ship manual tokens.json; document Figma Tokens plugin format compatibility |
| Theme Builder live preview mechanism | **Needs spike** — use Storybook's `globals` channel API (documented in Storybook 8) |
| JSX validation fallback | **Decided** — show parse error inline, do not display invalid JSX |
| DatePicker i18n | **Deferred** — English-only `Intl.DateTimeFormat` for v1 |
| Browser support matrix | **Decided** — evergreen (last 2 Chrome, Firefox, Edge; Safari ≥ 16) |
| VirtualList height mode | **Decided** — fixed-height first, variable-height as documented extension |
| A11y Checker system prompt | **Needs spike** — curated WCAG 2.1 AA criteria list (not full spec) in system prompt |
| Scope line | **Decided** — see §-1.2 above |
| Riskiest assumption | **Named** — AI tool output quality; validate in Week 9 spike before UI build |

---

*This document feeds directly into Phase 0. Every architecture decision in Phase 0 must be consistent with the scope line and open questions resolved here.*
