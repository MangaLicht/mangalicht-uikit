import type { Decorator, Preview } from '@storybook/react'
import React, { useEffect } from 'react';
// @ts-ignore: allow importing global SCSS in Storybook preview
import '../src/shared/normalize.scss'
// @ts-ignore: allow importing global SCSS in Storybook preview
import '../src/shared/global-styles.scss'
// @ts-ignore: allow importing global SCSS in Storybook preview
import '../src/shared/theme-vars.scss'

const ThemeBackground = ({
  theme,
  children,
}: {
  theme: string;
  children: React.ReactNode;
}) => {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div data-theme={theme} style={{ width: '100%' }}>
      {children}
    </div>
  );
};

export const withTheme: Decorator = (StoryFn, context) => {
  const theme = context.parameters.theme ?? context.globals.theme ?? 'light';

  return (
    <ThemeBackground theme={theme}>
      <StoryFn />
    </ThemeBackground>
  );
};

const preview: Preview = {
  decorators: [withTheme],

  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Глобальная тема для компонентов кита',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'circlehollow', title: 'Light' },
          { value: 'dark', icon: 'circle', title: 'Dark' },
        ],
        showName: true,
      },
    },
  },

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
  },
};

export default preview;