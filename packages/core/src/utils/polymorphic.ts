/* eslint-disable no-unused-vars */
import type React from 'react';

/**
 * Provides strong typing for components that can render as different HTML elements via the `as` prop.
 *
 * @example
 * type ButtonProps = PolymorphicComponentProp<"button", { variant: "solid" | "outline" }>;
 */
export type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = {},
> = React.PropsWithChildren<Props & Omit<React.ComponentPropsWithoutRef<C>, 'as' | keyof Props>> & {
  /**
   * The HTML element or React component used to render the component, e.g., 'a' or 'span'.
   */
  as?: C;
};

/**
 * Extracts the valid ref type of a given React element type.
 */
export type PolymorphicRef<C extends React.ElementType> = React.ComponentPropsWithRef<C>['ref'];

/**
 * Combines polymorphic props with the correct ref type.
 * Use this when defining the props for a component wrapped in `forwardRef`.
 */
export type PolymorphicComponentPropWithRef<
  C extends React.ElementType,
  Props = {},
> = PolymorphicComponentProp<C, Props> & { ref?: PolymorphicRef<C> };

/**
 * Type for a generic forwardRef component that supports the `as` prop.
 * Cast your forwardRef component to this type to retain generic type inference.
 *
 * @example
 * export const Button = forwardRef(...) as PolymorphicForwardRefComponent<"button", ButtonOptions>;
 */
export type PolymorphicForwardRefComponent<
  DefaultElementType extends React.ElementType,
  Props = {},
> = <C extends React.ElementType = DefaultElementType>(
  props: PolymorphicComponentPropWithRef<C, Props>
) => React.ReactElement | null;
