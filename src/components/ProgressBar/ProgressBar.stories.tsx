import React, { useEffect, useState } from 'react';
import { ProgressBar } from './index';
import { options } from 'marked';

const meta = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  argTypes: {
    min: { control: 'number' },
    max: { control: 'number' },
    value: { control: 'number' },
    showLabel: { control: 'boolean' },
    fillColor: { 
      options: ['yellow', 'accent'],
      control: { type: 'radio' },
     }
  },
};

export default meta;

/** Как на макете: несколько строк с общей шкалой 0–1000 и разными значениями */
export const Gallery = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 420 }}>
      <ProgressBar min={0} max={1000} value={1000} />
      <ProgressBar min={0} max={1000} value={500} />
      <ProgressBar min={0} max={1000} value={67} />
      <ProgressBar min={0} max={1000} value={2} />
      <ProgressBar min={0} max={1000} value={0} />
    </div>
  ),
};

export const Default = {
  args: {
    min: 0,
    max: 100,
    value: 40,
  },
  render: (args: React.ComponentProps<typeof ProgressBar>) => (
    <div style={{ width: 320 }}>
      <ProgressBar {...args} />
    </div>
  ),
};

export const FillColors = {
  args: {
    min: 0,
    max: 100,
    value: 40,
    fillColor: 'yellow'
  },
  render: (args: React.ComponentProps<typeof ProgressBar>) => (
    <div style={{ width: 320 }}>
      <ProgressBar {...args} />
      <ProgressBar min={0} max={100} value={50} fillColor='accent' />
    </div>
  ),
};

/** showLabel=false — подпись справа убрана */
export const WithoutLabel = {
  args: {
    min: 0,
    max: 100,
    value: 72,
    showLabel: false,
    ariaLabel: 'Прогресс загрузки',
  },
  render: (args: React.ComponentProps<typeof ProgressBar>) => (
    <div style={{ width: 320 }}>
      <ProgressBar {...args} />
    </div>
  ),
};

/** label может быть переопределён — например, показывать проценты вместо сырого value */
export const CustomLabel = {
  args: {
    min: 0,
    max: 250,
    value: 180,
    label: '72%',
  },
  render: (args: React.ComponentProps<typeof ProgressBar>) => (
    <div style={{ width: 320 }}>
      <ProgressBar {...args} />
    </div>
  ),
};

/**
 * Демонстрация того, что min/max можно менять уже после первого рендера —
 * оба значения читаются как обычные пропы на каждый рендер, а не
 * фиксируются один раз при монтировании.
 */
const DynamicRangeDemo = () => {
  const [max, setMax] = useState(100);

  useEffect(() => {
    const timer = setInterval(() => {
      setMax((prev) => (prev === 100 ? 300 : 100));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ width: 320 }}>
      <ProgressBar min={0} max={400} value={max} />
    </div>
  );
};

export const DynamicRange = {
  render: () => <DynamicRangeDemo />,
};
