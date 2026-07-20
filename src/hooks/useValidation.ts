import { useCallback, useEffect, useState } from 'react';

export type ValidateOn = 'change' | 'blur' | 'submit';

export type ValidationRuleWithMessage<T> = T | { value: T; message: string };

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

function normalizeRule<T>(rule: ValidationRuleWithMessage<T>): { value: T; message?: string } {
  if (rule !== null && typeof rule === 'object' && 'value' in (rule as object)) {
    return rule as { value: T; message?: string };
  }
  return { value: rule as T };
}

function runRules(value: string, rules?: ValidationRules): string | null {
  if (!rules) return null;

  if (rules.required && value.trim().length === 0) {
    return typeof rules.required === 'string' ? rules.required : 'Поле обязательно для заполнения';
  }
  if (rules.minLength !== undefined && value.length > 0) {
    const { value: min, message } = normalizeRule(rules.minLength);
    if (value.length < min) return message ?? `Минимум ${min} симв.`;
  }
  if (rules.maxLength !== undefined) {
    const { value: max, message } = normalizeRule(rules.maxLength);
    if (value.length > max) return message ?? `Максимум ${max} симв.`;
  }
  if (rules.pattern !== undefined && value.length > 0) {
    const { value: regex, message } = normalizeRule(rules.pattern);
    if (!regex.test(value)) return message ?? 'Неверный формат';
  }
  if (rules.validate) {
    const result = rules.validate(value);
    if (result) return result;
  }
  return null;
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
export function useValidation(value: string, options: UseValidationOptions = {}) {
  const { rules, validateOn = 'blur', onValidChange } = options;
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const validate = useCallback(
    (val: string = value) => {
      const result = runRules(val, rules);
      setError(result);
      onValidChange?.(result === null, result);
      return result;
    },
    [value, rules, onValidChange],
  );

  useEffect(() => {
    if (!touched || validateOn !== 'change') return;
    const result = runRules(value, rules);
    setError(result);
    onValidChange?.(result === null, result);
    // намеренно не включаем validate/onValidChange/rules в зависимости —
    // пересчёт должен идти по изменению value, а не по пересозданию колбэков
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, touched, validateOn]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    if (validateOn !== 'submit') validate(value);
  }, [validate, value, validateOn]);

  const reset = useCallback(() => {
    setError(null);
    setTouched(false);
  }, []);

  return {
    error,
    isValid: error === null,
    touched,
    validate,
    handleBlur,
    setTouched,
    reset,
  };
}
