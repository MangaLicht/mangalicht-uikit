import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { Toggle } from './'

const meta = {
	title: 'Components/Toggle',
	component: Toggle,
	parameters: {
		layout: 'centered'
	},
	tags: ['autodocs'],
	argTypes: {
		checked: {
			control: 'boolean',
			description: 'Controlled state of the Toggle.'
		},
		defaultChecked: {
			control: 'boolean',
			description: 'Initial state for uncontrolled Toggle.'
		},
		disabled: {
			control: 'boolean'
		},
		toggleDisabled: {
			control: 'boolean'
		},
		variant: {
			control: 'select'
		},
		activeVariant: {
			control: 'select'
		},
		onCheckedChange: {
			action: 'checked changed',
			table: {
				disable: true
			}
		}
	}
} satisfies Meta<typeof Toggle>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		labelText: 'Toggle',
		variant: 'ghost',
		activeVariant: 'highlight'
	}
}

export const Checked: Story = {
	args: {
		labelText: 'Toggle',
		checked: true,
		variant: 'ghost',
		activeVariant: 'highlight'
	}
}

export const Unchecked: Story = {
	args: {
		labelText: 'Toggle',
		checked: false,
		variant: 'ghost',
		activeVariant: 'highlight'
	}
}

export const DefaultChecked: Story = {
	args: {
		labelText: 'Toggle',
		defaultChecked: true,
		variant: 'ghost',
		activeVariant: 'highlight'
	}
}

export const Disabled: Story = {
	args: {
		labelText: 'Toggle',
		disabled: true,
		variant: 'ghost',
		activeVariant: 'highlight'
	}
}

export const DisabledChecked: Story = {
	args: {
		labelText: 'Toggle',
		checked: true,
		disabled: true,
		variant: 'ghost',
		activeVariant: 'highlight'
	}
}

export const ToggleDisabled: Story = {
	args: {
		labelText: 'Toggle',
		toggleDisabled: true,
		variant: 'ghost',
		activeVariant: 'highlight'
	}
}

export const Controlled: Story = {
	render: args => {
		const [checked, setChecked] = useState(args.checked ?? false)

		return (
			<Toggle
				{...args}
				checked={checked}
				onCheckedChange={nextChecked => {
					setChecked(nextChecked)
				}}
			/>
		)
	},

	args: {
		labelText: 'Controlled Toggle',
		checked: false,
		variant: 'ghost',
		activeVariant: 'highlight'
	}
}

export const WithIcon: Story = {
	args: {
		ariaLabel: 'Bold',
		title: 'Bold',
		iconStart: <strong>B</strong>,
		variant: 'ghost',
		activeVariant: 'highlight'
	}
}

export const MarkdownToolbar: Story = {
	render: args => {
		const [bold, setBold] = useState(false)
		const [italic, setItalic] = useState(false)

		return (
			<div
				style={{
					display: 'flex',
					gap: 4,
					padding: 6
				}}
			>
				<Toggle
					{...args}
					checked={bold}
					iconStart={<strong>B</strong>}
					aria-label='Bold'
					title='Bold'
					onCheckedChange={setBold}
				/>

				<Toggle
					{...args}
					checked={italic}
					iconStart={<em>I</em>}
					aria-label='Italic'
					title='Italic'
					onCheckedChange={setItalic}
				/>
			</div>
		)
	},

	args: {
		variant: 'ghost',
		activeVariant: 'highlight'
	}
}
