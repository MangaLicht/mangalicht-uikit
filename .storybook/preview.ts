import type { Preview } from '@storybook/react'
// @ts-ignore: allow importing global SCSS in Storybook preview
import '../src/shared/normalize.scss'
// @ts-ignore: allow importing global SCSS in Storybook preview
import '../src/shared/global-vars.scss'
// @ts-ignore: allow importing global SCSS in Storybook preview
//import '../src/shared/theme-mode-vars.scss'
// @ts-ignore: allow importing global SCSS in Storybook preview
import '../src/shared/global-styles.scss'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports: {
      },
        disable: false,
      },
    layout: 'centered',
  },
};

export default preview;
