import React, { useState } from 'react';
import { Switch } from './index';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
};

export default meta;

/** Управляемый пример с реальным состоянием React */
const ControlledSwitch = (args: any) => {
  const [checked, setChecked] = useState(args.checked);
  return <Switch {...args} checked={checked} onChange={setChecked} />;
};

export const Default = {
  render: ControlledSwitch,
  args: {
    checked: false,
    label: 'Включить уведомления',
  },
};

export const CheckedByDefault = {
  render: ControlledSwitch,
  args: {
    checked: true,
    label: 'Тёмная тема',
  },
};

export const Disabled = {
  render: ControlledSwitch,
  args: {
    checked: false,
    disabled: true,
    label: 'Недоступно',
  },
};

export const WithoutLabel = {
  render: ControlledSwitch,
  args: {
    checked: false,
  },
};

const SizesRender = () => {
  const [checkedDefault, setCheckedDefault] = useState(false);
  const [checkedSmall, setCheckedSmall] = useState(false);

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <Switch checked={checkedDefault} size='default' label='обычный' onChange={setCheckedDefault} />
      <Switch checked={checkedSmall} size='small' label='маленький' onChange={setCheckedSmall} />
    </div>
  );
};

export const Sizes = {
  render: () => React.createElement(SizesRender, null),
};
