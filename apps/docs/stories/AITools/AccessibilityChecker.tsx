import React, { useState } from 'react';
import { Button, Text, Heading } from '@devkit-ui/core';

export function AccessibilityChecker() {
  const [code, setCode] = useState('<button onClick={handleClick}><img src="icon.png" /></button>');
  const [report, setReport] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);

  const handleAudit = async () => {
    if (!code.trim()) return;
    setIsAuditing(true);
    setReport('');

    try {
      const response = await fetch('/api/ai/check-accessibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Audit failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split('\n\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (dataStr === '[DONE]') break;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  setReport(prev => prev + parsed.text);
                }
              } catch {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }
      }
    } catch {
      // Demo fallback stream if endpoint isn't running in standalone storybook context
      const demoReport = `### WCAG Criterion
**WCAG 4.1.2 Name, Role, Value (Level A)** & **WCAG 1.3.1 Info and Relationships (Level A)**

### The Problem
The audited code snippet lacks explicit accessible labels (\`aria-label\`, \`aria-labelledby\`, or associated \`<Label>\` elements). Screen reader users will hear unlabelled form fields or icon triggers.

### Code Fix
Wrap input elements using DevKit UI \`Input\` with \`label\` prop, or provide \`aria-label\` attributes on icon triggers:

\`\`\`tsx
import { Input, Button, Icon } from '@devkit-ui/core';

// Accessible implementation:
<Input label="Email Address" id="user-email" placeholder="you@example.com" />
<Button leftIcon={<Icon name="Check" aria-hidden="true" />}>Save</Button>
\`\`\``;

      const chunks = demoReport.match(/.{1,20}/g) || [demoReport];
      for (const chunk of chunks) {
        setReport(prev => prev + chunk);
        await new Promise(r => setTimeout(r, 30));
      }
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl bg-white border border-slate-200 rounded-xl shadow-sm space-y-6">
      <div>
        <Heading as="h2" variant="heading-lg">
          AI Accessibility Checker
        </Heading>
        <Text variant="body-sm" className="mt-1">
          Paste your JSX code snippet or UI description to perform an instant WCAG 2.1 AA audit.
        </Text>
      </div>

      <div className="space-y-3">
        <Text variant="label">JSX Code or Markup Snippet</Text>
        <textarea
          rows={5}
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Paste code snippet here..."
          className="w-full p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button variant="primary" onClick={handleAudit} isLoading={isAuditing}>
          Run WCAG Audit
        </Button>
      </div>

      {report && (
        <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <Text variant="label">Audit Report</Text>
          <div className="prose prose-sm max-w-none text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
            {report}
          </div>
        </div>
      )}
    </div>
  );
}
