import React from 'react';
import type { ValidateOn, ValidationRules } from '@hooks/useValidation';
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue'> {
    /** Текущее значение — если передано, компонент становится управляемым */
    value?: string;
    /** Начальное значение для неуправляемого использования */
    defaultValue?: string;
    /** Колбэк изменения значения */
    onChange?: (value: string, event?: React.ChangeEvent<HTMLInputElement>) => void;
    /** Вызывается при каждом пересчёте валидности поля */
    onValidChange?: (isValid: boolean, error: string | null) => void;
    /** Правила валидации — required/minLength/maxLength/pattern/validate */
    rules?: ValidationRules;
    /** Когда пересчитывать ошибку: 'blur' (по умолчанию), 'change' или 'submit' (только через ручной вызов validate) */
    validateOn?: ValidateOn;
    /** Подпись над полем */
    label?: string;
    /** Подсказка под полем, показывается пока нет ошибки */
    hint?: string;
    /** Текст ошибки, заданный снаружи — перекрывает результат внутренней валидации (для серверных ошибок) */
    errorMessage?: string;
    /** Показывать кнопку очистки поля, когда есть значение */
    clearable?: boolean;
    /** Иконка слева (например, лупа для поисковой строки) */
    icon?: React.ReactNode;
    /** Дополнительный className на сам input (как в остальных компонентах кита) */
    classNames?: string;
    /** className на корневой контейнер (label + поле + подсказка) */
    wrapperClassName?: string;
}
/**
 * Input — однострочное поле ввода текста с валидацией "из коробки".
 * Подходит как для обычных текстовых полей (email, имя), так и для
 * поисковой строки — см. проп icon/clearable и story "Search".
 *
 * Архитектурно повторяет паттерны остального кита:
 *  - forwardRef + controlled/uncontrolled гибрид (как Checkbox/Select)
 *  - {...rest} проброс нативных атрибутов input
 *  - валидация вынесена в переиспользуемый хук useValidation, тот же
 *    хук использует MarkdownField — правила задаются одинаково для
 *    обоих вариантов поля
 */
export declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
