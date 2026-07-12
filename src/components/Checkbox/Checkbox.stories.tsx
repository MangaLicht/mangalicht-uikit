import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  argTypes: {
    style: {
      control: 'select',
      options: ['default', 'radio'],
    },
    disabled: { control: 'boolean' },
    labelText: { control: 'text' },
    checked: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

/** Управляемый пример с реальным состоянием React — для интерактивных историй */
const ControlledCheckbox = (args: React.ComponentProps<typeof Checkbox>) => {
  const [checked, setChecked] = useState(args.checked ?? false);
  return (
    <Checkbox
      {...args}
      checked={checked}
      onClick={(next) => {
        setChecked(next);
        args.onClick?.(next);
      }}
    />
  );
};

export const Default: Story = {
  render: ControlledCheckbox,
  args: {
    checked: false,
    style: 'default',
    labelText: 'Согласен с условиями',
  },
};

export const Radio: Story = {
  render: ControlledCheckbox,
  args: {
    checked: false,
    style: 'radio',
    labelText: 'Круглый вариант',
  },
};

export const CheckedByDefault: Story = {
  render: ControlledCheckbox,
  args: {
    checked: true,
    style: 'default',
    labelText: 'Отмечено по умолчанию',
  },
};

export const Disabled: Story = {
  render: ControlledCheckbox,
  args: {
    checked: false,
    disabled: true,
    style: 'default',
    labelText: 'Недоступно',
  },
};

export const DisabledChecked: Story = {
  render: ControlledCheckbox,
  args: {
    checked: true,
    disabled: true,
    style: 'default',
    labelText: 'Недоступно (отмечено)',
  },
};

export const WithoutLabel: Story = {
  render: ControlledCheckbox,
  args: {
    checked: false,
    style: 'default',
  },
};

export const Uncontrolled: Story = {
  name: 'Uncontrolled (defaultChecked)',
  render: () => (
    <Checkbox
      defaultChecked
      style="default"
      labelText="Неуправляемый режим"
      onClick={(checked) => console.log('checked:', checked)}
    />
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 24 }}>
        <Checkbox labelText="Default" style="default" defaultChecked={false} />
        <Checkbox labelText="Default checked" style="default" defaultChecked />
        <Checkbox labelText="Default disabled" style="default" disabled />
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        <Checkbox labelText="Radio" style="radio" defaultChecked={false} />
        <Checkbox labelText="Radio checked" style="radio" defaultChecked />
        <Checkbox
          labelText="Radio disabled"
          style="radio"
          disabled
          defaultChecked
        />
      </div>
    </div>
  ),
};