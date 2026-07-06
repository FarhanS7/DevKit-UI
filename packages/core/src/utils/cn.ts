import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Conditionally joins classNames together and deterministically merges tailwind classes.
 * `clsx` runs FIRST to resolve conditional logic, then `twMerge` eliminates styling conflicts.
 *
 * @param inputs - Any number of class values (strings, objects, arrays, undefined, null)
 * @returns A single merged string of tailwind classes without conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
