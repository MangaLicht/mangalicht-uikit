import React from 'react';
import { DropDown } from './';
import { DropDownItem } from './';
import { Button } from '../Button';

const meta = {
  title: 'Components/DropDown',
  component: DropDown,
  argTypes: {
    disabled: { control: 'boolean' },
    triggerLabel: { control: 'text' },
    width: { control: 'number' },
    closeOnItemClick: { control: 'boolean' },
    children: { control: false },
    trigger: { control: false },
  },
};

export default meta;

export const Default = {
  render: () => (
    <DropDown triggerLabel="Открыть меню">
      <DropDownItem label="Профиль" onClick={() => console.log('Профиль')} />
      <DropDownItem label="Настройки" onClick={() => console.log('Настройки')} />
      <DropDownItem label="Выйти" onClick={() => console.log('Выйти')} />
    </DropDown>
  ),
};

export const WithCustomTrigger = {
  name: 'With custom trigger (Button)',
  render: () => (
    <DropDown trigger={<Button labelText="Действия" variant="highlight" />}>
      <DropDownItem label="Копировать" onClick={() => console.log('Копировать')} />
      <DropDownItem label="Вставить" onClick={() => console.log('Вставить')} />
      <DropDownItem label="Удалить" disabled onClick={() => console.log('Удалить')} />
    </DropDown>
  ),
};

/**
 * Демонстрирует автоматическое определение вложенности: DropDownItem
 * внутри DropDownItem формирует раскрываемое подменю с отступом по
 * уровню — без единого ручного указания глубины.
 */
export const NestedItems = {
  name: 'Nested submenu (3 levels)',
  render: () => (
    <DropDown triggerLabel="Файл">
      <DropDownItem label="Создать" onClick={() => console.log('Создать')} />
      <DropDownItem label="Открыть" onClick={() => console.log('Открыть')} />
      <DropDown triggerLabel="Экспорт" onClick={() => console.log('Экспорт (родитель)')}>
        <DropDownItem label="Как PDF" onClick={() => console.log('PDF')} />
        <DropDown triggerLabel="Как изображение" onClick={() => console.log('Изображение (родитель)')}>
          <DropDownItem label="PNG" onClick={() => console.log('PNG')} />
          <DropDownItem label="JPEG" onClick={() => console.log('JPEG')} />
          <DropDownItem label="SVG" disabled onClick={() => console.log('SVG')} />
        </DropDown>
      </DropDown>
      <DropDownItem label="Закрыть" onClick={() => console.log('Закрыть')} />
    </DropDown>
  ),
};

export const FixedWidth = {
  name: 'Fixed width (300px)',
  render: () => (
    <DropDown triggerLabel="Узкая кнопка" width={300}>
      <DropDownItem label="Пункт с достаточно длинным текстом" onClick={() => {}} />
      <DropDownItem label="Короткий" onClick={() => {}} />
    </DropDown>
  ),
};

export const Disabled = {
  render: () => (
    <DropDown triggerLabel="Меню недоступно" disabled>
      <DropDownItem label="Никогда не откроется" onClick={() => {}} />
    </DropDown>
  ),
};

export const KeepOpenOnItemClick = {
  name: 'closeOnItemClick = false',
  render: () => (
    <DropDown triggerLabel="Фильтры" closeOnItemClick={false}>
      <DropDownItem label="По дате" onClick={() => console.log('По дате')} />
      <DropDownItem label="По имени" onClick={() => console.log('По имени')} />
      <DropDownItem label="По размеру" onClick={() => console.log('По размеру')} />
    </DropDown>
  ),
};

/**
 * Демонстрирует, что панель рендерится через портал (getPortalRoot) —
 * даже внутри overflow:hidden контейнера меню раскрывается поверх него,
 * а не обрезается по границе рамки. Тот же тест, что и у Select.
 */
export const InsideOverflowContainer = {
  name: 'Inside overflow:hidden container',
  render: () => (
    <div
      style={{
        width: 260,
        height: 120,
        overflow: 'hidden',
        border: '1px dashed #cbd5e1',
        borderRadius: 8,
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      <DropDown triggerLabel="Открой меня внутри рамки">
        <DropDownItem label="Пункт 1" onClick={() => {}} />
        <DropDownItem label="Пункт 2" onClick={() => {}} />
      </DropDown>
    </div>
  ),
};

export const MultipleDropDownsSideBySide = {
  name: 'Multiple dropdowns',
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <DropDown triggerLabel="Первое">
        <DropDownItem label="A" onClick={() => {}} />
        <DropDownItem label="B" onClick={() => {}} />
      </DropDown>
      <DropDown triggerLabel="Второе">
        <DropDownItem label="C" onClick={() => {}} />
        <DropDownItem label="D" onClick={() => {}} />
      </DropDown>
    </div>
  ),
};