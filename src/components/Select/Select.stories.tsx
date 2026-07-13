import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './';
import type { SelectOption } from './';

const fruitOptions: SelectOption[] = [
  { value: 'apple', label: 'Яблоко' },
  { value: 'banana', label: 'Банан' },
  { value: 'cherry', label: 'Вишня', disabled: true },
  { value: 'mango', label: 'Манго' },
  { value: 'kiwi', label: 'Киви' },
];

const longOptions: SelectOption[] = Array.from({ length: 20 }, (_, i) => ({
  value: `item-${i + 1}`,
  label: `Пункт списка ${i + 1}`,
}));

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  argTypes: {
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
    options: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

/** Управляемый пример с реальным состоянием React — для интерактивных историй */
const ControlledSelect = (args: React.ComponentProps<typeof Select>) => {
  const [value, setValue] = useState(args.value ?? args.defaultValue);
  return (
    <Select
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

export const Default: Story = {
  render: ControlledSelect,
  args: {
    options: fruitOptions,
    placeholder: 'Выберите фрукт',
  },
};

export const WithPreselectedValue: Story = {
  render: ControlledSelect,
  args: {
    options: fruitOptions,
    value: 'banana',
  },
};

export const WithDisabledOption: Story = {
  name: 'With a disabled option (Вишня)',
  render: ControlledSelect,
  args: {
    options: fruitOptions,
    placeholder: 'Одна из опций недоступна',
  },
};

export const Disabled: Story = {
  render: ControlledSelect,
  args: {
    options: fruitOptions,
    placeholder: 'Select полностью недоступен',
    disabled: true,
  },
};

export const LongScrollableList: Story = {
  name: 'Long list (internal scroll)',
  render: ControlledSelect,
  args: {
    options: longOptions,
    placeholder: 'Список длиннее max-height панели',
  },
};

export const Uncontrolled: Story = {
  name: 'Uncontrolled (defaultValue)',
  render: () => (
    <Select
      options={fruitOptions}
      defaultValue="apple"
      onChange={(value) => console.log('selected:', value)}
    />
  ),
};

/**
 * Демонстрирует, что панель рендерится через портал в document.body —
 * даже если родительский контейнер обрезает overflow, выпадающий список
 * всё равно раскрывается поверх него, а не прячется под маской.
 */
export const InsideOverflowContainer: Story = {
  name: 'Inside overflow:hidden container',
  render: () => (
    <div
      style={{
        width: 260,
        height: 120,
        overflow: 'hidden',
        border: '1px dashed #cbd5e1',
        borderRadius: 8,
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      <Select
        options={fruitOptions}
        placeholder="Открой меня внутри рамки"
        onChange={() => {}}
      />
    </div>
  ),
};

export const MultipleSelectsSideBySide: Story = {
  name: 'Multiple selects',
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Select options={fruitOptions} placeholder="Первый" onChange={() => {}} />
      <Select options={longOptions} placeholder="Второй (длинный список)" onChange={() => {}} />
    </div>
  ),
};