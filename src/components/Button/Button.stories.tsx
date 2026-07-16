import React from 'react'
import { Button } from './index'

const meta = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    style: {
      control: 'select',
      options: ['default', 'highlight', 'bordered', 'borderedAccent'],
    },
    disabled: { control: 'boolean' },
    labelText: { control: 'text' },
  },
};

export default meta;

export const Default = {
  args: {
    labelText: 'Нажми меня',
    style: 'default',
  },
};

export const Highlight = {
  args: {
    labelText: 'Акцентная кнопка',
    style: 'highlight',
  },
};

export const Bordered = {
  args: {
    labelText: 'С рамкой',
    style: 'bordered',
  },
};

export const BorderedAccent = {
  args: {
    labelText: 'С рамкой',
    style: 'borderedAccent',
  },
};

export const Disabled = {
  args: {
    labelText: 'Недоступно',
    style: 'default',
    disabled: true,
  },
};

export const WithIcon = {
  name: 'With icons (iconStart / iconEnd)',
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Button
        labelText="Добавить"
        style="default"
        iconStart={<PlusIcon />}
        onClick={() => {}}
      />
      <Button
        labelText="Продолжить"
        style="bordered"
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
      <Button labelText="Default" style="default" onClick={() => {}} />
      <Button labelText="Highlight" style="highlight" onClick={() => {}} />
      <Button labelText="Bordered" style="bordered" onClick={() => {}} />
      <Button labelText="BorderedAccent" style="borderedAccent" onClick={() => {}} />
      <Button labelText="Transparent" style="transparent" onClick={() => {}} />
      <Button labelText="Without Anim" style="default" data-animation='none' onClick={() => {}} />
      <Button labelText="Disabled" style="default" disabled onClick={() => {}} />
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
