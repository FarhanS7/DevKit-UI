# Task G.4 — ComponentGenerator UI

**Phase:** G — AI Developer Tools  
**Blocked by:** G.1, D.5  
**Blocks:** Component creation tooling  
**Week:** 10  
**AI Skill to use:** `senior-frontend`, `frontend-design`, `frontend-ui-ux-engineer`

---

## 1. What I'm Building

The user interface widget (`ComponentGenerator`) in Storybook docs that takes prompts, streams JSX outputs, and validates syntax structure using a client-side Babel parser before copying layouts to the clipboard.

---

## 2. Architectural Decisions & Trade-offs

- **Client-side Babel Parser Checks**: Allowing users to copy invalid JSX syntax causes build breaks. Running `@babel/parser` on the output code before copying ensures the JSX compiles safely.
- **Fast Stream Buffer updates**: Rerendering React views on every SSE token stream chunk can lag the main thread. We buffer updates in a Ref or throttle updates to guarantee 60fps scrolling and smooth output streams.

---

## 3. Implementation Plan & Approach

### 1. Install Babel parser package in `apps/docs`

Install `@babel/parser` as a devDependency in the docs app:

```bash
cd apps/docs && pnpm add -D @babel/parser
```

### 2. Create `apps/docs/components/ai-tools/ComponentGenerator.tsx`

Create the interactive workspace generator tool:

```typescript
import * as React from 'react';
import * as babelParser from '@babel/parser';
import { Button } from '@yourusername/ui';
import { Input } from '@yourusername/ui';
import { Text } from '@yourusername/ui';

export function ComponentGenerator() {
  const [prompt, setPrompt] = React.useState('');
  const [outputCode, setOutputCode] = React.useState('');
  const [streaming, setStreaming] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || streaming) return;

    setStreaming(true);
    setOutputCode('');
    setValidationError(null);
    setCopied(false);

    try {
      const response = await fetch('/api/ai/generate-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Generation request failed.');
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
        buffer = lines.pop() || ''; // Keep partial line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                setOutputCode((prev) => prev + parsed.text);
              }
            } catch (err) {
              // Ignore partial JSON parsing failures
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setValidationError('Failed to generate component.');
    } finally {
      setStreaming(false);
    }
  };

  const handleCopy = () => {
    setValidationError(null);

    // Validate JSX code via Babel Parser
    try {
      babelParser.parse(outputCode, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });

      navigator.clipboard.writeText(outputCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err: any) {
      setValidationError(`Syntax Validation Failed: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 border border-[var(--color-border-default)] rounded-[var(--radius-lg)] bg-[var(--color-background-default)] w-full max-w-3xl">
      <div className="flex flex-col gap-1">
        <Text variant="heading-md" as="h3">AI Component Generator</Text>
        <Text variant="body-sm">Describe a component in natural language and stream type-safe JSX templates.</Text>
      </div>

      <form onSubmit={handleGenerate} className="flex gap-2">
        <Input
          placeholder="e.g. A card containing Indigo Button trigger..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={streaming}
          className="flex-1"
        />
        <Button type="submit" isLoading={streaming}>
          Generate
        </Button>
      </form>

      {outputCode && (
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center justify-between">
            <Text variant="label">Generated Output</Text>
            <Button size="sm" variant="secondary" onClick={handleCopy} disabled={streaming}>
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
          </div>
          <pre className="bg-[var(--color-background-subtle)] p-4 rounded-[var(--radius-md)] text-xs font-mono overflow-auto border border-[var(--color-border-default)] text-[var(--color-text-primary)] max-h-96">
            <code>{outputCode}</code>
          </pre>
        </div>
      )}

      {validationError && (
        <div className="p-3 border border-[var(--color-status-error)] bg-[var(--color-status-error-background)] text-[var(--color-status-error)] rounded-[var(--radius-md)] text-xs font-mono">
          {validationError}
        </div>
      )}
    </div>
  );
}
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **JSX Fragment validation limits**: Under Babel, standalone components must be nested inside elements or React Fragment wrapper blocks (`<>...</>`) to parse cleanly. Document this instructions guideline for prompts.
- **Buffer remaining data**: SSE chunks are occasionally sliced during transport. Always verify that trailing data is kept in buffers before JSON evaluations run.

---

## 5. Definition of Done

- [ ] `ComponentGenerator` UI is created under `apps/docs/components/ai-tools/`.
- [ ] Submitting prompts triggers active SSE stream loops.
- [ ] Copy button actions parse syntax through Babel parser checks.
- [ ] Validation errors output descriptive blocks on syntax checks.

---

## 6. QA Test Scenarios

| Scenario                     | Command                                              | Expected Result                                                        |
| ---------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| Verify rendering output      | Mount tool widget in Storybook                       | Prompt input field and submission button display without warnings.     |
| Test streaming outputs       | Input prompt and generate                            | Layout blocks stream token-by-token, displaying code in results block. |
| Verify copy checks (Success) | Click Copy on valid JSX output                       | Code parses successfully, copying to clipboard and showing "Copied!".  |
| Verify copy checks (Fail)    | Edit code block to cause syntax error and click Copy | Copy fails, displaying validation warning logs in error box.           |

---

## 7. AI Code Loop Prompt

```
TASK: G.4 — ComponentGenerator UI

Install @babel/parser as a devDependency in apps/docs.
Create apps/docs/components/ai-tools/ComponentGenerator.tsx.
Design prompt forms and buttons using core Button and Input components.
Manage streaming states using fetch reader streams.
Integrate babelParser.parse on copy triggers, catching parsing errors and displaying them in error elements.
Verify rendering, stream layouts, copy validations, and accessibility in ComponentGenerator.test.tsx.
```
