import type { StorybookConfig } from '@storybook/react-vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],

	addons: ['@storybook/addon-docs'],

	framework: {
		name: '@storybook/react-vite',
		options: {}
	},

	docs: {},

	viteFinal: async config => {
		config.resolve ??= {}
		config.resolve.alias = {
			...(config.resolve.alias || {}),
			'@': path.resolve(__dirname, '../src'),
			'@components': path.resolve(__dirname, '../src/components'),
			'@hooks': path.resolve(__dirname, '../src/hooks'),
			'@shared': path.resolve(__dirname, '../src/shared'),
			'@icons': path.resolve(__dirname, '../src/icons')
		}

		return config
	}
}

export default config
