import * as React from 'react';

import { getFocusableElements } from '../utils/focus.js';

/**
 * Custom React hook that traps keyboard focus inside a target container element.
 * Useful for accessible modal dialogs, drawers, popups, and dropdown menus.
 *
 * @param ref - Ref object pointing to the container element
 * @param isActive - Boolean indicating whether the focus trap is active
 */
export function useFocusTrap(ref: React.RefObject<HTMLElement | null>, isActive: boolean): void {
  React.useEffect(() => {
    if (!isActive || !ref.current) return;

    const container = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Move initial focus to the first focusable element inside the container
    const initialElements = getFocusableElements(container);
    if (initialElements.length > 0) {
      initialElements[0]?.focus();
    } else {
      // If container has no focusable children, focus the container itself if focusable
      container.focus();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab') return;

      // Query focusable elements dynamically on each Tab keydown to support DOM mutations
      const focusableElements = getFocusableElements(container);

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab (Backward wrapping)
        if (document.activeElement === firstElement || document.activeElement === container) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab (Forward wrapping)
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      // Restore focus to the previously focused element upon deactivation/unmount
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [isActive, ref]);
}
