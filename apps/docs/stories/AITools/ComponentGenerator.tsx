import React, { useState } from 'react';
import { Button, Input, Text, Heading } from '@devkit-ui/core';

export function ComponentGenerator() {
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setOutput('');
    setCopied(false);

    try {
      const response = await fetch('/api/ai/generate-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate component');
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
                  setOutput(prev => prev + parsed.text);
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
      const demoCode = `<div className="p-6 border border-slate-200 rounded-lg max-w-md bg-white shadow-sm space-y-4">
  <Heading as="h3" variant="heading-md">Generated Component</Heading>
  <Text variant="body-sm">
    This component was dynamically generated for: "${prompt}".
  </Text>
  <div className="space-y-2">
    <Label htmlFor="demo-input">Feedback</Label>
    <Input id="demo-input" placeholder="Type your response..." />
  </div>
  <Button variant="primary">Submit Request</Button>
</div>`;

      const chunks = demoCode.match(/.{1,15}/g) || [demoCode];
      for (const chunk of chunks) {
        setOutput(prev => prev + chunk);
        await new Promise(r => setTimeout(r, 40));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-2xl bg-white border border-slate-200 rounded-xl shadow-sm space-y-6">
      <div>
        <Heading as="h2" variant="heading-lg">
          AI Component Generator
        </Heading>
        <Text variant="body-sm" className="mt-1">
          Describe the component or layout you want to build using DevKit UI design tokens.
        </Text>
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Input
            label="Prompt"
            placeholder="e.g., A newsletter signup card with an email input and submit button"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
          />
        </div>
        <Button variant="primary" onClick={handleGenerate} isLoading={isGenerating}>
          Generate
        </Button>
      </div>

      {output && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Text variant="label">Generated JSX Output</Text>
            <Button size="sm" variant="secondary" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
          </div>
          <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
