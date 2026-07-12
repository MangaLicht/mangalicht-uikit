import React, { forwardRef } from 'react';
import styles from './Button.module.scss';

export type ButtonStyle = 'default' | 'highlight' | 'bordered' | 'borderedAccent';

export interface ButtonProps {
  /** Заблокировать кнопку */
  disabled?: boolean;
  /** Дополнительный className для кастомных стилей */
  classNames?: string;
  /** Колбэк клика по кнопке */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Визуальный вариант оформления */
  style?: ButtonStyle;
  /** Текст лейбла внутри кнопки */
  labelText: string;
  /** type для нативного button, по умолчанию "button" */
  type?: 'button' | 'submit' | 'reset';
}

const STYLE_TO_CLASS: Record<ButtonStyle, string> = {
  default: styles.default,
  highlight: styles.highlight,
  bordered: styles.bordered,
  borderedAccent: styles.borderedAccent,
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
      >
        <span>{labelText}</span>
      </button>
    );
  },
);

Button.displayName = 'Button';
