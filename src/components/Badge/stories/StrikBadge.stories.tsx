import type { Meta, StoryObj } from '@storybook/react'

import { StrikBadge } from '../Strik/StrikBadge'

const meta = {
	title: 'Components/Badge/StrikBadge',
	component: StrikBadge,
	parameters: {
		layout: 'centered'
	},
	args: {
		value: 10,
		animated: true
	}
} satisfies Meta<typeof StrikBadge>

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
