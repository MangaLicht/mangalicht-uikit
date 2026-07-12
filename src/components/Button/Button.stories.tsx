import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './';

const meta: Meta<typeof Button> = {
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
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    labelText: 'Нажми меня',
    style: 'default',
  },
};

export const Highlight: Story = {
  args: {
    labelText: 'Акцентная кнопка',
    style: 'highlight',
  },
};

export const Bordered: Story = {
  args: {
    labelText: 'С рамкой',
    style: 'bordered',
  },
};

export const BorderedAccent: Story = {
  args: {
    labelText: 'С рамкой',
    style: 'borderedAccent',
  },
};

export const Disabled: Story = {
  args: {
    labelText: 'Недоступно',
    style: 'default',
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Button labelText="Default" style="default" onClick={() => {}} />
      <Button labelText="Highlight" style="highlight" onClick={() => {}} />
      <Button labelText="Bordered" style="bordered" onClick={() => {}} />
      <Button labelText="BorderedAccent" style="borderedAccent" onClick={() => {}} />
      <Button labelText="Disabled" style="default" disabled onClick={() => {}} />
    </div>
  ),
};
