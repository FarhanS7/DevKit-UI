# Task B.1 — tokens.json Schema

**Phase:** B — Token Pipeline  
**Blocked by:** A.1  
**Blocks:** B.2  
**Week:** 2  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

The primary `tokens.json` configuration file containing the visual primitives and semantic variables that define color ramps, typography, borders, and layouts.

---

## 2. Architectural Decisions & Trade-offs

- **Two-Tier System (Primitives & Semantics):** Separating raw color/dimension tokens (primitives) from context-specific tokens (semantics) isolates styling changes.
- **Figma Token Compatibility:** Using a nested JSON format that matches the Tokens Studio plugin layout. This enables easy syncing of future design edits.

---

## 3. Implementation Plan & Approach

1. Define primitive values (grayscale ramps, branding hues, utility states).
2. Establish semantic mappings for backgrounds, text layers, borders, interactive states.
3. Add structure for dimensions: margins, layouts, spacing (4px grid), border radii, typographic weights, and elevations.

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Alias Formatting:** Ensure syntax matches the Style Dictionary lookup rules: `{category.primitive.name}`.
- **Deep nesting warnings:** Keep nesting levels under 4 to avoid difficult-to-track resolution errors.

---

## 5. Definition of Done

- [ ] `tokens.json` has valid syntax and formatting.
- [ ] Primitive maps exist for neutral, brand, and status groups.
- [ ] Semantic tokens link back to primitives without hardcoded fallback hex variables.

---

## 6. AI Code Loop Prompt

```
TASK: B.1 — tokens.json Schema

Create the source file packages/tokens/tokens.json containing primitive scales (neutral, brand, status) and semantic references (background.default, text.primary, border.default, interactive.default). Add a 4px spacing scale (spacing.1 to spacing.24), and radii definitions (none, sm, md, lg, xl, full).
```
