/**
 * Binary search to find the first index in cumulativeHeights where cumulativeHeights[index] >= target.
 * Complexity: O(log n) time, O(1) space.
 *
 * @param cumulativeHeights Array of prefix-sum cumulative heights
 * @param target Target scroll position offset
 * @returns The index of the first item at or past target
 */
export function binarySearchVisibleIndex(cumulativeHeights: number[], target: number): number {
  if (cumulativeHeights.length === 0) return 0;

  let lo = 0;
  let hi = cumulativeHeights.length - 1;

  while (lo < hi) {
    const mid = (lo + hi) >>> 1; // Bitwise unsigned right-shift for integer floor division
    if (cumulativeHeights[mid]! < target) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  return lo;
}
