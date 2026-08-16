import type { Meta, StoryObj } from '@storybook/react'
import { SimpleBadge } from '../Simple/SimpleBadge'

const meta: Meta<typeof SimpleBadge> = {
	title: 'Components/Badge/Simple',
	component: SimpleBadge,
	parameters: {
		layout: 'centered'
	},
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['primary', 'destructive', 'outline', 'positive'],
			description: 'Визуальный вариант бэйджа'
		},
		label: {
			control: 'text',
			description: 'Текст внутри бэйджа'
		}
	}
}

export default meta
type Story = StoryObj<typeof SimpleBadge>

export const Primary: Story = {
	args: {
		label: 'Primary Badge',
		variant: 'primary'
	}
}

export const Destructive: Story = {
	args: {
		label: 'Destructive Badge',
		variant: 'destructive'
	}
}

export const Outline: Story = {
	args: {
		label: 'Outline Badge',
		variant: 'outline'
	}
}

export const Positive: Story = {
	args: {
		label: 'Positive Badge',
		variant: 'positive'
	}
}
