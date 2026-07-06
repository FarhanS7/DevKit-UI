import { expect, it } from 'vitest';

import { tokens } from '../../dist/tokens.js';
import rawTokens from '../../tokens.json' with { type: 'json' };

it('all semantic color categories in JSON exist in generated TypeScript', () => {
  const semanticCategories = Object.keys(rawTokens.color.semantic);
  for (const category of semanticCategories) {
    expect(Object.keys(tokens.color)).toContain(category);
  }
});
