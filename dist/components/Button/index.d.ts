import React, { ButtonHTMLAttributes } from 'react';
export type ButtonAnimation = 'default' | 'none';
export type ButtonVariants = 'default' | 'highlight' | 'bordered' | 'borderedAccent' | 'ghost' | 'transparent';
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type' | 'variant'> {
    /** Заблокировать кнопку */
    disabled?: boolean;
    /** Дополнительный className для кастомных стилей */
    classNames?: string;
    /** Колбэк клика по кнопке */
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    /** Визуальный вариант оформления */
    variant?: ButtonVariants;
    /** пометка что кнопка должна быть окрашена в красный */
    isAlert?: boolean;
    /** Текст лейбла внутри кнопки */
    labelText?: string;
    /** type для нативного button, по умолчанию "button" */
    type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
    /** Дочерний элемент (например, svg-иконка) перед текстом лейбла */
    iconStart?: React.ReactNode;
    /** Дочерний элемент (например, svg-иконка) после текста лейбла */
    iconEnd?: React.ReactNode;
    /** Режимы анимации */
    animation?: ButtonAnimation;
}
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
