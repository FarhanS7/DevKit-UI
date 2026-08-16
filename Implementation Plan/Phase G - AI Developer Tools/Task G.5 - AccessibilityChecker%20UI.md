# Task G.5 — AccessibilityChecker UI

**Phase:** G — AI Developer Tools  
**Blocked by:** G.2  
**Blocks:** a11y testing workflows  
**Week:** 10  
**AI Skill to use:** `senior-frontend`, `frontend-design`

---

## 1. What I'm Building

The user interface widget (`A11yChecker`) inside Storybook docs that takes component descriptions or element logs, requests accessibility audits, and displays structured reports separating problems from code fixes.

---

## 2. Architectural Decisions & Trade-offs

- **Markdown-to-Section Card parsing**: Rather than outputting raw markdown chunks, we write a parser that detects headers like `### WCAG Criterion` or `### Code Fix` and renders them in styled section cards. This makes accessibility fixes more readable.
- **Loading Layout stabilization**: We apply fixed min-height constraints to output containers during processing states to avoid visual shifting.

---

## 3. Implementation Plan & Approach

### 1. Create `apps/docs/components/ai-tools/A11yChecker.tsx`

Create the interactive accessibility audit widget:

```typescript
import * as React from 'react';
import { Button, Input, Text } from '@yourusername/ui';

interface AuditSections {
  criterion: string;
  problem: string;
  fix: string;
}

export function A11yChecker() {
  const [inputCode, setInputCode] = React.useState('');
  const [rawOutput, setRawOutput] = React.useState('');
  const [streaming, setStreaming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim() || streaming) return;

    setStreaming(true);
    setRawOutput('');
    setError(null);

    try {
      const response = await fetch('/api/ai/check-accessibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inputCode }),
      });

      if (!response.ok) {
        throw new Error('Audit request failed.');
      }

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
      setError('Failed to check accessibility.');
    } finally {
      setStreaming(false);
    }
  };

  // Helper to parse markdown headings into cards
  const parsedSections = React.useMemo<AuditSections>(() => {
    const sections = { criterion: '', problem: '', fix: '' };
    if (!rawOutput) return sections;

    const parts = rawOutput.split(/###\s+/);
    for (const part of parts) {
      if (part.toLowerCase().startsWith('wcag criterion')) {
        sections.criterion = part.replace(/wcag criterion\n*/i, '').trim();
      } else if (part.toLowerCase().startsWith('the problem')) {
        sections.problem = part.replace(/the problem\n*/i, '').trim();
      } else if (part.toLowerCase().startsWith('code fix')) {
        sections.fix = part.replace(/code fix\n*/i, '').trim();
      }
    }

    return sections;
  }, [rawOutput]);

  return (
    <div className="flex flex-col gap-4 p-6 border border-[var(--color-border-default)] rounded-[var(--radius-lg)] bg-[var(--color-background-default)] w-full max-w-3xl">
      <div className="flex flex-col gap-1">
        <Text variant="heading-md" as="h3">AI Accessibility Checker</Text>
        <Text variant="body-sm">Describe an accessibility issue or paste a code block to retrieve a structured WCAG audit.</Text>
      </div>

      <form onSubmit={handleAudit} className="flex gap-2">
        <Input
          placeholder="e.g. My Dialog overlay fails to return focus to the trigger element..."
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          disabled={streaming}
          className="flex-1"
        />
        <Button type="submit" isLoading={streaming}>
          Audit
        </Button>
      </form>

      {error && (
        <div className="p-3 border border-[var(--color-status-error)] bg-[var(--color-status-error-background)] text-[var(--color-status-error)] rounded-[var(--radius-md)] text-xs">
          {error}
        </div>
      )}

      {rawOutput && (
        <div className="flex flex-col gap-4 mt-2">
          {parsedSections.criterion && (
            <div className="p-4 border border-[var(--color-border-default)] bg-[var(--color-background-subtle)] rounded-[var(--radius-md)]">
              <Text variant="label" className="text-[var(--color-interactive-default)]">WCAG Criterion</Text>
              <p className="text-sm mt-1 text-[var(--color-text-primary)] whitespace-pre-wrap">{parsedSections.criterion}</p>
            </div>
          )}

          {parsedSections.problem && (
            <div className="p-4 border border-[var(--color-border-default)] bg-[var(--color-background-subtle)] rounded-[var(--radius-md)]">
              <Text variant="label" className="text-[var(--color-status-error)]">The Problem</Text>
              <p className="text-sm mt-1 text-[var(--color-text-primary)] whitespace-pre-wrap">{parsedSections.problem}</p>
            </div>
          )}

          {parsedSections.fix && (
            <div className="p-4 border border-[var(--color-border-default)] bg-[var(--color-background-subtle)] rounded-[var(--radius-md)]">
              <div className="flex items-center justify-between">
                <Text variant="label" className="text-[var(--color-status-success)]">Code Fix</Text>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigator.clipboard.writeText(parsedSections.fix)}
                >
                  Copy Fix
                </Button>
              </div>
              <pre className="mt-2 bg-[var(--color-background-default)] p-3 rounded text-xs font-mono border border-[var(--color-border-default)] text-[var(--color-text-primary)] overflow-auto">
                <code>{parsedSections.fix}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Fall back to raw output**: If Claude returns output with minor heading variations (e.g. `### Violations` instead of `### The Problem`), our parser must fall back to showing the raw text output to avoid displaying blank cards.
- **Copy Code fix cleanup**: Strip markdown formatting (` ```tsx `) from the fix string before saving to clipboard.

---

## 5. Definition of Done

- [ ] `A11yChecker` UI exists at `apps/docs/components/ai-tools/`.
- [ ] Submitting descriptions streams structured WCAG analysis text blocks.
- [ ] Displays parsed output sections inside structured cards.

---

## 6. QA Test Scenarios

| Scenario                | Command                                  | Expected Result                                                         |
| ----------------------- | ---------------------------------------- | ----------------------------------------------------------------------- |
| Verify rendering output | Mount tool widget in Storybook           | Prompt inputs and audit buttons display.                                |
| Test auditing stream    | Input accessibility issue and submit     | Section cards (WCAG, Problem, Fix) appear dynamically as tokens arrive. |
| Verify Copy button      | Click Copy Fix on a suggested code block | Suggested fix code is successfully copied to the clipboard.             |

---

## 7. AI Code Loop Prompt

```
TASK: G.5 — AccessibilityChecker UI

Create apps/docs/components/ai-tools/A11yChecker.tsx.
Support prompt inputs and audit buttons.
Manage streaming connections via fetch reader streams.
Parse output headings ('### WCAG Criterion', '### The Problem', '### Code Fix') to render sections inside distinct visual cards.
Assert streaming, parsing, copying, and accessibility in A11yChecker.test.tsx.
```
