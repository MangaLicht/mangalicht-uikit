export type ValidateOn = 'change' | 'blur' | 'submit';
export type ValidationRuleWithMessage<T> = T | {
    value: T;
    message: string;
};
export interface ValidationRules {
    /** Значение обязательно (пустая строка/только пробелы — ошибка). Можно передать свой текст ошибки вместо true */
    required?: boolean | string;
    /** Минимальная длина строки. Не проверяется для пустого значения — за это отвечает required */
    minLength?: ValidationRuleWithMessage<number>;
    /** Максимальная длина строки */
    maxLength?: ValidationRuleWithMessage<number>;
    /** Регулярное выражение, которому должно соответствовать непустое значение */
    pattern?: ValidationRuleWithMessage<RegExp>;
    /** Произвольный валидатор: верните текст ошибки, либо falsy, если всё ок */
    validate?: (value: string) => string | null | undefined | false;
}
interface UseValidationOptions {
    rules?: ValidationRules;
    /** Когда пересчитывать ошибку: по каждому изменению, по потере фокуса (по умолчанию) или только вручную (submit) */
    validateOn?: ValidateOn;
    /** Вызывается при каждом пересчёте валидности — удобно для onValidChange в самом поле */
    onValidChange?: (isValid: boolean, error: string | null) => void;
}
/**
 * useValidation — синхронный валидатор для текстовых полей (Input,
 * MarkdownField и т.п.). Хук не знает ничего про верстку конкретного
 * поля — только про строковое значение и набор правил.
 *
 * По умолчанию (validateOn='blur') ошибка не показывается, пока поле не
 * "тронуто" — это стандартная практика для форм, чтобы не пугать
 * пользователя ошибкой "обязательно к заполнению" на первый же кадр.
 * После первого blur, если validateOn='change', ошибка пересчитывается
 * на каждое изменение — чтобы она сразу пропадала по мере исправления.
 *
 * Если передать объект rules инлайном на каждый рендер (частый паттерн),
 * эффект ниже будет чуть чаще пересчитывать валидность, чем строго
 * необходимо — сама валидация синхронная и дешёвая, так что это не
 * проблема производительности, просто лишние вызовы onValidChange.
 */
export declare function useValidation(value: string, options?: UseValidationOptions): {
    error: string | null;
    isValid: boolean;
    touched: boolean;
    validate: (val?: string) => string | null;
    handleBlur: () => void;
    setTouched: import("react").Dispatch<import("react").SetStateAction<boolean>>;
    reset: () => void;
};
export {};
