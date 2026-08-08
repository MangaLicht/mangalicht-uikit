import React, { forwardRef, useId } from 'react'
import styles from './Switch.module.scss'
import { useAnimationTrigger } from '@/hooks/useAnimationTrigger'

export interface SwitchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'checked' | 'onChange' | 'type' | 'value' | 'size'
> {
  /** Текущее состояние переключателя */
  checked: boolean
  /** Колбэк, вызываемый при переключении */
  onChange: (checked: boolean) => void
  /** Подпись рядом с переключателем */
  labelText?: string
  /** Заблокировать переключатель */
  disabled?: boolean
  /** name для нативного input[type=checkbox], полезно для форм */
  name?: string
  /** Размер switch*/
  size?: 'default' | 'small'
}

/**
 * Switch — переключатель (тумблер) с "trail"-анимацией бегунка (капля,
 * растягивающаяся в сторону движения и снова собирающаяся в круг).
 * Бегунок реализован через ::after у .track в Switch.module.scss.
 * Построен на нативном input[type=checkbox] для доступности (клавиатура, screen-readers).
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    { checked, onChange, labelText: label, disabled = false, name, className, size = 'default' },
    ref,
  ) => {
    const generatedId = useId()
    const inputId = `uikit-switch-${generatedId}`

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return
      onChange(event.target.checked)
    }

    const animate = useAnimationTrigger(checked, 500)

    return (
      <label
        htmlFor={inputId}
        className={[styles.wrapper, className].filter(Boolean).join(' ')}
        data-disabled={disabled}
      >
        <input
          ref={ref}
          id={inputId}
          type='checkbox'
          name={name}
          className={styles.input}
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          role='switch'
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
    )
  },
)

Switch.displayName = 'Switch'
