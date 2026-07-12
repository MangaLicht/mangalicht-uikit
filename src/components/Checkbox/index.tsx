import React, { forwardRef, useId, useState } from 'react';
import styles from './Checkbox.module.scss';

export type CheckboxStyle = 'default' | 'radio';

export interface CheckboxProps {
  /** Текущее состояние — если передано, компонент становится управляемым (controlled) */
  checked?: boolean;
  /** Начальное состояние для неуправляемого (uncontrolled) использования */
  defaultChecked?: boolean;
  /** Заблокировать чекбокс */
  disabled?: boolean;
  /** Дополнительный className для кастомных стилей */
  classNames?: string;
  /** Колбэк переключения, получает новое значение checked */
  onClick?: (checked: boolean) => void;
  /** Визуальный вариант: "default" (квадратный) или "radio" (круглый) */
  style?: CheckboxStyle;
  /** Текст лейбла рядом с чекбоксом */
  labelText?: string;
  /** name для нативного input, полезно для форм */
  name?: string;
}

/**
 * Checkbox — переключаемый чекбокс с двумя вариантами оформления:
 * "default" (квадратный со скруглёнными углами) и "radio" (круглый).
 * Галочка появляется с плавной анимацией (opacity + scale), сама область
 * плавно меняет фон/рамку. Поддерживает controlled и uncontrolled режимы.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      defaultChecked = false,
      disabled = false,
      classNames,
      onClick,
      style = 'default',
      labelText,
      name,
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = `uikit-checkbox-${generatedId}`;

    const isControlled = checked !== undefined;
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const currentChecked = isControlled ? checked : internalChecked;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const next = event.target.checked;
      if (!isControlled) setInternalChecked(next);
      onClick?.(next);
    };

    return (
      <label
        htmlFor={inputId}
        className={[styles.wrapper, classNames].filter(Boolean).join(' ')}
        data-disabled={disabled}
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          name={name}
          className={styles.input}
          checked={currentChecked}
          disabled={disabled}
          onChange={handleChange}
        />
        <span
          className={styles.box}
          data-checked={currentChecked}
          data-disabled={disabled}
          data-style={style}
        >
          <svg
            className={styles.checkmark}
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M3 8.5L6.5 12L13 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {labelText ? <span>{labelText}</span> : null}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';