import type { Decorator, Preview } from '@storybook/react'
import { useEffect, type ReactNode } from 'react'
import '../src/shared/normalize.scss'
import '../src/shared/scss/global-styles.scss'
import '../src/shared/theme-vars.scss'

type Theme = 'light' | 'dark'

interface ThemeBackgroundProps {
	theme: Theme
	children: ReactNode
}

const ThemeBackground = ({ theme, children }: ThemeBackgroundProps) => {
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
		(context.globals.theme as Theme | undefined) ??
		(context.parameters.theme as Theme | undefined) ??
		'light'

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
					{ value: 'light', title: 'Light', icon: 'circlehollow' },
					{ value: 'dark', title: 'Dark', icon: 'circle' }
				],
				showName: true
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
