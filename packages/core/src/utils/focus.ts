/**
 * Selector that matches all elements natively capable of receiving keyboard focus,
 * provided they are not disabled or explicitly removed from the tab order.
 */
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]:not([contenteditable="false"])',
  'details>summary:first-of-type',
].join(',');

/**
 * Checks if an element is visible in the DOM.
 * It traverses up the tree to ensure no parent has `display: none` or `visibility: hidden`.
 * (Note: offsetWidth/offsetHeight checks are often skipped here because test environments like JSDOM don't compute layout)
 *
 * @param element - The HTML element to check
 * @returns boolean indicating if the element is visible
 */
export function isElementVisible(element: HTMLElement): boolean {
  if (!element || !element.ownerDocument || !element.ownerDocument.defaultView) {
    return true;
  }

  const computedStyle = element.ownerDocument.defaultView.getComputedStyle(element);
  if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
    return false;
  }

  // Recursively check parents until we hit the root Document object
  if (element.parentElement) {
    return isElementVisible(element.parentElement);
  }

  return true;
}

/**
 * Determines if an element can receive keyboard focus.
 *
 * @param element - The HTML element to check
 * @returns boolean
 */
export function isElementFocusable(element: HTMLElement): boolean {
  if (!element.matches(FOCUSABLE_SELECTOR)) {
    return false;
  }
  return isElementVisible(element);
}

/**
 * Traverses a container and returns all focusable descendants in layout DOM order.
 * This is crucial for trap focus logic inside modals and dialogs.
 *
 * @param container - The DOM node to search within
 * @returns Array of focusable HTML elements
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return elements
    .filter(el => isElementFocusable(el))
    .sort((a, b) => {
      // Ensure deterministic DOM layout order, bypassing querySelectorAll grouped selector quirks
      if (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING) {
        return 1;
      }
      if (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) {
        return -1;
      }
      return 0;
    });
}
