import * as React from 'react';

/**
 * Custom React hook that locks background document scrolling when overlays (modals, drawers) are open.
 * Uses position: fixed and scrollbar width padding compensation to prevent layout shifts.
 *
 * @param lock - Boolean indicating whether scrolling should be locked
 */
export function useScrollLock(lock: boolean): void {
  React.useEffect(() => {
    if (!lock || typeof document === 'undefined') return;

    // 1. Record original inline styles
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    const originalPaddingRight = document.body.style.paddingRight;

    // 2. Compute scrollbar width and current vertical scroll offset
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const scrollY = window.scrollY;

    // 3. Apply scroll locking styles to body
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      // 4. Restore original inline styles
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      document.body.style.paddingRight = originalPaddingRight;

      // 5. Restore vertical scroll position
      window.scrollTo(0, scrollY);
    };
  }, [lock]);
}
