import React from 'react';
import { DropDown, type DropDownPlacement } from './';
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
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right', 'auto'],
      description: 'Сторона открытия меню относительно триггера',
    },
    children: { control: false },
    trigger: { control: false },
  },
};

export default meta;

const placementItems = (
  prefix: string = ''
) => (
  <>
    <DropDownItem label={`${prefix}Профиль`} onClick={() => console.log('Профиль')} />
    <DropDownItem label={`${prefix}Настройки`} onClick={() => console.log('Настройки')} />
    <DropDownItem label={`${prefix}Документы`} onClick={() => console.log('Документы')} />
    <DropDownItem label={`${prefix}Выйти`} onClick={() => console.log('Выйти')} />
  </>
);

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
 * Демонстрация новой возможности placement.
 * Все четыре статических значения показывают, что меню открывается
 * строго относительно соответствующей стороны триггера.
 */
export const Placements = {
  name: 'Placement — all directions',
  render: () => {
    const placements: DropDownPlacement[] = [
      'top',
      'bottom',
      'left',
      'right',
    ];

    return (
      <div
        style={{
          minHeight: 360,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(120px, 1fr))',
          gridTemplateRows: 'repeat(3, 100px)',
          placeItems: 'center',
          gap: 16,
        }}
      >
        <div style={{ gridColumn: 2, gridRow: 1 }}>
          <DropDown triggerLabel="Top" placement="top">
            {placementItems('Top — ')}
          </DropDown>
        </div>

        <div style={{ gridColumn: 1, gridRow: 2 }}>
          <DropDown triggerLabel="Left" placement="left">
            {placementItems('Left — ')}
          </DropDown>
        </div>

        <div style={{ gridColumn: 2, gridRow: 2 }}>
          <DropDown triggerLabel="Bottom" placement="bottom">
            {placementItems('Bottom — ')}
          </DropDown>
        </div>

        <div style={{ gridColumn: 3, gridRow: 2 }}>
          <DropDown triggerLabel="Right" placement="right">
            {placementItems('Right — ')}
          </DropDown>
        </div>
      </div>
    );
  },
};

/**
 * Демонстрация placement как Storybook control.
 * Значение можно переключать непосредственно через Controls.
 */
export const PlacementControl = {
  name: 'Placement — interactive',
  args: {
    triggerLabel: 'Выбрать placement',
    placement: 'bottom' as DropDownPlacement,
    width: 220,
  },
  render: (args: {
    triggerLabel: string;
    placement: DropDownPlacement;
    width: number;
  }) => (
    <div
      style={{
        minHeight: 260,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <DropDown
        triggerLabel={args.triggerLabel}
        placement={args.placement}
        width={args.width}
      >
        <DropDownItem label="Первый пункт" onClick={() => {}} />
        <DropDownItem label="Второй пункт" onClick={() => {}} />
        <DropDownItem label="Третий пункт" onClick={() => {}} />
        <DropDownItem label="Четвёртый пункт" onClick={() => {}} />
      </DropDown>
    </div>
  ),
};

/**
 * Главная демонстрация auto-позиционирования.
 * Триггеры расположены у разных границ viewport, поэтому при открытии
 * меню можно увидеть, как DropDown выбирает доступную сторону.
 *
 * Для проверки именно auto удобно открыть меню около нижней/правой
 * границы Storybook viewport.
 */
export const AutoPlacement = {
  name: 'Placement — auto',
  render: () => (
    <div
      style={{
        minHeight: 620,
        position: 'relative',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
        }}
      >
        <DropDown triggerLabel="Auto: top-left" placement="auto" width={220}>
          <DropDownItem label="Меню автоматически" onClick={() => {}} />
          <DropDownItem label="Подстраивается под viewport" onClick={() => {}} />
          <DropDownItem label="Без обрезания" onClick={() => {}} />
        </DropDown>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
        }}
      >
        <DropDown triggerLabel="Auto: top-right" placement="auto" width={220}>
          <DropDownItem label="Меню автоматически" onClick={() => {}} />
          <DropDownItem label="Подстраивается под viewport" onClick={() => {}} />
          <DropDownItem label="Без обрезания" onClick={() => {}} />
        </DropDown>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: 24,
        }}
      >
        <DropDown triggerLabel="Auto: bottom-left" placement="auto" width={220}>
          <DropDownItem label="Меню автоматически" onClick={() => {}} />
          <DropDownItem label="При нехватке места снизу" onClick={() => {}} />
          <DropDownItem label="откроется сверху" onClick={() => {}} />
        </DropDown>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
        }}
      >
        <DropDown triggerLabel="Auto: bottom-right" placement="auto" width={220}>
          <DropDownItem label="Меню автоматически" onClick={() => {}} />
          <DropDownItem label="При нехватке места" onClick={() => {}} />
          <DropDownItem label="выберет свободную сторону" onClick={() => {}} />
        </DropDown>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          pointerEvents: 'none',
          textAlign: 'center',
          padding: 100,
          boxSizing: 'border-box',
        }}
      >
        <div>
          <strong>placement="auto"</strong>
          <div style={{ marginTop: 8 }}>
            Попробуйте открыть меню у разных границ области.
          </div>
        </div>
      </div>
    </div>
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
