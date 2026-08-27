import type { Meta, StoryObj } from '@storybook/react'

import { StrickBadge } from '../Strick/StrickBadge'

const meta = {
	title: 'Components/Badge/StrickBadge',
	component: StrickBadge,
	parameters: {
		layout: 'centered'
	},
	args: {
		value: 10,
		animated: true
	}
} satisfies Meta<typeof StrickBadge>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LargeStreak: Story = {
	args: {
		value: 99
	}
}

export const AnimationDisabled: Story = {
	args: {
		value: 10,
		animated: false
	}
}
