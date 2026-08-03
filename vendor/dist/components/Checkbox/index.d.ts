import React from 'react';
export type CheckboxVariant = 'default' | 'radio';
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked' | 'defaultChecked' | 'onChange' | 'onClick' | 'type' | 'value'> {
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
    variant?: CheckboxVariant;
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
export declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLInputElement>>;
