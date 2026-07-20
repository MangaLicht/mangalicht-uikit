import React, { forwardRef, useCallback, useId, useMemo, useRef, useState } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useValidation } from '@hooks/useValidation'
import type { ValidateOn, ValidationRules } from '@hooks/useValidation'
import { useAutosizeTextarea } from '@hooks/useAutosizeTextarea'
import { BoldIcon, ItalicIcon, LinkIcon, ListIcon, CodeIcon, EyeIcon, PencilIcon } from '@icons/Markdown'
import styles from './MarkdownField.module.scss'
export interface MarkdownFieldProps

extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value' | 'defaultValue'> {
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

type ToolbarAction = 'bold' | 'italic' | 'link' | 'list' | 'code' | 'spoiler'

interface InsertResult {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

/** Оборачивает выделенный текст маркерами (или вставляет плейсхолдер, если выделения нет) */
function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder: string,
): InsertResult {
  const { selectionStart, selectionEnd, value } = textarea;
  const hasSelection = selectionEnd > selectionStart;
  const selected = hasSelection ? value.slice(selectionStart, selectionEnd) : placeholder;
  const nextValue = value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd);
  return {
    value: nextValue,
    selectionStart: selectionStart + before.length,
    selectionEnd: selectionStart + before.length + selected.length,
  };
}

/** Добавляет префикс ("- ") к каждой выделенной строке (или к текущей строке курсора) */
function prefixLines(textarea: HTMLTextAreaElement, prefix: string): InsertResult {
  const { selectionStart, selectionEnd, value } = textarea;
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
  let lineEnd = value.indexOf('\n', selectionEnd);
  if (lineEnd === -1) lineEnd = value.length;
  const block = value.slice(lineStart, lineEnd);
  const prefixedBlock = block
    .split('\n')
    .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line}`))
    .join('\n');
  const nextValue = value.slice(0, lineStart) + prefixedBlock + value.slice(lineEnd);
  return {
    value: nextValue,
    selectionStart: lineStart,
    selectionEnd: lineStart + prefixedBlock.length,
  };
}

function applyToolbarAction(textarea: HTMLTextAreaElement, action: ToolbarAction): InsertResult {
  switch (action) {
    case 'bold':
      return wrapSelection(textarea, '**', '**', 'жирный текст');
    case 'italic':
      return wrapSelection(textarea, '_', '_', 'курсив');
    case 'code':
      return wrapSelection(textarea, '`', '`', 'код');
    case 'link':
      return wrapSelection(textarea, '[', '](https://)', 'текст ссылки');
    case 'list':
      return prefixLines(textarea, '- ');
    case 'spoiler':
      return wrapSelection(textarea, '[spoiler]', '[/spoiler]', 'скрытый текст');
    default:
      return { value: textarea.value, selectionStart: textarea.selectionStart, selectionEnd: textarea.selectionEnd };
  }
}

// Кастомный рендерер для обработки спойлеров
const spoilerExtension = {
  name: 'spoiler',
  level: 'inline',
  start(src: string) {
    return src.indexOf('[spoiler]');
  },
  tokenizer(src: string) {
    const match = /^\[spoiler\]([\s\S]*?)\[\/spoiler\]/.exec(src);
    if (match) {
      return {
        type: 'spoiler',
        raw: match[0],
        text: match[1],
      };
    }
  },
  renderer(token: any) {
    return `<span class="${styles.spoiler}" data-spoiler="true">${token.text}</span>`;
  },
};

marked.use({ extensions: [spoilerExtension] });

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
export const MarkdownField = forwardRef<HTMLTextAreaElement, MarkdownFieldProps>(
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
      minRows = 4,
      maxRows,
      showToolbar = true,
      showPreviewToggle = true,
      showCounter = false,
      showSpoilerButton = true,
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
    const fieldId = id ?? `uikit-markdown-${generatedId}`;
    const messageId = `${fieldId}-message`;
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const currentValue = isControlled ? value ?? '' : internalValue;
    const [mode, setMode] = useState<'write' | 'preview'>('write');
    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    const setRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );
    useAutosizeTextarea(innerRef, currentValue, { minRows, maxRows, enabled: mode === 'write' });
    const { error: validationError, handleBlur } = useValidation(currentValue, {
      rules,
      validateOn,
      onValidChange,
    });
    const displayError = errorMessage ?? validationError;
    const isInvalid = Boolean(displayError);
    const emitChange = (next: string, event?: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next, event);
    };
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      emitChange(event.target.value, event);
    };
    const handleFieldBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
      handleBlur();
      onBlur?.(event);
    };
    const runToolbarAction = (action: ToolbarAction) => {
      const textarea = innerRef.current;
      if (!textarea || disabled) return;
      const result = applyToolbarAction(textarea, action);
      emitChange(result.value);
      // выставляем выделение и возвращаем фокус в поле уже после того,
      // как React отрисует новое значение — иначе перетрётся браузером
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
      });
    };
    const previewHtml = useMemo(() => {
      if (mode !== 'preview' || typeof window === 'undefined') return '';
      const rawHtml = marked.parse(currentValue, { breaks: true, async: false }) as string;
      return DOMPurify.sanitize(rawHtml);
    }, [mode, currentValue]);

    const handleSpoilerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.dataset.spoiler === 'true') {
        target.classList.toggle(styles.spoilerRevealed);
      }
    }, []);

    const maxLengthRule = rules?.maxLength;
    const maxLengthValue = typeof maxLengthRule === 'object' ? maxLengthRule.value : maxLengthRule;
    return (
      <div className={[styles.wrapper, wrapperClassName].filter(Boolean).join(' ')}>
        {label || (showPreviewToggle && !disabled) ? (
          <div className={styles.header}>
            {label ? (
              <label htmlFor={fieldId} className={styles.label}>
                {label}
              </label>
            ) : <span />}
            {showPreviewToggle && !disabled ? (
              <div className={styles.modeSwitch} role="tablist" aria-label="Режим редактора">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'write'}
                  className={styles.modeButton}
                  data-active={mode === 'write'}
                  onClick={() => setMode('write')}
                >
                  <PencilIcon /> Написать
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'preview'}
                  className={styles.modeButton}
                  data-active={mode === 'preview'}
                  onClick={() => setMode('preview')}
                >
                  <EyeIcon /> Превью
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
        <div className={styles.fieldWrapper} data-invalid={isInvalid} data-disabled={disabled}>
          {showToolbar && mode === 'write' ? (
            <div className={styles.toolbar}>
              <button type="button" className={styles.toolbarButton} title="Жирный (**текст**)" disabled={disabled} onClick={() => runToolbarAction('bold')}>
                <BoldIcon />
              </button>
              <button type="button" className={styles.toolbarButton} title="Курсив (_текст_)" disabled={disabled} onClick={() => runToolbarAction('italic')}>
                <ItalicIcon />
              </button>
              <button type="button" className={styles.toolbarButton} title="Код (`текст`)" disabled={disabled} onClick={() => runToolbarAction('code')}>
                <CodeIcon />
              </button>
              <button type="button" className={styles.toolbarButton} title="Ссылка" disabled={disabled} onClick={() => runToolbarAction('link')}>
                <LinkIcon />
              </button>
              <button type="button" className={styles.toolbarButton} title="Список" disabled={disabled} onClick={() => runToolbarAction('list')}>
                <ListIcon />
              </button>
              {showSpoilerButton && (
                <button type="button" className={styles.toolbarButton} title="Спойлер ([spoiler]текст[/spoiler])" disabled={disabled} onClick={() => runToolbarAction('spoiler')}>
                  <span className={styles.spoilerIcon}>S</span>
                </button>
              )}
            </div>
          ) : null}
          {mode === 'write' ? (
            <textarea
              ref={setRef}
              id={fieldId}
              className={[styles.textarea, className, classNames].filter(Boolean).join(' ')}
              value={currentValue}
              disabled={disabled}
              rows={minRows}
              aria-invalid={isInvalid}
              aria-describedby={displayError || hint ? messageId : undefined}
              onChange={handleChange}
              onBlur={handleFieldBlur}
              {...rest}
            />
          ) : (
            <div
              className={styles.preview}
              onClick={handleSpoilerClick}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: previewHtml || '<p><em>Нечего показать</em></p>' }}
            />
          )}
        </div>
        <div className={styles.footer}>
          {displayError ? (
            <span id={messageId} className={styles.message} data-variant="error" role="alert">
              {displayError}
            </span>
          ) : hint ? (
            <span id={messageId} className={styles.message}>
              {hint}
            </span>
          ) : <span />}
          {showCounter && maxLengthValue ? (
            <span className={styles.counter} data-over={currentValue.length > maxLengthValue}>
              {currentValue.length} / {maxLengthValue}
            </span>
          ) : null}
        </div>
      </div>
    );
  },
);
MarkdownField.displayName = 'MarkdownField';