# Walkthrough: Task D.2 — Portal

## What was built

A server-safe `Portal` wrapper component that uses `ReactDOM.createPortal` to render child elements into alternative DOM containers (defaulting to `document.body`).

## Why it was built this way

1.  **SSR Safety**: A common issue with portals in Next.js/SSR environments is that `document` is undefined on the server. The `Portal` component uses a `useState` and `useEffect` hook pattern to ensure that the portal is only rendered _after_ the component has mounted on the client. On the server, it simply returns `null`, preventing hydration mismatches or server crashes.
2.  **Flexibility**: The `container` prop allows the consumer to specify exactly where the portal should be injected. If not provided, it gracefully defaults to `document.body`.
3.  **Accessibility**: By moving elements like dialogs or tooltips to the root of the DOM, we avoid issues with `overflow: hidden` or `z-index` stacking contexts from parent elements, ensuring that these floating elements are always fully visible and interactable.

## Verification

- **Tests**: Comprehensive unit tests verify that children are rendered into `document.body` by default, into custom containers when provided, and that the component correctly returns nothing during the initial (SSR-like) render pass.
- **Axe-Core**: The component was tested with `jest-axe` to ensure no accessibility violations are introduced by the portal rendering mechanism itself.
