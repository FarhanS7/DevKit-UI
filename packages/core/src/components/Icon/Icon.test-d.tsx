import { describe, expectTypeOf, it } from 'vitest';
import * as React from 'react';

import { Icon } from './Icon.js';

describe('Icon Component Type Assertions', () => {
  it('enforces aria-hidden or aria-label usage', () => {
    // Valid: aria-hidden provided
    expectTypeOf(<Icon name="Check" aria-hidden="true" />).toEqualTypeOf<React.JSX.Element>();

    // Valid: aria-hidden boolean true
    expectTypeOf(<Icon name="Check" aria-hidden={true} />).toEqualTypeOf<React.JSX.Element>();

    // Valid: aria-label provided
    expectTypeOf(
      <Icon name="Check" aria-label="Confirm check" />
    ).toEqualTypeOf<React.JSX.Element>();

    // @ts-expect-error - Missing both aria-hidden and aria-label
    const MissingBoth = <Icon name="Check" />;

    // @ts-expect-error - Cannot provide both aria-hidden and aria-label
    const InvalidBoth = <Icon name="Check" aria-hidden="true" aria-label="Confirm check" />;

    // Let TS compiler process this file without complaining about unused variables
    expectTypeOf(MissingBoth).toBeAny;
    expectTypeOf(InvalidBoth).toBeAny;
  });
});
