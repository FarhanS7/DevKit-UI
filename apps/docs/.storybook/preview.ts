import type { Preview } from '@storybook/react';

// Design system token CSS files will be imported here in Task B.5:
// import '@devkit-ui/tokens/dist/tokens.css';
// import '@devkit-ui/tokens/dist/tokens.dark.css';

// Stub for ThemeBuilder live CSS var injection (wired fully in G.6)
if (typeof window !== 'undefined') {
  // @ts-expect-error adding custom theme channel on window for storybook communication
  window.__STORYBOOK_THEME_CHANNEL__ = {
    applyTokenOverrides: (tokens: Record<string, string>) => {
      for (const [key, value] of Object.entries(tokens)) {
        document.documentElement.style.setProperty(key, value);
      }
    },
  };
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    a11y: {
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        },
      },
    },
  },
};

export default preview;
