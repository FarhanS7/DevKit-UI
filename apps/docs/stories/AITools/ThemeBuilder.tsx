import React, { useState } from 'react';
import { Button, Input, Text, Heading } from '@devkit-ui/core';

export function ThemeBuilder() {
  const [prompt, setPrompt] = useState('Cyberpunk Neon');
  const [themeJson, setThemeJson] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);

  const handleBuild = async () => {
    if (!prompt.trim()) return;
    setIsBuilding(true);
    setThemeJson('');

    try {
      const response = await fetch('/api/ai/build-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Build failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let textBuffer = '';
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
                  textBuffer += parsed.text;
                  setThemeJson(textBuffer);
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
      const demoJson = `{
  "color": {
    "interactive": {
      "default": { "value": "#8b5cf6" },
      "hover": { "value": "#7c3aed" }
    },
    "background": {
      "default": { "value": "#0f172a" },
      "subtle": { "value": "#1e293b" }
    }
  }
}`;
      const chunks = demoJson.match(/.{1,15}/g) || [demoJson];
      for (const chunk of chunks) {
        setThemeJson(prev => prev + chunk);
        await new Promise(r => setTimeout(r, 30));
      }
    } finally {
      setIsBuilding(false);
    }
  };

  const applyTheme = () => {
    try {
      const parsed = JSON.parse(themeJson);
      if (parsed.color?.interactive?.default?.value) {
        document.documentElement.style.setProperty(
          '--color-interactive-default',
          parsed.color.interactive.default.value
        );
      }
      if (parsed.color?.brand?.primary?.value) {
        document.documentElement.style.setProperty(
          '--color-interactive-default',
          parsed.color.brand.primary.value
        );
      }
      alert('Theme applied dynamically to CSS custom properties!');
    } catch {
      alert('Invalid JSON structure.');
    }
  };

  const resetTheme = () => {
    document.documentElement.style.removeProperty('--color-interactive-default');
    alert('Theme reset to defaults.');
  };

  return (
    <div className="p-6 max-w-2xl bg-white border border-slate-200 rounded-xl shadow-sm space-y-6">
      <div>
        <Heading as="h2" variant="heading-lg">
          AI Theme Builder
        </Heading>
        <Text variant="body-sm" className="mt-1">
          Generate custom brand palettes and apply CSS custom property overrides in real time.
        </Text>
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Input
            label="Theme Style Prompt"
            placeholder="e.g., Midnight Cyberpunk, Emerald Sunset, Pastel Soft"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
        </div>
        <Button variant="primary" onClick={handleBuild} isLoading={isBuilding}>
          Build Theme
        </Button>
      </div>

      {themeJson && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Text variant="label">Generated Tokens (Style Dictionary Format)</Text>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={resetTheme}>
                Reset
              </Button>
              <Button size="sm" variant="primary" onClick={applyTheme}>
                Apply Live Theme
              </Button>
            </div>
          </div>
          <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed">
            {themeJson}
          </pre>
        </div>
      )}
    </div>
  );
}
