import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './index';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

/** Управляемый пример с реальным состоянием React */
const ControlledSwitch = (args: React.ComponentProps<typeof Switch>) => {
  const [checked, setChecked] = useState(args.checked);
  return <Switch {...args} checked={checked} onChange={setChecked} />;
};

export const Default: Story = {
  render: ControlledSwitch,
  args: {
    checked: false,
    label: 'Включить уведомления',
  },
};

export const CheckedByDefault: Story = {
  render: ControlledSwitch,
  args: {
    checked: true,
    label: 'Тёмная тема',
  },
};

export const Disabled: Story = {
  render: ControlledSwitch,
  args: {
    checked: false,
    disabled: true,
    label: 'Недоступно',
  },
};

export const WithoutLabel: Story = {
  render: ControlledSwitch,
  args: {
    checked: false,
  },
};
