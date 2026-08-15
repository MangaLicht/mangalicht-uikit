import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { MarkdownField, type MarkdownFieldProps } from './index'
import { MarkdownInput, type MarkdownInputProps } from './MarkdownInput'

const meta = {
  title: 'Components/MarkdownField',
  component: MarkdownInput,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MarkdownInput>

export default meta

type Story = StoryObj<typeof meta>

const ControlledInput = (args: MarkdownInputProps) => {
  const [value, setValue] = useState(args.value ?? args.defaultValue ?? '')

  return (
    <div style={{ width: 520 }}>
      <MarkdownInput
        {...args}
        value={value}
        // Убираем ручной setValue здесь, так как history внутри сам вызывает onChange
        onChange={(next) => {
          setValue(next)
          args.onChange?.(next)
        }}
        onToolbarAction={(action) => {
          console.log(`Toolbar action: ${action}`)
          args.onToolbarAction?.(action)
        }}
      />
    </div>
  )
}

export const Input: Story = {
  render: ControlledInput,
  args: {
    placeholder: 'Выделите текст — появится плавающий тулбар',
    defaultValue: 'Выделите **любой фрагмент текста** и попробуйте форматирование.',
  },
}

export const InputWithHistory: Story = {
  render: ControlledInput,
  args: {
    defaultValue: 'Введите несколько изменений, затем используйте Ctrl/Cmd + Z и Ctrl/Cmd + Shift + Z.',
  },
}

export const Preview: Story = {
  render: (args) => (
    <div style={{ width: 520 }}>
      <MarkdownField {...(args as MarkdownFieldProps)} />
    </div>
  ),
  args: {
    markdown:
      '# Заголовок\n\nЭто **жирный текст**, _курсив_ и `inline code`.\n\n- Первый пункт\n- Второй пункт\n\n[Ссылка](https://example.com)',
  },
}

export const PreviewWithSpoiler: Story = {
  render: (args) => (
    <div style={{ width: 520 }}>
      <MarkdownField {...(args as MarkdownFieldProps)} />
    </div>
  ),
  args: {
    markdown: 'Обычный текст и [spoiler]скрытая информация[/spoiler].',
  },
}