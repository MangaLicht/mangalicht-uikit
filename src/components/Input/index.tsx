import React, { forwardRef, useCallback, useId, useRef, useState } from 'react'
import { useValidation } from '@hooks/useValidation'
import type { ValidateOn, ValidationRules } from '@hooks/useValidation'
import { X } from 'lucide-react'
import styles from './Input.module.scss'

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue'> {
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
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      value,
      defaultValue = '',
      onChange,
      onValidChange,
      rules,
      validateOn = 'blur',
      label,
      hint,
      errorMessage,
      clearable = false,
      icon,
      disabled = false,
      className,
      classNames,
      wrapperClassName,
      id,
      onBlur,
      ...rest
    },
    forwardedRef,
  ) => {
    const generatedId = useId();
    const inputId = id ?? `uikit-input-${generatedId}`;
    const messageId = `${inputId}-message`;

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const currentValue = isControlled ? value ?? '' : internalValue;

    const innerRef = useRef<HTMLInputElement | null>(null);
    const setRef = useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );

    const { error: validationError, handleBlur } = useValidation(currentValue, {
      rules,
      validateOn,
      onValidChange,
    });

    const displayError = errorMessage ?? validationError;
    const isInvalid = Boolean(displayError);

    const emitChange = (next: string, event?: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next, event);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      emitChange(event.target.value, event);
    };

    const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      handleBlur();
      onBlur?.(event);
    };

    const handleClear = () => {
      emitChange('');
      innerRef.current?.focus();
    };

    return (
      <div className={[styles.wrapper, wrapperClassName].filter(Boolean).join(' ')}>
        {label ? (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        ) : null}

        <div className={styles.fieldWrapper} data-invalid={isInvalid} data-disabled={disabled}>
          {icon ? (
            <span className={styles.icon} aria-hidden="true">
              {icon}
            </span>
          ) : null}

          <input
            ref={setRef}
            id={inputId}
            className={[styles.input, className, classNames].filter(Boolean).join(' ')}
            value={currentValue}
            disabled={disabled}
            aria-invalid={isInvalid}
            aria-describedby={displayError || hint ? messageId : undefined}
            onChange={handleChange}
            onBlur={handleInputBlur}
            {...rest}
          />

          {clearable && currentValue && !disabled ? (
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClear}
              aria-label="Очистить поле"
              tabIndex={-1}
            >
              <X aria-hidden='true' />
            </button>
          ) : null}
        </div>

        {displayError ? (
          <span id={messageId} className={styles.message} data-variant="error" role="alert">
            {displayError}
          </span>
        ) : hint ? (
          <span id={messageId} className={styles.message}>
            {hint}
          </span>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
