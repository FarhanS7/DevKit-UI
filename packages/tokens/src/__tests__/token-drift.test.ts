import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { describe, it, expect } from 'vitest';

import { tokens } from '../../dist/tokens.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Token Drift Guard', () => {
  it('should match the source JSON token structure', () => {
    // 1. Load raw tokens.json
    const tokensJsonPath = path.resolve(__dirname, '../../tokens.json');
    const rawTokens = JSON.parse(fs.readFileSync(tokensJsonPath, 'utf-8'));

    // 2. Extracted keys from source JSON
    const semanticColorsJson = Object.keys(rawTokens.color.semantic);

    // 3. Extracted keys from generated TS object
    const generatedSemanticColors = Object.keys(tokens.color);

    // 4. Assert generated keys match source keys
    expect(generatedSemanticColors).toEqual(expect.arrayContaining(semanticColorsJson));
  });

  it('should resolve all CSS variable references cleanly', () => {
    const cssPath = path.resolve(__dirname, '../../dist/tokens.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    // Check for any unresolved Style Dictionary outputs or undefined outputs
    expect(cssContent).not.toContain('undefined');
    expect(cssContent).not.toContain('[object Object]');
  });
});
