function buildTrigrams(str: string): Set<string> {
  const normalized = `  ${str.toLowerCase().trim()}  `;
  const trigrams = new Set<string>();
  for (let i = 0; i < normalized.length - 2; i++) {
    trigrams.add(normalized.slice(i, i + 3));
  }
  return trigrams;
}

/**
 * Calculates the Sørensen-Dice coefficient similarity score between two strings using trigrams.
 * Returns a value between 0.0 (no similarity) and 1.0 (exact match).
 */
export function trigramSimilarity(query: string, target: string): number {
  if (!query || !target) return 0;
  const qLower = query.toLowerCase().trim();
  const tLower = target.toLowerCase().trim();

  if (tLower.includes(qLower)) {
    return 1.0; // Exact substring match gets top score
  }

  const trigramsQuery = buildTrigrams(query);
  const trigramsTarget = buildTrigrams(target);

  let intersection = 0;
  for (const tri of trigramsQuery) {
    if (trigramsTarget.has(tri)) {
      intersection++;
    }
  }

  if (trigramsQuery.size + trigramsTarget.size === 0) return 0;
  return (2 * intersection) / (trigramsQuery.size + trigramsTarget.size);
}
