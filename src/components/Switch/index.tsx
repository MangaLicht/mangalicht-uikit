import React, { forwardRef, useId, useEffect, useState, useRef } from 'react';
import styles from './Switch.module.scss';

export interface SwitchProps {
  /** Текущее состояние переключателя */
  checked: boolean;
  /** Колбэк, вызываемый при переключении */
  onChange: (checked: boolean) => void;
  /** Подпись рядом с переключателем */
  label?: string;
  /** Заблокировать переключатель */
  disabled?: boolean;
  /** name для нативного input[type=checkbox], полезно для форм */
  name?: string;
  /** Дополнительный className для обёртки */
  className?: string;
}

/**
 * Switch — переключатель (тумблер) с плавной анимацией движения "бегунка".
 * Построен на нативном input[type=checkbox] для доступности (клавиатура, screen-readers),
 * визуальная часть анимируется через CSS transition.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ checked, onChange, label, disabled = false, name, className }, ref) => {
    const generatedId = useId();
    const inputId = `uikit-switch-${generatedId}`;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      onChange(event.target.checked);
    };

    const initialChecked = useRef(checked);
    const [animate, setAnimate] = useState(false);
    useEffect(() => {
      if (initialChecked.current !== checked) {
        setAnimate(true);
        const t = window.setTimeout(() => setAnimate(false), 500);
        return () => window.clearTimeout(t);
      }
    }, [checked]);

    return (
      <label
        htmlFor={inputId}
        className={[styles.wrapper, className].filter(Boolean).join(' ')}
        data-disabled={disabled}
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          name={name}
          className={styles.input}
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          role="switch"
          aria-checked={checked}
        />
        <span className={styles.track} data-checked={checked} data-disabled={disabled} data-animate={animate}></span>
        {label ? <span className={styles.label}>{label}</span> : null}
      </label>
    );
  },
);

Switch.displayName = 'Switch';
