import { Button } from './index'
import { Plus, ArrowRight } from 'lucide-react'

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
        iconStart={<Plus aria-hidden="true" />}
        onClick={() => {}}
      />
      <Button
        labelText="Продолжить"
        variant="bordered"
        iconEnd={<ArrowRight aria-hidden="true" />}
        onClick={() => {}}
      />
    </div>
  ),
};

export const Ghost = {
  args: {
    labelText: 'Прозрачная',
    variant: 'ghost',
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

