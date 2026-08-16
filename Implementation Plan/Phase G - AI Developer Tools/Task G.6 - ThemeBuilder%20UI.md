# Task G.6 — ThemeBuilder UI

**Phase:** G — AI Developer Tools  
**Blocked by:** G.3  
**Blocks:** N/A (Final G task)  
**Week:** 10  
**AI Skill to use:** `senior-frontend`, `frontend-design`

---

## 1. What I'm Building

The user interface widget (`ThemeBuilder`) in Storybook docs that takes natural language theme requests, retrieves Style Dictionary JSON overrides, injects them into the document stylesheet in real time, and validates color contrast against WCAG thresholds.

---

## 2. Architectural Decisions & Trade-offs

- **Live CSS Custom Property Injection**: Once overrides are parsed, we inject values directly into the document root style (`document.documentElement.style.setProperty('--color-background-default', value)`). This lets users preview themes on the active Storybook container immediately, without code changes.
- **Relatively Luminance Contrast Checks**: The UI calculates relative luminance on hex values to verify if generated color pairings achieve a `4.5:1` contrast ratio. It flags violations in warning banners.

---

## 3. Implementation Plan & Approach

### 1. Create color math utility `apps/docs/utils/color-math.ts`

Implement relative luminance and contrast calculations:

```typescript
// Parse hex to RGB
function hexToRgb(hex: string): [number, number, number] | null {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? [parseInt(result[1]!, 16), parseInt(result[2]!, 16), parseInt(result[3]!, 16)]
    : null;
}

// Compute relative luminance
function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0]! * 0.2126 + a[1]! * 0.7152 + a[2]! * 0.0722;
}

// Calculate contrast ratio
export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 1;

  const l1 = getLuminance(...rgb1);
  const l2 = getLuminance(...rgb2);

  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}
```

### 2. Create `apps/docs/components/ai-tools/ThemeBuilder.tsx`

Create the theme editor widget:

````typescript
import * as React from 'react';
import { Button, Input, Text } from '@yourusername/ui';
import { getContrastRatio } from '../../utils/color-math';

export function ThemeBuilder() {
  const [prompt, setPrompt] = React.useState('');
  const [streaming, setStreaming] = React.useState(false);
  const [rawOutput, setRawOutput] = React.useState('');
  const [themeJson, setThemeJson] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleGenerateTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || streaming) return;

    setStreaming(true);
    setRawOutput('');
    setThemeJson(null);
    setError(null);

    try {
      const response = await fetch('/api/ai/build-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Theme request failed.');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                setRawOutput((prev) => prev + parsed.text);
              }
            } catch (err) {
              // Ignore partial JSON errors
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to build theme.');
    } finally {
      setStreaming(false);
    }
  };

  // Process and inject CSS property overrides on change
  React.useEffect(() => {
    if (!rawOutput || streaming) return;

    // Clean up code fences if Claude adds them
    let cleanJson = rawOutput.replace(/```json|```/gi, '').trim();
    try {
      const parsed = JSON.parse(cleanJson);
      setThemeJson(parsed);

      // Inject custom properties into document root style
      const brandPrimary = parsed?.color?.brand?.primary?.value;
      const brandHover = parsed?.color?.brand?.['primary-hover']?.value;
      const bgDefault = parsed?.color?.neutral?.['50']?.value;
      const bgDark = parsed?.color?.neutral?.['950']?.value;

      if (brandPrimary) document.documentElement.style.setProperty('--color-interactive-default', brandPrimary);
      if (brandHover) document.documentElement.style.setProperty('--color-interactive-hover', brandHover);
      if (bgDefault) document.documentElement.style.setProperty('--color-background-default', bgDefault);
      if (bgDark) document.documentElement.style.setProperty('--color-background-subtle', bgDark);

    } catch (err) {
      // Wait for complete JSON string before parsing
    }
  }, [rawOutput, streaming]);

  // Calculate contrast check
  const contrastInfo = React.useMemo(() => {
    if (!themeJson) return null;
    const bg = themeJson?.color?.neutral?.['50']?.value || '#ffffff';
    const primary = themeJson?.color?.brand?.primary?.value || '#6366f1';
    const ratio = getContrastRatio(primary, bg);
    return { ratio, passes: ratio >= 4.5 };
  }, [themeJson]);

  return (
    <div className="flex flex-col gap-4 p-6 border border-[var(--color-border-default)] rounded-[var(--radius-lg)] bg-[var(--color-background-default)] w-full max-w-3xl">
      <div className="flex flex-col gap-1">
        <Text variant="heading-md" as="h3">AI Theme Builder</Text>
        <Text variant="body-sm">Request theme colors using design descriptions and preview them in real time.</Text>
      </div>

      <form onSubmit={handleGenerateTheme} className="flex gap-2">
        <Input
          placeholder="e.g. A deep forest green theme with warm beige background..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={streaming}
          className="flex-1"
        />
        <Button type="submit" isLoading={streaming}>
          Build
        </Button>
      </form>

      {error && (
        <div className="p-3 border border-[var(--color-status-error)] bg-[var(--color-status-error-background)] text-[var(--color-status-error)] rounded-[var(--radius-md)] text-xs">
          {error}
        </div>
      )}

      {themeJson && (
        <div className="flex flex-col gap-4 mt-2">
          {contrastInfo && (
            <div className={`p-4 border rounded-[var(--radius-md)] text-sm ${
              contrastInfo.passes
                ? 'border-[var(--color-status-success)] bg-[var(--color-status-success-background)] text-[var(--color-status-success)]'
                : 'border-[var(--color-status-warning)] bg-[var(--color-status-warning-background)] text-[var(--color-status-warning)]'
            }`}>
              <Text variant="label">Contrast Validation</Text>
              <p className="mt-1">
                Generated Brand Primary to Background Contrast Ratio: <strong>{contrastInfo.ratio.toFixed(2)}:1</strong>.
                {contrastInfo.passes ? ' (Passes WCAG 2.1 AA)' : ' (Below 4.5:1 AA target for normal text)'}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Text variant="label">Active Token Overrides</Text>
            <pre className="bg-[var(--color-background-subtle)] p-4 rounded-[var(--radius-md)] text-xs font-mono overflow-auto border border-[var(--color-border-default)] text-[var(--color-text-primary)]">
              <code>{JSON.stringify(themeJson, null, 2)}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
````

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Contrast warnings**: If a theme fails the contrast check, alert the user using a warning banner but still allow stylesheet overrides to preserve design freedom.
- **Root Styles cleanup**: Overrides dynamically update the element styles. Add clear reset triggers to restore default token properties:
  ```typescript
  document.documentElement.removeAttribute('style');
  ```

---

## 5. Definition of Done

- [ ] `ThemeBuilder` UI widget exists at `apps/docs/components/ai-tools/`.
- [ ] Submitting theme inputs updates document root custom properties in real-time.
- [ ] Contrast ratio is calculated and displayed on mount.
- [ ] Restoring default settings cleans up the custom root stylesheet properties.

---

## 6. QA Test Scenarios

| Scenario                 | Command                                           | Expected Result                                                           |
| ------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------- |
| Verify rendering output  | Mount tool widget in Storybook                    | Prompt inputs and build buttons display.                                  |
| Test real-time injection | Input "deep forest green" theme prompt and submit | CSS variables update, and the Storybook interface updates visually.       |
| Test contrast checks     | Generate theme that has low contrast              | Warning banner displays that contrast ratio is below the 4.5:1 threshold. |

---

## 7. AI Code Loop Prompt

```
TASK: G.6 — ThemeBuilder UI

Create apps/docs/utils/color-math.ts containing relative luminance and WCAG contrast check functions.
Create apps/docs/components/ai-tools/ThemeBuilder.tsx.
Support prompt inputs and loading states.
Manage streaming connections via fetch reader streams, parsing output strings into JSON variables.
Inject parsed overrides as CSS custom properties into document.documentElement.style in real-time.
Calculate and display Brand-to-Background contrast ratios, warning on ratios below 4.5:1.
Verify rendering, styling updates, contrast calculations, and accessibility in ThemeBuilder.test.tsx.
```
