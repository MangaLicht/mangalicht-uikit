import React, { useState } from 'react';
import { MarkdownField } from './index';

const meta = {
  title: 'Components/MarkdownField',
  component: MarkdownField,
  argTypes: {
    disabled: { control: 'boolean' },
    showToolbar: { control: 'boolean' },
    showPreviewToggle: { control: 'boolean' },
    showCounter: { control: 'boolean' },
    label: { control: 'text' },
    hint: { control: 'text' },
    placeholder: { control: 'text' },
  },
};

export default meta;

/** Управляемый пример с реальным состоянием React — для интерактивных историй */
const ControlledMarkdownField = (args: React.ComponentProps<typeof MarkdownField>) => {
  const [value, setValue] = useState(args.value ?? args.defaultValue ?? '');
  return (
    // ширина фиксирована контейнером-стори — растёт только высота поля
    <div style={{ width: 420 }}>
      <MarkdownField
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next);
          args.onChange?.(next);
        }}
      />
    </div>
  );
};

export const Default = {
  render: ControlledMarkdownField,
  args: {
    label: 'Описание',
    placeholder: 'Поддерживается **markdown**: списки, ссылки, код...',
  },
};

/** Демонстрация авто-расширения — контейнер растёт вниз по мере ввода, ширина не меняется */
export const AutoGrow = {
  render: ControlledMarkdownField,
  args: {
    label: 'Комментарий',
    defaultValue:
      'Начните печатать длинный текст, и поле начнёт расти вниз, оставаясь той же ширины — так же ' +
      'как это устроено в GitHub Issues или Slack. Можно попробовать вставить несколько абзацев подряд, ' +
      'чтобы увидеть, как контейнер подстраивается под контент.',
    minRows: 3,
    maxRows: 12,
  },
};

/** Обязательное поле с ограничением длины и счётчиком символов */
export const WithValidation = {
  render: ControlledMarkdownField,
  args: {
    label: 'Отзыв',
    placeholder: 'Расскажите о вашем опыте...',
    rules: {
      required: 'Напишите хотя бы пару слов',
      minLength: { value: 10, message: 'Слишком коротко — минимум 10 символов' },
      maxLength: { value: 280, message: 'Слишком длинно — максимум 280 символов' },
    },
    validateOn: 'change',
    showCounter: true,
  },
};

export const WithoutToolbar = {
  render: ControlledMarkdownField,
  args: {
    label: 'Заметка',
    showToolbar: false,
    showPreviewToggle: false,
    placeholder: 'Просто авто-растущее поле, без markdown-тулбара',
  },
};

export const Disabled = {
  render: ControlledMarkdownField,
  args: {
    label: 'Поле недоступно',
    defaultValue: 'Этот текст нельзя редактировать',
    disabled: true,
  },
};
