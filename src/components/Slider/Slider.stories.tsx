import React, { useState } from 'react';
import { Slider } from './index';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  argTypes: {
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
    showLabel: { control: 'boolean' },
  },
};

export default meta;

/** Управляемый пример с реальным состоянием React — для интерактивных историй */
const ControlledSlider = (args: React.ComponentProps<typeof Slider>) => {
  const [value, setValue] = useState(args.value ?? args.defaultValue ?? args.min ?? 0);
  return (
    <div style={{ width: 320 }}>
      <Slider
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next);
          args.onChange?.(next);
        }}
      />
    </div>
  );
};

export const Default = {
  render: ControlledSlider,
  args: {
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 40,
  },
};

/** Шаг больше 1 — например, для выбора количества штук */
export const Step = {
  render: ControlledSlider,
  args: {
    min: 0,
    max: 20,
    step: 5,
    defaultValue: 10,
  },
};

/** showLabel=false — подпись со значением убрана */
export const WithoutLabel = {
  render: ControlledSlider,
  args: {
    min: 0,
    max: 100,
    defaultValue: 65,
    showLabel: false,
  },
};

/** label может быть переопределён — например, показывать единицы измерения */
export const CustomLabel = {
  render: (args: React.ComponentProps<typeof Slider>) => {
    const [value, setValue] = useState(args.defaultValue ?? 0);
    return (
      <div style={{ width: 320 }}>
        <Slider {...args} value={value} onChange={setValue} label={`${value}%`} />
      </div>
    );
  },
  args: {
    min: 0,
    max: 100,
    defaultValue: 30,
  },
};

export const Disabled = {
  render: ControlledSlider,
  args: {
    min: 0,
    max: 100,
    defaultValue: 55,
    disabled: true,
  },
};

/** min/max можно менять уже после первого рендера — как и в ProgressBar */
const DynamicRangeDemo = () => {
  const [max, setMax] = useState(100);
  const [value, setValue] = useState(50);

  return (
    <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Slider min={0} max={max} value={value} onChange={setValue} />
      <button type="button" onClick={() => setMax((prev) => (prev === 100 ? 300 : 100))}>
        Переключить max: {max === 100 ? '100 → 300' : '300 → 100'}
      </button>
    </div>
  );
};

export const DynamicRange = {
  render: () => <DynamicRangeDemo />,
};
