import {
  forwardRef,
  memo,
  useId,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type TextareaHTMLAttributes,
} from 'react'
import { EyeIcon, PencilIcon } from '@/icons/Markdown'
import { useValidation } from '@/hooks/useValidation'
import type { ValidateOn, ValidationRules } from '@/hooks/useValidation'
import { TabList } from '../TabList'
import { MarkdownField } from './MarkdownField'
import { MarkdownInput } from './MarkdownInput'
import styles from './MarkdownField.module.scss'

export interface MarkdownCommentProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'onFocus' | 'maxLength'
  > {
  /** Текущее значение. Если не передано, компонент работает в uncontrolled-режиме. */
  value?: string
  /** Начальное значение для uncontrolled-режима. */
  defaultValue?: string
  /** Изменение Markdown-текста. */
  onChange?: (value: string, event?: ChangeEvent<HTMLTextAreaElement>) => void
  /** Максимальная длина. Если не задана, используется rules.maxLength. */
  maxLength?: number
  /** Правила валидации. */
  rules?: ValidationRules
  /** Момент запуска валидации. */
  validateOn?: ValidateOn
  /** Вызывается при каждом пересчёте валидности. */
  onValidChange?: (isValid: boolean, error: string | null) => void
  /** Внешнее сообщение об ошибке. Имеет приоритет над результатом useValidation. */
  errorMessage?: string
  /** Подсказка под полем, если ошибки нет. */
  hint?: string
  /** Подпись над полем. */
  label?: string
  /** Показывать переключатель «Написать / Превью». */
  showPreviewToggle?: boolean
  /** Показывать счётчик символов. */
  showCounter?: boolean
  /** Показывать Markdown-toolbar. */
  showToolbar?: boolean
  /** Минимальное количество строк редактора. */
  minRows?: number
  /** Максимальное количество строк редактора. */
  maxRows?: number
  /** Размер истории Undo/Redo. */
  historySize?: number
  /** Показывать кнопку спойлера в toolbar. */
  showSpoilerButton?: boolean
  /** Дополнительный класс корневого контейнера. */
  wrapperClassName?: string
  /** Дополнительный класс textarea. */
  textareaClassName?: string
  /** Blur textarea. */
  onBlur?: (event: FocusEvent<HTMLTextAreaElement>) => void
  /** Focus textarea. */
  onFocus?: (event: FocusEvent<HTMLTextAreaElement>) => void
}

type Mode = 'write' | 'preview'

const getRuleValue = (
  rule: ValidationRules['maxLength'],
): number | undefined => {
  if (rule === undefined) return undefined
  return typeof rule === 'object' ? rule.value : rule
}

export const MarkdownComment = memo(
  forwardRef<HTMLTextAreaElement, MarkdownCommentProps>(
    (
      {
        value: controlledValue,
        defaultValue = '',
        onChange,
        maxLength,
        rules,
        validateOn = 'blur',
        onValidChange,
        errorMessage,
        hint,
        label,
        showPreviewToggle = true,
        showCounter = true,
        showToolbar = true,
        minRows = 4,
        maxRows,
        historySize = 100,
        showSpoilerButton = true,
        wrapperClassName,
        textareaClassName,
        disabled = false,
        placeholder,
        onBlur,
        onFocus,
        id,
        className,
        ...rest
      },
      forwardedRef,
    ) => {
      const generatedId = useId()
      const fieldId = id ?? `uikit-markdown-comment-${generatedId}`
      const messageId = `${fieldId}-message`

      const isControlled = controlledValue !== undefined
      const [internalValue, setInternalValue] = useState(defaultValue)
      const currentValue = isControlled ? controlledValue ?? '' : internalValue
      const [mode, setMode] = useState<Mode>('write')
      const [focused, setFocused] = useState(false)

      const effectiveMaxLength = maxLength ?? getRuleValue(rules?.maxLength)

      const effectiveRules: ValidationRules | undefined =
        maxLength !== undefined
          ? { ...rules, maxLength }
          : rules

      const { error: validationError, handleBlur } = useValidation(
        currentValue,
        {
          rules: effectiveRules,
          validateOn,
          onValidChange,
        },
      )

      const displayError = errorMessage ?? validationError
      const isInvalid = Boolean(displayError)

      const handleChange = (
        nextValue: string,
        event?: ChangeEvent<HTMLTextAreaElement>,
      ) => {
        if (!isControlled) setInternalValue(nextValue)
        onChange?.(nextValue, event)
      }

      const handleFieldBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
        setFocused(false)
        handleBlur()
        onBlur?.(event)
      }

      const handleFieldFocus = (event: FocusEvent<HTMLTextAreaElement>) => {
        setFocused(true)
        onFocus?.(event)
      }

      const tabs = [
        { id: 'write', label: 'Написать', icon: <PencilIcon /> },
        { id: 'preview', label: 'Превью', icon: <EyeIcon /> },
      ]

      return (
        <div className={[styles.wrapper, wrapperClassName].filter(Boolean).join(' ')}>
          {label || (showPreviewToggle && !disabled) ? (
            <div className={styles.header}>
              {label ? (
                <label htmlFor={fieldId} className={styles.label}>
                  {label}
                </label>
              ) : (
                <span />
              )}

              {showPreviewToggle && !disabled ? (
                <TabList
                  tabs={tabs}
                  activeTab={mode}
                  onTabChange={(tabId) => setMode(tabId as Mode)}
                />
              ) : null}
            </div>
          ) : null}

          <div
            className={styles.fieldWrapper}
            data-focus={focused}
            data-invalid={isInvalid}
            data-disabled={disabled}
          >
            {mode === 'write' ? (
              <MarkdownInput
                ref={forwardedRef}
                id={fieldId}
                value={currentValue}
                onChange={handleChange}
                onBlur={handleFieldBlur}
                onFocus={handleFieldFocus}
                placeholder={placeholder}
                disabled={disabled}
                minRows={minRows}
                maxRows={maxRows}
                historySize={historySize}
                showToolbar={showToolbar}
                maxLength={effectiveMaxLength}
                className={undefined}
                textareaClassName={[className, textareaClassName].filter(Boolean).join(' ') || undefined}
                {...rest}
              />
            ) : (
              <MarkdownField
                markdown={currentValue}
                emptyText='Нечего показать'
              />
            )}
          </div>

          <div className={styles.footer}>
            {displayError ? (
              <span
                id={messageId}
                className={styles.message}
                data-variant='error'
                role='alert'
              >
                {displayError}
              </span>
            ) : hint ? (
              <span id={messageId} className={styles.message}>
                {hint}
              </span>
            ) : (
              <span />
            )}

            {showCounter && effectiveMaxLength !== undefined ? (
              <span
                className={styles.counter}
                data-over={currentValue.length > effectiveMaxLength}
              >
                {currentValue.length} / {effectiveMaxLength}
              </span>
            ) : (
              <span />
            )}
          </div>
        </div>
      )
    },
  ),
)

MarkdownComment.displayName = 'MarkdownComment'
