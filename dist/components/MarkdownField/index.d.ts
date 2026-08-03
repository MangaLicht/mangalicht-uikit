import React from 'react';
import type { ValidateOn, ValidationRules } from '@hooks/useValidation';
export interface MarkdownFieldProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value' | 'defaultValue'> {
    /** Текущее значение — если передано, компонент становится управляемым */
    value?: string;
    /** Начальное значение для неуправляемого использования */
    defaultValue?: string;
    /** Колбэк изменения значения (сырой markdown-текст) */
    onChange?: (value: string, event?: React.ChangeEvent<HTMLTextAreaElement>) => void;
    /** Вызывается при каждом пересчёте валидности поля */
    onValidChange?: (isValid: boolean, error: string | null) => void;
    /** Правила валидации — тот же формат, что и у Input */
    rules?: ValidationRules;
    /** Когда пересчитывать ошибку: 'blur' (по умолчанию), 'change' или 'submit' */
    validateOn?: ValidateOn;
    /** Подпись над полем */
    label?: string;
    /** Подсказка под полем, показывается пока нет ошибки */
    hint?: string;
    /** Текст ошибки, заданный снаружи — перекрывает результат внутренней валидации */
    errorMessage?: string;
    /** Минимальная высота в строках до начала роста контейнера вниз */
    minRows?: number;
    /** Максимальная высота в строках — после неё появляется внутренний скролл вместо дальнейшего роста */
    maxRows?: number;
    /** Показывать тулбар форматирования (bold/italic/link/list/code). По умолчанию true */
    showToolbar?: boolean;
    /** Показывать переключатель "Написать / Превью". По умолчанию true */
    showPreviewToggle?: boolean;
    /** Показывать счётчик символов (виден, если задан rules.maxLength) */
    showCounter?: boolean;
    /** Показывать кнопку спойлера в тулбаре. По умолчанию true */
    showSpoilerButton?: boolean;
    classNames?: string;
    wrapperClassName?: string;
}
/**
MarkdownField — многострочное поле ввода с поддержкой markdown:
тулбар форматирования, переключатель "Написать / Превью" и
авто-расширение по высоте (useAutosizeTextarea) — ширина поля не
меняется, длинный текст переносится по словам, а контейнер растёт
вниз вслед за контентом.
Использует тот же useValidation, что и Input, так что правила
(required/minLength/maxLength/pattern/validate) задаются одинаково
для обоих вариантов поля.
Превью рендерится через marked (парсинг markdown → HTML) и
прогоняется через DOMPurify перед вставкой в DOM — исходный текст
контролируется пользователем, поэтому непросанитайзенный HTML
вставлять нельзя ни при каких условиях.
*/
export declare const MarkdownField: React.ForwardRefExoticComponent<MarkdownFieldProps & React.RefAttributes<HTMLTextAreaElement>>;
