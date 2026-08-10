import type { Decorator, Preview } from '@storybook/react'
import { useEffect, type ReactNode } from 'react'
// @ts-ignore: allow importing global SCSS in Storybook preview
import '../src/shared/normalize.scss'
// @ts-ignore: allow importing global SCSS in Storybook preview
import '../src/shared/scss/global-styles.scss'
// @ts-ignore: allow importing global SCSS in Storybook preview
import '../src/shared/theme-vars.scss'

interface ThemeBackgroundProps {
	theme: 'light' | 'dark'
	children: ReactNode
}

const ThemeBackground = ({
	theme,
	children
}: {
	theme: string
	children: React.ReactNode
}) => {
	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme)
	}, [theme])

	return (
		<div data-theme={theme} style={{ width: '100%' }}>
			{children}
		</div>
	)
}

export const withTheme: Decorator = (Story, context) => {
	const theme =
		(context.globals.theme as 'light' | 'dark') ??
		(context.parameters.theme as 'light' | 'dark') ??
		'dark'

	return (
		<ThemeBackground theme={theme}>
			<Story />
		</ThemeBackground>
	)
}

const preview: Preview = {
	decorators: [withTheme],

	globalTypes: {
		theme: {
			name: 'Theme',
			description: 'Глобальная тема UI Kit',
			defaultValue: 'light',
			toolbar: {
				icon: 'circlehollow',
				items: [
					{
						value: 'light',
						title: 'Light',
						icon: 'circlehollow'
					},
					{
						value: 'dark',
						title: 'Dark',
						icon: 'circle'
					}
				]
			}
		}
	},

	parameters: {
		layout: 'centered',

		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		},

		actions: {
			argTypesRegex: '^on[A-Z].*'
		}
	}
}

export default preview
