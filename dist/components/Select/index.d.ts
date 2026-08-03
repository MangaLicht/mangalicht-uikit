import React from 'react';
export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}
export interface SelectProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'defaultValue' | 'onChange' | 'children' | 'type'> {
    /** Список опций */
    options: SelectOption[];
    /** Текущее значение — если передано, компонент становится управляемым */
    value?: string;
    /** Начальное значение для неуправляемого использования */
    defaultValue?: string;
    /** Колбэк выбора, получает value выбранной опции */
    onChange?: (value: string) => void;
    /** Заблокировать select */
    disabled?: boolean;
    /** Дополнительный className для кастомных стилей */
    classNames?: string;
    /** Текст-заглушка, когда ничего не выбрано */
    placeholder?: string;
    /** name для скрытого input, полезно для нативных форм */
    name?: string;
    /** ручное указание минимальной ширины контейнера */
    minWidth?: number;
}
/**
 * Select — кастомный выпадающий список, построенный на архитектурных
 * паттернах остального кита:
 *  - forwardRef + controlled/uncontrolled гибрид (как Checkbox)
 *  - {...rest} проброс нативных атрибутов button (как Button/Switch —
 *    например, чтобы Tooltip мог навесить обработчики через cloneElement)
 *  - выпадающая панель рендерится в портал document.body,
 *    чтобы не резалась overflow/z-index родителей
 *  - позиционирование и закрытие по клику вне вынесены в переиспользуемые
 *    хуки useAnchoredPosition / useClickOutside
 *  - доступность: паттерн collapsible listbox с aria-activedescendant —
 *    фокус остаётся на триггере, стрелки/Enter/Escape работают с клавиатуры
 */
export declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLButtonElement>>;
