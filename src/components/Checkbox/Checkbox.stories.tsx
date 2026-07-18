import React, { useState } from 'react';
import { Checkbox } from './index';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'radio'],
    },
    disabled: { control: 'boolean' },
    labelText: { control: 'text' },
    checked: { control: 'boolean' },
  },
};

export default meta;

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

export const Default = {
  render: ControlledCheckbox,
  args: {
    checked: false,
    variant: 'default',
    labelText: 'Согласен с условиями',
  },
};

export const Radio = {
  render: ControlledCheckbox,
  args: {
    checked: false,
    variant: 'radio',
    labelText: 'Круглый вариант',
  },
};

export const CheckedByDefault = {
  render: ControlledCheckbox,
  args: {
    checked: true,
    variant: 'default',
    labelText: 'Отмечено по умолчанию',
  },
};

export const Disabled = {
  render: ControlledCheckbox,
  args: {
    checked: false,
    disabled: true,
    variant: 'default',
    labelText: 'Недоступно',
  },
};

export const DisabledChecked = {
  render: ControlledCheckbox,
  args: {
    checked: true,
    disabled: true,
    variant: 'default',
    labelText: 'Недоступно (отмечено)',
  },
};

export const WithoutLabel = {
  render: ControlledCheckbox,
  args: {
    checked: false,
    variant: 'default',
  },
};

export const Uncontrolled = {
  name: 'Uncontrolled (defaultChecked)',
  render: () => (
    <Checkbox
      defaultChecked
      variant="default"
      labelText="Неуправляемый режим"
      onClick={(checked) => console.log('checked:', checked)}
    />
  ),
};

export const AllVariants = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 24 }}>
        <Checkbox labelText="Default" variant="default" defaultChecked={false} />
        <Checkbox labelText="Default checked" variant="default" defaultChecked />
        <Checkbox labelText="Default disabled" variant="default" disabled />
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        <Checkbox labelText="Radio" variant="radio" defaultChecked={false} />
        <Checkbox labelText="Radio checked" variant="radio" defaultChecked />
        <Checkbox
          labelText="Radio disabled"
          variant="radio"
          disabled
          defaultChecked
        />
      </div>
    </div>
  ),
};