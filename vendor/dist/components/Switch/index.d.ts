import React from 'react';
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked' | 'onChange' | 'type' | 'value' | 'size'> {
    /** Текущее состояние переключателя */
    checked?: boolean;
    /** Колбэк, вызываемый при переключении */
    onChange: (checked: boolean) => void;
    /** Подпись рядом с переключателем */
    labelText?: string;
    /** Заблокировать переключатель */
    disabled?: boolean;
    /** name для нативного input[type=checkbox], полезно для форм */
    name?: string;
    /** Размер switch*/
    size?: 'default' | 'small';
}
/**
 * Switch — переключатель (тумблер) с "trail"-анимацией бегунка (капля,
 * растягивающаяся в сторону движения и снова собирающаяся в круг).
 * Бегунок реализован через ::after у .track в Switch.module.scss.
 * Построен на нативном input[type=checkbox] для доступности (клавиатура, screen-readers).
 */
export declare const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLInputElement>>;
