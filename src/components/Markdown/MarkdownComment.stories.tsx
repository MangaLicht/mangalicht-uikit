import type { Meta, StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'
import { useState } from 'react'
import { MarkdownComment } from './MarkdownComment'

const meta = {
	title: 'Components/Markdown/MarkdownComment',
	component: MarkdownComment,
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		value: { control: 'text' },
		defaultValue: { control: 'text' },
		maxLength: { control: 'number' },
		disabled: { control: 'boolean' },
		showPreviewToggle: { control: 'boolean' },
		showCounter: { control: 'boolean' },
		showToolbar: { control: 'boolean' },
		label: { control: 'text' },
		placeholder: { control: 'text' },
		hint: { control: 'text' }
	}
} satisfies Meta<typeof MarkdownComment>

export default meta
type Story = StoryObj<typeof meta>

const Controlled = (args: ComponentProps<typeof MarkdownComment>) => {
	const [value, setValue] = useState(args.value ?? args.defaultValue ?? '')

	return (
		<div style={{ width: 520 }}>
			<MarkdownComment
				{...args}
				value={value}
				historySize={100}
				onChange={(next, event) => {
					setValue(next)
					args.onChange?.(next, event)
				}}
			/>
		</div>
	)
}

export const Basic: Story = {
	render: args => <Controlled {...args} />,
	args: {
		label: 'Комментарий',
		placeholder: 'Напишите комментарий...'
	}
}

export const WithCharacterLimit: Story = {
	render: args => <Controlled {...args} />,
	args: {
		label: 'Комментарий',
		placeholder: 'До 280 символов',
		maxLength: 280
	}
}

export const WithValidation: Story = {
	render: args => <Controlled {...args} />,
	args: {
		label: 'Комментарий',
		placeholder: 'Минимум 10 символов',
		rules: {
			required: 'Комментарий обязателен',
			minLength: {
				value: 10,
				message: 'Комментарий должен содержать минимум 10 символов'
			},
			maxLength: {
				value: 280,
				message: 'Максимум 280 символов'
			}
		},
		validateOn: 'change',
		hint: 'После ввода ошибка обновляется автоматически'
	}
}

export const WithoutPreviewToggle: Story = {
	render: args => <Controlled {...args} />,
	args: {
		label: 'Комментарий',
		showPreviewToggle: false,
		placeholder: 'Превью отключено'
	}
}

export const Disabled: Story = {
	render: args => <Controlled {...args} />,
	args: {
		label: 'Комментарий',
		disabled: true,
		defaultValue: 'Этот комментарий недоступен для редактирования.'
	}
}

export const ReadyMarkdownPreview: Story = {
	render: args => <Controlled {...args} />,
	args: {
		label: 'Комментарий',
		defaultValue:
			'# Готовый комментарий\n\n**Жирный текст**, *курсив* и [ссылка](https://example.com).\n\n- Первый пункт\n- Второй пункт\n\n[spoiler]Скрытый текст[/spoiler]',
		hint: 'Переключитесь на «Превью», чтобы увидеть результат.'
	}
}
