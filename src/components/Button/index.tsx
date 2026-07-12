import React, { forwardRef } from 'react';
import styles from './Button.module.scss';

export type ButtonStyle = 'default' | 'highlight' | 'bordered' | 'borderedAccent' | 'transparent';

export interface ButtonProps 
{
  /** Заблокировать кнопку */
  disabled?: boolean;
  /** Дополнительный className для кастомных стилей */
  classNames?: string;
  /** Колбэк клика по кнопке */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Визуальный вариант оформления */
  style?: ButtonStyle;
  /** Текст лейбла внутри кнопки */
  labelText?: string;
  /** type для нативного button, по умолчанию "button" */
  type?: 'button' | 'submit' | 'reset';
  /** Дочерний элемент (например, svg-иконка) перед текстом лейбла */
  iconStart?: React.ReactNode;
  /** Дочерний элемент (например, svg-иконка) после текста лейбла */
  iconEnd?: React.ReactNode;
}

const STYLE_TO_CLASS: Record<ButtonStyle, string> = {
  default: styles.default,
  highlight: styles.highlight,
  bordered: styles.bordered,
  borderedAccent: styles.borderedAccent,
  transparent: styles.transparent,
};

/**
 * Button — базовая кнопка с тремя вариантами оформления:
 * "default" (залитая основным цветом), "highlight" (акцентная на подложке)
 * и "bordered" (прозрачная с рамкой).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      disabled = false,
      classNames,
      onClick,
      style = 'default',
      labelText,
      type = 'button',
      iconStart,
      iconEnd,
      ...rest
    },
    ref,
  ) => {
    const variantClass = STYLE_TO_CLASS[style] ?? styles.default;

    return (
      <button
        ref={ref}
        type={type}
        className={[styles.button, variantClass, classNames]
          .filter(Boolean)
          .join(' ')}
        disabled={disabled}
        onClick={onClick}
        {...rest}
      >
        {iconStart ? (
          <span className={styles.icon} aria-hidden="true">
            {iconStart}
          </span>
        ) : null}
        {labelText && <span>{labelText}</span>}
        {iconEnd ? (
          <span className={styles.icon} aria-hidden="true">
            {iconEnd}
          </span>
        ) : null}
      </button>
    );
  },
);

Button.displayName = 'Button';
