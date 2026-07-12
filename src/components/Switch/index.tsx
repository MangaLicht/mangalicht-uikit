import React, { forwardRef, useEffect, useId, useRef, useState } from 'react';
import styles from './Switch.module.scss';

export interface SwitchProps {
  /** Текущее состояние переключателя */
  checked?: boolean;
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
  /** Размер switch*/
  size?: 'default' | 'small';
}

/**
 * Switch — переключатель (тумблер) с "trail"-анимацией бегунка (капля,
 * растягивающаяся в сторону движения и снова собирающаяся в круг).
 * Бегунок реализован через ::after у .track в Switch.module.scss.
 * Построен на нативном input[type=checkbox] для доступности (клавиатура, screen-readers).
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ checked, onChange, label, disabled = false, name, className, size = 'default' }, ref) => {
    const generatedId = useId();
    const inputId = `uikit-switch-${generatedId}`;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      onChange(event.target.checked);
    };

    const isFirstRender = useRef(true);
    const [animate, setAnimate] = useState(false);
    // data-animate включает keyframe-анимацию в Switch.module.scss при каждом
    // реальном переключении. Сравнивать нужно с ПРЕДЫДУЩИМ значением checked,
    // а не с изначальным — иначе, например, при возврате false → true → false
    // на последнем шаге checked снова совпадёт с исходным значением, и
    // анимация не запустится. isFirstRender нужен только чтобы не проигрывать
    // анимацию на маунте компонента.
    useEffect(() => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      setAnimate(true);
      const t = window.setTimeout(() => setAnimate(false), 500);
      return () => window.clearTimeout(t);
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
        <span
          className={styles.track}
          data-checked={checked}
          data-disabled={disabled}
          data-animate={animate}
          data-size={size}
        />
        {label ? <span className={styles.label}>{label}</span> : null}
      </label>
    );
  },
);

Switch.displayName = 'Switch';
