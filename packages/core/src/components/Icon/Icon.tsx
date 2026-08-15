import * as React from 'react';

// Central registry for dynamic imports
export const iconRegistry = {
  ArrowRight: React.lazy(() => import('./icons/ArrowRight.js')),
  Check: React.lazy(() => import('./icons/Check.js')),
  X: React.lazy(() => import('./icons/X.js')),
} as const;

export type IconName = keyof typeof iconRegistry;

export type BaseIconProps = {
  /** The name of the icon to render from the registry. */
  name: IconName;
  /** Width and height in pixels. Defaults to 24. */
  size?: number;
  className?: string;
} & Omit<React.SVGProps<SVGSVGElement>, 'width' | 'height'>;

/**
 * Discriminated union to strictly enforce accessibility requirements.
 * Icons must either be marked as purely decorative (`aria-hidden="true"`)
 * or be provided an accessible description (`aria-label`).
 */
export type IconProps = BaseIconProps &
  (
    | { 'aria-hidden': 'true' | true; 'aria-label'?: never }
    | { 'aria-label': string; 'aria-hidden'?: never }
  );

/**
 * Icon — an accessible, lazy-loaded SVG rendering component.
 *
 * It pulls assets dynamically to keep the initial JavaScript bundle tiny,
 * showing an appropriately sized empty fallback block while downloading.
 */
const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 24, className, ...props }, ref) => {
    const LazyIcon = iconRegistry[name];

    return (
      <React.Suspense
        fallback={
          <span style={{ width: size, height: size }} className="inline-block" aria-hidden="true" />
        }
      >
        <LazyIcon
          ref={ref}
          className={className}
          style={{ width: size, height: size }}
          {...props}
        />
      </React.Suspense>
    );
  }
);

Icon.displayName = 'Icon';

export { Icon };
