import React, { forwardRef, useState } from 'react'
import styles from './Slider.module.scss'

export interface SliderProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value' | 'defaultValue' | 'min' | 'max' | 'step' | 'type'
  > {
  /** Текущее значение — если передано, компонент становится управляемым */
  value?: number;
  /** Начальное значение для неуправляемого использования (по умолчанию — min) */
  defaultValue?: number;
  /** Колбэк изменения значения */
  onChange?: (value: number, event?: React.ChangeEvent<HTMLInputElement>) => void;
  /** Минимальное значение шкалы. По умолчанию 0 */
  min?: number;
  /** Максимальное значение шкалы. По умолчанию 100 */
  max?: number;
  /** Шаг изменения значения. По умолчанию 1 */
  step?: number;
  /** Показывать подпись со значением справа от ползунка. По умолчанию true */
  showLabel?: boolean;
  /** Переопределяет содержимое подписи (по умолчанию — само value) */
  label?: React.ReactNode;
  /** className на сам input */
  classNames?: string;
  /** className на корневой контейнер (ползунок + подпись) */
  wrapperClassName?: string;
}

/**
 * Slider — построен поверх нативного input[type="range"] (тот же подход,
 * что и в Switch/Checkbox): клавиатурная навигация (стрелки, Home/End,
 * PageUp/PageDown), touch-драг и ARIA-семантика slider приходят из
 * браузера бесплатно — переопределяется только визуал через
 * ::-webkit-slider-thumb/::-moz-range-thumb, а трек и заливка "прогресса"
 * рисуются отдельными div'ами позади input (родной track делается
 * прозрачным). Все три слоя выровнены через CSS grid-stacking — все
 * попадают в одну ячейку грида и накладываются друг на друга.
 *
 * min/max/step/value — обычные пропы, читаются на каждый рендер, поэтому
 * шкалу можно свободно менять в рантайме — как и в ProgressBar.
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      min = 0,
      max = 100,
      step = 1,
      showLabel = true,
      label,
      disabled = false,
      className,
      classNames,
      wrapperClassName,
      ...rest
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue ?? min);
    const currentValue = isControlled ? value : internalValue;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = Number(event.target.value);
      if (!isControlled) setInternalValue(next);
      onChange?.(next, event);
    };

    // та же защита от max <= min, что и в ProgressBar — не даём проценту уйти в NaN/Infinity
    const safeMax = max > min ? max : min + 1;
    const clampedValue = Math.min(Math.max(currentValue, min), safeMax);
    const percentage = ((clampedValue - min) / (safeMax - min)) * 100;

    return (
      <div className={[styles.wrapper, wrapperClassName].filter(Boolean).join(' ')}>
        <div className={styles.sliderArea} data-disabled={disabled}>
          <div className={styles.track} />
          <div className={styles.fill} style={{ width: `${percentage}%` }} />
          <input
            ref={ref}
            type="range"
            className={[styles.input, className, classNames].filter(Boolean).join(' ')}
            min={min}
            max={max}
            step={step}
            value={currentValue}
            disabled={disabled}
            onChange={handleChange}
            {...rest}
          />
        </div>

        {showLabel ? <span className={styles.label}>{label ?? currentValue}</span> : null}
      </div>
    );
  },
);

Slider.displayName = 'Slider';
