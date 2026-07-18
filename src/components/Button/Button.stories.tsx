import React from 'react'
import { Button } from './index'

const meta = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'highlight', 'bordered', 'borderedAccent'],
    },
    disabled: { control: 'boolean' },
    labelText: { control: 'text' },
    isAlert: { control: 'boolean' },
  },
};

export default meta;

export const Default = {
  args: {
    labelText: 'Нажми меня',
    variant: 'default',
  },
};

export const Highlight = {
  args: {
    labelText: 'Акцентная кнопка',
    variant: 'highlight',
  },
};

export const Bordered = {
  args: {
    labelText: 'С рамкой',
    variant: 'bordered',
  },
};

export const BorderedAccent = {
  args: {
    labelText: 'С рамкой',
    variant: 'borderedAccent',
  },
};

export const Disabled = {
  args: {
    labelText: 'Недоступно',
    variant: 'default',
    disabled: true,
  },
};

export const WithIcon = {
  name: 'With icons (iconStart / iconEnd)',
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Button
        labelText="Добавить"
        variant="default"
        iconStart={<PlusIcon />}
        onClick={() => {}}
      />
      <Button
        labelText="Продолжить"
        variant="bordered"
        iconEnd={<ArrowRightIcon />}
        onClick={() => {}}
      />
    </div>
  ),
};

export const Transparent = {
  args: {
    labelText: 'Прозрачная',
    style: 'transparent',
  },
};

export const AllVariants = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Button labelText="Default" variant="default" onClick={() => {}} />
      <Button labelText="Highlight" variant="highlight" onClick={() => {}} />
      <Button labelText="Bordered" variant="bordered" onClick={() => {}} />
      <Button labelText="BorderedAccent" variant="borderedAccent" onClick={() => {}} />
      <Button labelText="Transparent" variant="ghost" onClick={() => {}} />
      <Button labelText="Without Anim" variant="default" data-animation='none' onClick={() => {}} />
      <Button labelText="Disabled" variant="default" disabled onClick={() => {}} />
    </div>
  ),
};

const PlusIcon = () => (
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8 2v12M2 8h12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const ArrowRightIcon = () => React.createElement(
  'svg',
  { viewBox: '0 0 16 16', xmlns: 'http://www.w3.org/2000/svg' },
  React.createElement('path', {
    d: 'M3 8h10M9 4l4 4-4 4',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
  }),
);
