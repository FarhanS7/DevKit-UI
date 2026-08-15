import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface PortalProps {
  /** Content to render inside the portal. */
  children: React.ReactNode;
  /**
   * Target DOM element to render children into.
   * Defaults to `document.body` when `null` or `undefined`.
   */
  container?: HTMLElement | null;
}

/**
 * Portal — renders children into a DOM node outside the parent hierarchy.
 *
 * Uses a client-side mount guard (`useEffect`) so the component is SSR-safe:
 * it returns `null` on the server and only calls `createPortal` after hydration.
 *
 * Even though the DOM output lives elsewhere, React's synthetic event system
 * still bubbles events through the React component tree as expected.
 */
const Portal = ({ children, container }: PortalProps) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const targetContainer = container ?? document.body;
  return ReactDOM.createPortal(children, targetContainer);
};

Portal.displayName = 'Portal';

export { Portal };
