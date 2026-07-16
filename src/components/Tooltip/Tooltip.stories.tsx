import React from 'react';
import { Tooltip } from './index'
import { Button } from '../Button'

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'bottom'],
    },
    disabled: { control: 'boolean' },
    offset: { control: 'number' },
    showDelay: { control: 'number' },
    cursorLag: { control: 'number' },
    content: { control: 'text' },
  },
  // parameters.layout убран — используется глобальный 'centered' из .storybook/preview.ts
};

export default meta;

// простая кнопка-триггер многоразового использования в историях
const TriggerButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    style={{
      padding: '8px 16px',
      borderRadius: 8,
      border: '1px solid #cbd5e1',
      background: '#fff',
      cursor: 'pointer',
      font: 'inherit',
    }}
  >
    Наведи на меня
  </button>
);

export const Top = {
  args: {
    content: 'Подсказка сверху',
    position: 'top',
  },
  render: (args: any) => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Tooltip {...args}>
        <Button labelText='Button' />
      </Tooltip>
    </div>
  ),
};

export const Bottom = {
  args: {
    content: 'Подсказка снизу',
    position: 'bottom',
  },
  render: (args: any) => (
    <Tooltip {...args}>
      <TriggerButton />
    </Tooltip>
  ),
};

export const LongContent = {
  args: {
    content:
      'Длинный текст подсказки, который переносится на несколько строк благодаря max-width в стилях компонента',
    position: 'top',
  },
  render: (args: any) => (
    <Tooltip {...args}>
      <TriggerButton />
    </Tooltip>
  ),
};

export const Disabled = {
  args: {
    content: 'Эта подсказка никогда не появится',
    position: 'top',
    disabled: true,
  },
  render: (args: any) => (
    <Tooltip {...args}>
      <TriggerButton />
    </Tooltip>
  ),
};

export const NoDelay = {
  name: 'Instant show (showDelay = 0)',
  args: {
    content: 'Появляется мгновенно',
    position: 'top',
    showDelay: 0,
  },
  render: (args: any) => (
    <Tooltip {...args}>
      <TriggerButton />
    </Tooltip>
  ),
};

export const OnPlainText = {
  name: 'On a plain HTML tag',
  args: {
    content: 'Работает и на обычном span',
    position: 'top',
  },
  render: (args: any) => (
    <Tooltip {...args}>
      <span style={{ textDecoration: 'underline dotted', cursor: 'help' }}>
        Текст с подсказкой
      </span>
    </Tooltip>
  ),
};

export const MultipleTriggers = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <Tooltip content="Подсказка сверху" position="top">
        <TriggerButton />
      </Tooltip>
      <Tooltip content="Подсказка снизу" position="bottom">
        <TriggerButton />
      </Tooltip>
      <Tooltip content="У иконки тоже работает" position="top">
        <span style={{ fontSize: 20, cursor: 'help' }}>ℹ️</span>
      </Tooltip>
    </div>
  ),
};