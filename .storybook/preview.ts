import type { Preview } from '@storybook/react';
// @ts-ignore: allow importing global SCSS in Storybook preview
import '../src/shared/global-vars.scss'

const preview: Preview = {
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
