# mangalicht-uikit

React + TypeScript UI Kit для построения интерфейсов на базе React 19.

Библиотека построена вокруг нескольких принципов:

- компоненты имеют локальные SCSS Modules;
- поведение, которое можно переиспользовать, вынесено в hooks;
- floating UI использует Portal и `@floating-ui/dom`;
- интерактивные контролы по возможности опираются на нативные HTML-элементы;
- формы поддерживают controlled/uncontrolled сценарии;
- тема задаётся через `data-theme="light|dark"`;
- библиотека собирается Vite Library Mode;
- TypeScript declarations генерируются автоматически.

---

## Содержание

- [Установка](#установка)
- [Импорт](#импорт)
- [Темизация](#темизация)
- [Компоненты](#компоненты)
  - [AlertDialog](#alertdialog)
  - [Badge](#badge)
  - [Block](#block)
  - [Button](#button)
  - [Carousel](#carousel)
  - [Checkbox](#checkbox)
  - [DnD](#dnd)
  - [DropDown](#dropdown)
  - [ExpandableCard](#expandablecard)
  - [Image](#image)
  - [Input](#input)
  - [Markdown](#markdown)
  - [ProgressBar](#progressbar)
  - [ScrollArea](#scrollarea)
  - [Select](#select)
  - [Slider](#slider)
  - [Switch](#switch)
  - [TabList](#tablist)
  - [Toggle](#toggle)
  - [Tooltip](#tooltip)
  - [Sheet](#sheet)
- [Общие hooks](#общие-hooks)
- [Иконки](#иконки)
- [Архитектура](#архитектура)
- [Storybook](#storybook)
- [Сборка](#сборка)
- [Экспорт пакета](#экспорт-пакета)

---

# Установка

```bash
npm install mangalicht-uikit
```

В приложении должны быть установлены React и React DOM 19:

```bash
npm install react react-dom
```

## Базовый импорт

Все публичные компоненты экспортируются из корня:

```tsx
import {
  AlertDialog,
  Badge,
  Block,
  Button,
  Carousel,
  Checkbox,
  DragArea,
  DragElement,
  DropDown,
  DropDownItem,
  ExpandableCard,
  ExpandableElement,
  Image,
  Input,
  MarkdownComment,
  MarkdownInput,
  MarkdownPreview,
  ProgressBar,
  ScrollArea,
  Select,
  Slider,
  Switch,
  TabList,
  Toggle,
  Tooltip,
} from 'mangalicht-uikit'
```

Типы экспортируются вместе с компонентами.

Иконки доступны отдельным публичным экспортом:

```tsx
import { SearchIcon, CloseIcon } from 'mangalicht-uikit'
```

---

# Темизация

Тема определяется атрибутом:

```html
<html data-theme="light">
```

или:

```html
<html data-theme="dark">
```

В React:

```tsx
document.documentElement.dataset.theme = 'dark'
```

Пример переключателя:

```tsx
const toggleTheme = () => {
  const root = document.documentElement

  root.dataset.theme =
    root.dataset.theme === 'dark' ? 'light' : 'dark'
}
```

Общие design tokens находятся в `src/shared/theme-vars.scss`.

Компоненты используют CSS custom properties, поэтому тему можно менять без перемонтирования UI.

---

# Компоненты

## AlertDialog

Модальное alert-окно. Компонент рендерится через Portal, блокирует прокрутку `body`, поддерживает Escape и закрытие по overlay.

### Пример

```tsx
import { useState } from 'react'
import { AlertDialog, Button } from 'mangalicht-uikit'

export function Example() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        labelText="Удалить"
        isAlert
        onClick={() => setOpen(true)}
      />

      <AlertDialog
        open={open}
        title="Удалить запись?"
        description="Это действие нельзя отменить."
        onClose={() => setOpen(false)}
      >
        <Button
          labelText="Отмена"
          onClick={() => setOpen(false)}
        />
      </AlertDialog>
    </>
  )
}
```

### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `open` | `boolean` | `false` | Показывать диалог. |
| `title` | `ReactNode` | — | Заголовок. |
| `description` | `ReactNode` | — | Описание. |
| `children` | `ReactNode` | — | Основное содержимое/действия. |
| `onClose` | `() => void` | — | Callback закрытия. |
| `closeOnOverlayClick` | `boolean` | `true` | Закрывать при клике по overlay. |
| `closeOnEscape` | `boolean` | `true` | Закрывать по Escape. |
| `blur` | `number` | `6` | Размытие фона в px. |
| `className` | `string` | — | Класс диалога. |
| `...HTMLAttributes` | — | — | Остальные атрибуты `div`. |

`ref` указывает на DOM-элемент диалога.

---

# Badge

В `Badge` находятся три специализированных компонента:

- `SimpleBadge`
- `StrickBadge`
- `ProfileLevelBadge`

## SimpleBadge

Небольшой текстовый badge.

```tsx
import { SimpleBadge } from 'mangalicht-uikit'

<SimpleBadge
  label="Новое"
  variant="positive"
/>
```

### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `label` | `string` | обязательный | Текст badge. |
| `variant` | `'primary' \| 'destructive' \| 'outline' \| 'positive'` | `'primary'` | Визуальный вариант. |
| `classNames` | `string` | — | Дополнительный класс. |

---

## StrickBadge

Badge для отображения серии/streak с иконкой Flame.

```tsx
import { StrickBadge } from 'mangalicht-uikit'

<StrickBadge
  value={14}
  animated
/>
```

### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `value` | `number \| string` | обязательный | Значение серии. |
| `animated` | `boolean` | `true` | Включает периодическую анимацию Flame. |
| `classNames` | `string` | — | Дополнительный класс. |
| `ariaLabel` | `string` | `Серия: ${value}` | Accessible label. |
| `children` | `ReactNode` | — | Дополнительное содержимое. |

---

## ProfileLevelBadge

Badge уровня профиля.

```tsx
import { ProfileLevelBadge } from 'mangalicht-uikit'

<ProfileLevelBadge
  variant="gold"
  level={25}
/>
```

Доступные тиры:

ProfileLevelBadge variants:

```text
bronze
silver
gold
platinum
ruby
diamond
```

### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `variant` | `PLBadgeVariant` | обязательный | Тир badge. |
| `level` | `number \| string` | — | Уровень. |
| `label` | `ReactNode` | — | Полностью заменяет текст `Уровень N`. |
| `shine` | `boolean` | `true` | Анимация блика. |
| `classNames` | `string` | — | Дополнительный класс. |

---

# Block

Контейнер для группировки интерфейса.

Варианты:

```text
default
outlined
```

### Пример

```tsx
import { Block, Button } from 'mangalicht-uikit'

<Block
  variant="outlined"
  title="Настройки"
  titleStyle={3}
  width={500}
>
  <Button labelText="Сохранить" />
</Block>
```

`titleChildren` позволяет добавить разрешённый элемент рядом с заголовком. Архитектура компонента допускает SVG и `Button`.

### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `variant` | `'default' \| 'outlined'` | обязательный | Вариант контейнера. |
| `title` | `string` | — | Заголовок. |
| `titleStyle` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2` | HTML-уровень заголовка. |
| `titleChildren` | `ReactNode \| ReactElement` | — | Дополнительный элемент рядом с title. |
| `width` | `number` | — | Ширина в px. При отсутствии — `100%`. |
| `height` | `number` | — | Высота в px. При отсутствии — `100%`. |
| `classNames` | `string` | — | Класс внутреннего блока. |
| `children` | `ReactNode \| ReactElement` | — | Содержимое. |
| `...HTMLAttributes` | — | — | Атрибуты корневого `div`. |

`ref` указывает на wrapper.

---

# Button

Базовая кнопка UI Kit.

```tsx
import { Button } from 'mangalicht-uikit'

<Button
  labelText="Сохранить"
  variant="highlight"
  buttonType="rounded"
  size="default"
  onClick={handleSave}
/>
```

## Variants

```text
default
highlight
bordered
borderedAccent
ghost
transparent
```

## Button types

```text
default
rounded
square
circle
```

## Sizes

```text
default
sm
xsm
```

### Иконки

```tsx
import { SearchIcon } from 'mangalicht-uikit'

<Button
  labelText="Поиск"
  iconStart={<SearchIcon />}
/>
```

### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `labelText` | `string` | — | Текст кнопки. |
| `variant` | `ButtonVariants` | `'default'` | Визуальный вариант. |
| `buttonType` | `'default' \| 'rounded' \| 'square' \| 'circle'` | `'default'` | Форма кнопки. |
| `size` | `'default' \| 'sm' \| 'xsm'` | `'default'` | Размер. |
| `isAlert` | `boolean` | `false` | Alert/красное состояние. |
| `iconStart` | `ReactNode` | — | Иконка перед текстом. |
| `iconEnd` | `ReactNode` | — | Иконка после текста. |
| `animation` | `'default' \| 'none'` | `'default'` | Режим анимации. |
| `disabled` | `boolean` | `false` | Блокировка. |
| `classNames` | `string` | — | Дополнительный класс. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Нативный type. |
| `onClick` | `MouseEventHandler` | — | Обработчик клика. |
| `...ButtonHTMLAttributes` | — | — | Остальные атрибуты `button`. |

`ref` указывает на нативный `<button>`.

---

# Carousel

Карусель с бесконечной навигацией. Поддерживает обычный режим и карточный режим.

```tsx
import { Carousel } from 'mangalicht-uikit'

<Carousel
  slides={[
    { id: '1', content: <Card title="One" /> },
    { id: '2', content: <Card title="Two" /> },
    { id: '3', content: <Card title="Three" /> },
  ]}
  showArrows
  showDots
/>
```

## Card variant

Для карточной карусели:

```tsx
<Carousel
  variant="card"
  slides={slides}
  cardWidth={314}
  cardHeight={346}
  swipe
  showDots
  dotsPosition="inside"
/>
```

В `card`-варианте соседние карточки не должны визуально выступать за viewport; свайп включён по умолчанию.

### CarouselSlide

```ts
interface CarouselSlide {
  id: string
  content: React.ReactNode
}
```

### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `slides` | `CarouselSlide[]` | обязательный | Массив слайдов. |
| `activeIndex` | `number` | — | Controlled active index. |
| `defaultActiveIndex` | `number` | `0` | Начальный index uncontrolled. |
| `onSlideChange` | `(index: number) => void` | — | Вызывается после смены слайда. |
| `autoPlayInterval` | `number` | — | Интервал autoplay в ms. |
| `showArrows` | `boolean` | `true` | Показывать стрелки. |
| `showDots` | `boolean` | `true` | Показывать dots. |
| `height` | `number` | — | Высота карусели. |
| `collapsedWidth` | `number` | `86` | Ширина неактивного слайда в default-режиме. |
| `gap` | `number` | `6` | Отступ между слайдами. |
| `variant` | `'default' \| 'card'` | `'default'` | Режим карусели. |
| `cardWidth` | `number` | `314` | Ширина карточки в card-режиме. |
| `cardHeight` | `number` | `346` | Высота карточки в card-режиме. |
| `swipe` | `boolean` | `variant === 'card'` | Разрешить свайп. |
| `dotsPosition` | `'outside' \| 'inside'` | `'outside'` | Расположение dots. |
| `classNames` | `string` | — | Дополнительный класс. |

`activeIndex` делает карусель controlled.

---

# Checkbox

Чекбокс на базе нативного `input[type="checkbox"]`.

```tsx
import { Checkbox } from 'mangalicht-uikit'

<Checkbox
  labelText="Согласен"
  checked={accepted}
  onClick={setAccepted}
/>
```

Uncontrolled:

```tsx
<Checkbox
  labelText="Запомнить меня"
  defaultChecked
/>
```

## Variants

```text
default
radio
```

### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `checked` | `boolean` | — | Controlled состояние. |
| `defaultChecked` | `boolean` | `false` | Начальное uncontrolled состояние. |
| `onClick` | `(checked: boolean) => void` | — | Callback с новым состоянием. |
| `variant` | `'default' \| 'radio'` | `'default'` | Внешний вид. |
| `labelText` | `string` | — | Подпись. |
| `disabled` | `boolean` | `false` | Блокировка. |
| `name` | `string` | — | Native input name. |
| `classNames` | `string` | — | Класс wrapper. |
| `className` | `string` | — | Также поддерживается из `InputHTMLAttributes`. |
| `...InputHTMLAttributes` | — | — | Остальные атрибуты input. |

`ref` указывает на native checkbox.

---

# DnD

DnD состоит из двух компонентов:

```tsx
<DragArea>
  <DragElement id="one">...</DragElement>
  <DragElement id="two">...</DragElement>
</DragArea>
```

**Состояние сортировки находится внутри `DragArea`.** Внешнему коду не нужно вручную менять массив после каждого drag.

Компонент использует Pointer Events, FLIP-подобное позиционирование и плавное освобождение ячейки.

## DragArea

```tsx
import {
  DragArea,
  DragElement,
} from 'mangalicht-uikit'

<DragArea
  columns={3}
  gap={16}
  transitionSpeed={300}
  onOrderChange={(order, activeId) => {
    console.log(order, activeId)
  }}
>
  <DragElement id="a">A</DragElement>
  <DragElement id="b">B</DragElement>
  <DragElement id="c">C</DragElement>
</DragArea>
```

### Props DragArea

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `children` | `DragElement \| DragElement[]` | обязательный | Только `DragElement`. |
| `columns` | `number \| 'auto'` | `'auto'` | Количество колонок. `auto` рассчитывается по ширине. |
| `gap` | `number` | `12` | Общий gap в px. |
| `rowGap` | `number` | `gap` | Вертикальный gap. |
| `columnGap` | `number` | `gap` | Горизонтальный gap. |
| `transitionSpeed` | `number` | `300` | Скорость CSS transition. |
| `className` | `string` | — | Класс области. |
| `style` | `CSSProperties` | — | Inline style. |
| `onOrderChange` | `(order, activeId) => void` | — | Новый порядок после drop. |

### DragElement

```tsx
<DragElement
  id="card-1"
  locked={false}
  onDragStart={id => console.log('start', id)}
  onDragEnd={(id, event) => {
    console.log(event.cancelled, event.order)
  }}
>
  <MyCard />
</DragElement>
```

### Props DragElement

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `id` | `string` | обязательный | Уникальный идентификатор. |
| `children` | `ReactNode` | обязательный | Перетаскиваемое содержимое. |
| `disabled` | `boolean` | `false` | Полностью отключает drag. |
| `locked` | `boolean` | `false` | Элемент не перемещается и занимает фиксированную позицию. |
| `className` | `string` | — | Класс wrapper. |
| `style` | `CSSProperties` | — | Inline style wrapper. |
| `onDragStart` | `(id: string) => void` | — | Начало drag. |
| `onDragEnd` | `(id, {cancelled, order}) => void` | — | Завершение или отмена drag. |

`disabled` и `locked` влияют на сортировку одинаково: элемент не может быть активным. `locked` дополнительно означает, что его позиция сохраняется при перестановке остальных элементов.

---

# DropDown

Выпадающее меню с вложенными flyout-подменю.

## Простое меню

```tsx
import {
  DropDown,
  DropDownItem,
} from 'mangalicht-uikit'

<DropDown triggerLabel="Меню">
  <DropDownItem
    label="Профиль"
    onClick={() => openProfile()}
  />
  <DropDownItem
    label="Настройки"
    onClick={() => openSettings()}
  />
</DropDown>
```

## Кастомный trigger

```tsx
<DropDown
  trigger={
    <Button
      labelText="Действия"
      variant="ghost"
    />
  }
>
  <DropDownItem label="Редактировать" />
  <DropDownItem label="Удалить" disabled />
</DropDown>
```

## Вложенное меню

```tsx
<DropDown triggerLabel="Меню">
  <DropDownItem label="Главная" />

  <DropDown
    triggerLabel="Настройки"
    icon={<SettingsIcon />}
  >
    <DropDownItem label="Профиль" />
    <DropDownItem label="Безопасность" />

    <DropDown
      triggerLabel="Дополнительно"
    >
      <DropDownItem label="Экспериментальные настройки" />
    </DropDown>
  </DropDown>
</DropDown>
```

### DropDown Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `children` | `ReactNode` | обязательный | `DropDownItem` и/или вложенные `DropDown`. |
| `trigger` | `ReactElement` | — | Кастомный trigger корневого меню. |
| `triggerLabel` | `string` | `'Меню'` | Текст default trigger или строки подменю. |
| `width` | `number` | — | Фиксированная ширина root panel в px. |
| `disabled` | `boolean` | `false` | Отключает открытие. |
| `closeOnItemClick` | `boolean` | `true` | Закрывать root после leaf item. |
| `onClick` | `(event: MouseEvent<HTMLLIElement>) => void` | — | Для вложенного DropDown. |
| `icon` | `ReactNode` | — | Иконка строки вложенного DropDown. |
| `classNames` | `string` | — | Дополнительный класс. |
| `...IUIKitProps` | — | — | Общие UI Kit props. |

Root меню закрывается при клике вне всего дерева панелей и при scroll страницы. Scroll внутри floating-панели не закрывает меню.

### DropDownItem Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `label` | `string` | обязательный | Текст. |
| `onClick` | `(event: MouseEvent<HTMLLIElement>) => void` | — | Обработчик. |
| `disabled` | `boolean` | `false` | Блокировка. |
| `icon` | `ReactNode` | — | Иконка перед текстом. |
| `classNames` | `string` | — | Дополнительный класс. |

---

# ExpandableCard

Карточка, которая увеличивается после задержки при hover/focus. На touch-устройствах раскрытие происходит двойным тапом, а клик вне раскрытой карточки закрывает её.

```tsx
import {
  ExpandableCard,
  ExpandableElement,
} from 'mangalicht-uikit'

<ExpandableCard
  width={166}
  height={220}
  expandedWidth={318}
  expandedHeight={398}
  showDelay={700}
>
  <ExpandableElement
    initialClassName="collapsed-content"
    expandedClassName="expanded-content"
  >
    Контент
  </ExpandableElement>
</ExpandableCard>
```

`ExpandableElement` использует context родительской карточки и получает текущее состояние expanded.

### ExpandableCard Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `children` | `ReactNode` | — | Содержимое. |
| `width` | `number \| string` | `166` | Начальная ширина. |
| `height` | `number \| string` | `220` | Начальная высота. |
| `expandedWidth` | `number \| string` | `318` | Ширина в expanded состоянии. |
| `expandedHeight` | `number \| string` | `398` | Высота в expanded состоянии. |
| `showDelay` | `number` | `700` | Задержка hover в ms. |
| `animationDuration` | `number` | `360` | Длительность перехода в ms. |
| `disabled` | `boolean` | `false` | Отключает раскрытие. |
| `className` | `string` | — | Класс карточки. |
| `style` | `CSSProperties` | — | Inline style карточки. |
| `...HTMLAttributes` | — | — | Атрибуты `article`. |

### ExpandableElement Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `children` | `ReactNode` | — | Содержимое. |
| `initialClassName` | `string` | — | Класс в collapsed состоянии. |
| `expandedClassName` | `string` | — | Класс в expanded состоянии. |
| `className` | `string` | — | Общий класс. |
| `style` | `CSSProperties` | — | Inline style. |
| `...HTMLAttributes` | — | — | Атрибуты `div`. |

> `ExpandableElement` должен находиться внутри `ExpandableCard`. Иначе компонент выбрасывает ошибку context.

---

# Image

Обёртка над native `<img>` с поддержкой `<picture>/<source>`.

```tsx
import { Image } from 'mangalicht-uikit'

<Image
  src="/images/cover.jpg"
  alt="Обложка"
  width={640}
  height={360}
  sources={[
    {
      srcSet: '/images/cover.avif',
      type: 'image/avif'
    },
    {
      srcSet: '/images/cover-mobile.jpg',
      media: '(max-width: 640px)'
    }
  ]}
/>
```

### ImageSource

```ts
interface ImageSource {
  srcSet: string
  media?: string
  type?: string
}
```

### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `sources` | `ImageSource[]` | — | Дополнительные `<source>`. |
| `classNames` | `string` | — | Класс изображения. |
| `...ImgHTMLAttributes` | — | — | Остальные native image props. |

---

# Input

Однострочный input с controlled/uncontrolled режимами и встроенной валидацией.

```tsx
import { Input } from 'mangalicht-uikit'

<Input
  label="Email"
  placeholder="mail@example.com"
  value={email}
  onChange={setEmail}
  rules={{
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  }}
  validateOn="blur"
/>
```

### Search input

```tsx
<Input
  type="search"
  icon={<SearchIcon />}
  clearable
  value={query}
  onChange={setQuery}
  placeholder="Поиск..."
/>
```

### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `value` | `string` | — | Controlled значение. |
| `defaultValue` | `string` | — | Начальное uncontrolled значение. |
| `onChange` | `(value, event?) => void` | — | Изменение значения. |
| `onValidChange` | `(isValid, error) => void` | — | Изменение результата валидации. |
| `rules` | `ValidationRules` | — | Правила валидации. |
| `validateOn` | `'blur' \| 'change' \| 'submit'` | `'blur'` | Когда валидировать. |
| `label` | `string` | — | Label. |
| `hint` | `string` | — | Hint, если нет ошибки. |
| `errorMessage` | `string` | — | Внешняя ошибка; имеет приоритет. |
| `clearable` | `boolean` | `false` | Показывать очистку при наличии значения. |
| `icon` | `ReactNode` | — | Иконка слева. |
| `classNames` | `string` | — | Класс input. |
| `wrapperClassName` | `string` | — | Класс wrapper. |
| `disabled` | `boolean` | `false` | Native disabled. |
| `...InputHTMLAttributes` | — | — | Остальные native props. |

`ref` указывает на native `<input>`.

---

# Markdown

Markdown API разделён на три компонента:

- `MarkdownInput` — редактор;
- `MarkdownPreview` — preview;
- `MarkdownComment` — готовая композиция редактора комментария.

---

## MarkdownInput

Textarea с autosize, Markdown toolbar и Undo/Redo.

```tsx
import { MarkdownInput } from 'mangalicht-uikit'

<MarkdownInput
  value={text}
  onChange={setText}
  minRows={4}
  maxRows={12}
  showToolbar
  maxLength={2000}
/>
```

Toolbar появляется около выделенного текста, а не следует за курсором.

### Toolbar actions

```text
bold
italic
strike
code
spoiler
link
quote
unordered-list
ordered-list
```

Пример callback:

```tsx
<MarkdownInput
  value={text}
  onChange={setText}
  onToolbarAction={action => {
    console.log(action)
  }}
/>
```

### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `value` | `string` | — | Controlled значение. |
| `defaultValue` | `string` | `''` | Начальное значение. |
| `onChange` | `(value: string) => void` | — | Изменение текста. |
| `placeholder` | `string` | — | Placeholder. |
| `disabled` | `boolean` | `false` | Отключить редактор. |
| `readOnly` | `boolean` | `false` | Только чтение. |
| `minRows` | `number` | `3` | Минимум строк. |
| `maxRows` | `number` | `15` | Максимум строк. |
| `historySize` | `number` | `100` | Размер Undo/Redo history. |
| `maxLength` | `number` | — | Максимальная длина. |
| `showToolbar` | `boolean` | `true` | Показывать floating toolbar. |
| `className` | `string` | — | Класс wrapper. |
| `textareaClassName` | `string` | — | Класс textarea. |
| `children` | `ReactNode` | — | Дополнительное содержимое. |
| `onToolbarAction` | `(action) => void` | — | Callback toolbar action. |
| `onBlur` | `FocusEventHandler` | — | Blur textarea. |
| `onFocus` | `FocusEventHandler` | — | Focus textarea. |
| `...TextareaHTMLAttributes` | — | — | Остальные native props. |

История оптимизирована для ввода: изменения внутри слова не создают отдельную историю на каждый символ; точки фиксации определяются завершением слова/Enter/пунктуацией и действиями toolbar.

---

## MarkdownPreview

Рендерит Markdown в безопасный HTML.

```tsx
import { MarkdownPreview } from 'mangalicht-uikit'

<MarkdownPreview
  markdown="## Заголовок

**Жирный текст**"
  emptyText="Пока ничего нет"
/>
```

Используются `marked` и `DOMPurify`.

### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `markdown` | `string` | обязательный | Markdown. |
| `emptyText` | `string` | — | Текст для пустого preview. |
| `className` | `string` | — | Дополнительный класс. |

---

## MarkdownComment

Готовая форма комментария: Write/Preview, toolbar, validation и counter.

```tsx
import { MarkdownComment } from 'mangalicht-uikit'

<MarkdownComment
  label="Комментарий"
  value={comment}
  onChange={setComment}
  showPreviewToggle
  showCounter
  showToolbar
  maxLength={1000}
  rules={{ required: true }}
/>
```

### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `value` | `string` | — | Controlled значение. |
| `defaultValue` | `string` | `''` | Начальное uncontrolled значение. |
| `onChange` | `(value, event?) => void` | — | Изменение текста. |
| `maxLength` | `number` | — | Максимальная длина. |
| `rules` | `ValidationRules` | — | Правила валидации. |
| `validateOn` | `ValidateOn` | `'blur'` | Момент валидации. |
| `onValidChange` | `(isValid, error) => void` | — | Результат валидации. |
| `errorMessage` | `string` | — | Внешняя ошибка. |
| `hint` | `string` | — | Подсказка. |
| `label` | `string` | — | Label. |
| `showPreviewToggle` | `boolean` | — | Write/Preview tabs. |
| `showCounter` | `boolean` | — | Счётчик символов. |
| `showToolbar` | `boolean` | — | Markdown toolbar. |
| `minRows` | `number` | — | Минимум строк. |
| `maxRows` | `number` | — | Максимум строк. |
| `historySize` | `number` | — | Размер истории. |
| `showSpoilerButton` | `boolean` | — | Кнопка spoiler. |
| `wrapperClassName` | `string` | — | Класс root wrapper. |
| `textareaClassName` | `string` | — | Класс textarea. |
| `onBlur` | `FocusEventHandler` | — | Blur. |
| `onFocus` | `FocusEventHandler` | — | Focus. |
| `...TextareaHTMLAttributes` | — | — | Остальные textarea props. |

---

# ProgressBar

Горизонтальный progress indicator.

```tsx
import { ProgressBar } from 'mangalicht-uikit'

<ProgressBar
  min={0}
  max={100}
  value={72}
  fillColor="accent"
/>
```

### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `min` | `number` | `0` | Минимум. |
| `max` | `number` | `100` | Максимум. |
| `value` | `number` | обязательный | Текущее значение. |
| `showLabel` | `boolean` | `true` | Показывать значение. |
| `label` | `ReactNode` | — | Пользовательская подпись. |
| `ariaLabel` | `string` | — | Accessible label. |
| `fillColor` | `'yellow' \| 'accent'` | — | Цвет заполнения. |
| `classNames` | `string` | — | Класс track. |
| `wrapperClassName` | `string` | — | Класс wrapper. |

Значение визуально ограничивается диапазоном `[min, max]`.

---

# ScrollArea

Custom scrollbar поверх обычного scroll container.

```tsx
import { ScrollArea } from 'mangalicht-uikit'

<ScrollArea
  visibleMode="scroll"
  axis="vertical"
>
  {items}
</ScrollArea>
```

## Режимы scrollbar

```text
default  — scrollbar виден при overflow
none     — scrollbar скрыт
scroll   — scrollbar появляется во время scrolling
```

## Оси

```text
vertical
horizontal
both
```

### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `children` | `ReactNode` | обязательный | Scrollable content. |
| `visibleMode` | `'default' \| 'none' \| 'scroll'` | `'default'` | Видимость scrollbar. |
| `axis` | `'vertical' \| 'horizontal' \| 'both'` | — | Направление scroll. |
| `onScroll` | `(event: UIEvent<HTMLDivElement>) => void` | — | Callback scroll. |
| `classNames` | `string` | — | Класс root. |
| `...HTMLAttributes` | — | — | Остальные div props. |

### Ref API

`ScrollArea` экспортирует `ScrollAreaHandle` / `ScrollAreaRef`.

Доступный метод:

```ts
scrollTo(options: ScrollToOptions): void
```

Пример:

```tsx
const ref = useRef<ScrollAreaRef>(null)

<ScrollArea ref={ref}>
  ...
</ScrollArea>

ref.current?.scrollTo({
  top: 500,
  behavior: 'smooth',
})
```

---

# Select

Кастомный accessible listbox.

```tsx
import { Select } from 'mangalicht-uikit'

<Select
  options={[
    { value: 'manga', label: 'Манга' },
    { value: 'novel', label: 'Новелла' },
    { value: 'disabled', label: 'Недоступно', disabled: true },
  ]}
  value={type}
  onChange={setType}
  placeholder="Выберите тип"
/>
```

### SelectOption

```ts
interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}
```

### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `options` | `SelectOption[]` | обязательный | Опции. |
| `value` | `string` | — | Controlled значение. |
| `defaultValue` | `string` | — | Начальное значение. |
| `onChange` | `(value: string) => void` | — | Выбор option. |
| `disabled` | `boolean` | `false` | Отключить select. |
| `classNames` | `string` | — | Класс trigger. |
| `placeholder` | `string` | — | Placeholder. |
| `name` | `string` | — | Создаёт hidden input для form submit. |
| `minWidth` | `number` | — | Минимальная ширина. |
| `...ButtonHTMLAttributes` | — | — | Остальные trigger props. |

Панель рендерится через Portal и позиционируется относительно trigger.

Клавиатурная навигация включает:

```text
ArrowUp
ArrowDown
Enter
Space
Home
End
Escape
```

Фокус остаётся на trigger, а активная option передаётся через `aria-activedescendant`.

---

# Slider

Визуально стилизованный native `input[type="range"]`.

```tsx
import { Slider } from 'mangalicht-uikit'

<Slider
  min={0}
  max={100}
  value={40}
  onChange={setValue}
/>
```

Uncontrolled:

```tsx
<Slider
  min={0}
  max={10}
  step={0.5}
  defaultValue={2.5}
/>
```

### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `value` | `number` | — | Controlled значение. |
| `defaultValue` | `number` | `min` | Начальное uncontrolled значение. |
| `onChange` | `(value, event?) => void` | — | Изменение. |
| `min` | `number` | `0` | Минимум. |
| `max` | `number` | `100` | Максимум. |
| `step` | `number` | `1` | Шаг. |
| `showLabel` | `boolean` | `true` | Показывать label. |
| `label` | `ReactNode` | — | Пользовательский label. |
| `classNames` | `string` | — | Класс native input. |
| `wrapperClassName` | `string` | — | Класс wrapper. |
| `disabled` | `boolean` | `false` | Отключение. |
| `...InputHTMLAttributes` | — | — | Остальные native props. |

`ref` указывает на native range input.

---

# Switch

Controlled switch на native checkbox.

```tsx
import { Switch } from 'mangalicht-uikit'

<Switch
  checked={darkMode}
  onChange={setDarkMode}
  labelText="Тёмная тема"
/>
```

### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `checked` | `boolean` | обязательный | Текущее состояние. |
| `onChange` | `(checked: boolean) => void` | обязательный | Изменение. |
| `labelText` | `string` | — | Подпись. |
| `disabled` | `boolean` | `false` | Блокировка. |
| `name` | `string` | — | Native input name. |
| `size` | `'default' \| 'small'` | `'default'` | Размер. |
| `className` | `string` | — | Класс wrapper. |
| `...InputHTMLAttributes` | — | — | Остальные props input. |

`ref` указывает на native checkbox.

---

# TabList

Список вкладок с анимированным индикатором.

```tsx
import { TabList } from 'mangalicht-uikit'

<TabList
  tabs={[
    { id: 'write', label: 'Write', icon: <Pencil /> },
    { id: 'preview', label: 'Preview', icon: <Eye /> },
  ]}
  activeTab={mode}
  onTabChange={setMode}
  variant="inner"
/>
```

### TabItem

```ts
interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
}
```

### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `tabs` | `TabItem[]` | обязательный | Вкладки. |
| `variant` | `'block' \| 'inner'` | `'block'` | Визуальный вариант. |
| `activeTab` | `string` | обязательный | ID активной вкладки. |
| `onTabChange` | `(tabId: string) => void` | обязательный | Изменение вкладки. |
| `className` | `string` | — | Класс root. |
| `...ButtonHTMLAttributes` | — | — | Поддерживается API базового button type, кроме `children`/`variant`. |

`ref` указывает на root `div`.

---

# Toggle

Button, который ведёт себя как toggle.

```tsx
import { Toggle } from 'mangalicht-uikit'

<Toggle
  labelText="Избранное"
  checked={favorite}
  onCheckedChange={setFavorite}
/>
```

Uncontrolled:

```tsx
<Toggle
  labelText="Фильтр"
  defaultChecked
/>
```

### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `checked` | `boolean` | — | Controlled состояние. |
| `defaultChecked` | `boolean` | `false` | Начальное состояние. |
| `onCheckedChange` | `(checked, event) => void` | — | Callback изменения. |
| `onClick` | `MouseEventHandler` | — | Внешний click callback. Выполняется после переключения. |
| `activeClassName` | `string` | — | Дополнительный класс активного состояния. |
| `activeVariant` | `ButtonProps['variant']` | `'highlight'` | Button variant при active. |
| `toggleDisabled` | `boolean` | `false` | Запрещает переключение. |
| `disabled` | `boolean` | `false` | Полностью блокирует Button. |
| `...ButtonProps` | — | — | Остальные props Button. |

`Toggle` использует `Button` внутри и выставляет `aria-pressed`.

---

# Tooltip

Floating tooltip около курсора.

```tsx
import { Tooltip, Button } from 'mangalicht-uikit'

<Tooltip
  content="Сохранить изменения"
  position="top"
>
  <Button labelText="Сохранить" />
</Tooltip>
```

### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `content` | `ReactNode` | обязательный | Содержимое. |
| `children` | `ReactElement` | обязательный | Trigger. |
| `position` | `'top' \| 'bottom'` | `'top'` | Сторона относительно курсора. |
| `disabled` | `boolean` | `false` | Отключить tooltip. |
| `classNames` | `string` | — | Класс tooltip. |
| `offset` | `number` | `12` | Отступ от курсора в px. |
| `showDelay` | `number` | `500` | Задержка появления в ms. |
| `cursorLag` | `number` | `100` | Плавность следования за курсором в ms; `0` отключает lag. |

Tooltip использует Portal. Trigger оборачивается через `display: contents`, поэтому компонент корректно работает с UI Kit-компонентами, у которых реальный DOM root находится глубже.

---

# Sheet

Side panel. **На текущий момент файл `src/components/Sheet` существует в архитектуре проекта, но `Sheet` не экспортируется из `src/components/index.ts` и потому не входит в публичный root API пакета.**

Для внутреннего использования API выглядит так:

```tsx
<Sheet
  open={open}
  side="right"
  titleText="Настройки"
  width={360}
  onClose={() => setOpen(false)}
>
  Content
</Sheet>
```

### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `open` | `boolean` | обязательный | Открыта ли панель. |
| `side` | `'left' \| 'right'` | `'right'` | Сторона появления. |
| `titleText` | `string` | обязательный | Заголовок. |
| `children` | `ReactNode` | — | Содержимое. |
| `width` | `string \| number` | `360` | Ширина. |
| `closeOnOverlayClick` | `boolean` | `true` | Закрытие по overlay. |
| `closeOnEscape` | `boolean` | `true` | Закрытие по Escape. |
| `blur` | `number` | `6` | Blur заднего фона. |
| `className` | `string` | — | Класс панели. |
| `onClose` | `() => void` | обязательный | Callback закрытия. |

---

# Общие hooks

Hooks находятся в `src/hooks` и экспортируются из root API.

## useAnchoredPosition

Позиционирование floating-элемента относительно trigger. Используется, в частности, Select и DropDown.

Основные возможности:

- Portal-compatible positioning;
- `@floating-ui/dom`;
- placement;
- offset;
- flip;
- shift;
- optional match width.

---

## useAnimationTrigger

Создаёт кратковременный animation trigger при изменении значения.

Используется компонентами, которым нужна CSS-анимация перехода состояния.

---

## useAutosizeTextarea

Автоматически подстраивает высоту textarea под содержимое с ограничениями `minRows` / `maxRows`.

Используется Markdown editor.

---

## useClickOutside

Отслеживает события вне переданного DOM-элемента.

Используется для floating/overlay UI.

---

## useHistoryBuffer

Буфер Undo/Redo для контролируемого и неконтролируемого значения.

Markdown editor использует его для истории редактирования.

---

## useIsomorphicLayoutEffect

SSR-safe вариант `useLayoutEffect`.

---

## useMouseTracking

Отслеживает координаты pointer/mouse и вызывает callbacks enter/move/leave.

Используется Tooltip.

---

## useSmoothFollow

Плавно перемещает floating element к target position.

Используется Tooltip и floating Markdown toolbar.

---

## useValidation

Общая система валидации Input и MarkdownComment.

Поддерживает:

- `required`;
- `minLength`;
- `maxLength`;
- `pattern`;
- пользовательский `validate`;
- `validateOn`;
- `onValidChange`.

Пример:

```tsx
<Input
  value={name}
  onChange={setName}
  rules={{
    required: true,
    minLength: 3,
    maxLength: 40,
  }}
  validateOn="blur"
  onValidChange={(valid, error) => {
    console.log(valid, error)
  }}
/>
```

---

# Иконки

SVG/React icons находятся в `src/icons` и экспортируются из корня.

В текущей архитектуре присутствуют:

```text
Chevron
Close
Loading
Markdown
Search
```

Также компоненты библиотеки используют `lucide-react`, например:

- `XIcon`;
- `ChevronDown`;
- `Flame`;
- Markdown toolbar icons.

Пример:

```tsx
import {
  SearchIcon,
  CloseIcon,
} from 'mangalicht-uikit'

<Button
  iconStart={<SearchIcon />}
  aria-label="Поиск"
/>
```

---

# Архитектура

```text
src/
├── components/
│   ├── AlertDialog/
│   ├── Badge/
│   ├── Block/
│   ├── Button/
│   ├── Carousel/
│   ├── Checkbox/
│   ├── DnD/
│   ├── DropDown/
│   ├── ExpandableCard/
│   ├── Image/
│   ├── Input/
│   ├── Markdown/
│   ├── ProgressBar/
│   ├── ScrollArea/
│   ├── Select/
│   ├── Sheet/
│   ├── Slider/
│   ├── Switch/
│   ├── TabList/
│   ├── Toggle/
│   └── Tooltip/
│
├── hooks/
├── icons/
├── shared/
└── index.ts
```

## Компонентная структура

Обычно директория компонента содержит:

```text
Button/
├── Button.module.scss
├── Button.stories.tsx
├── _Button-vars.scss
└── index.tsx
```

Таким образом:

- `index.tsx` — React API и поведение;
- `*.module.scss` — локальные стили;
- `_*vars.scss` — component-specific SCSS tokens;
- `*.stories.tsx` — документация и тестирование через Storybook.

---

# Floating UI

Select, DropDown, Tooltip и Markdown toolbar используют Portal.

Общий Portal root:

```text
src/shared/utils/portalRoot.ts
```

Это позволяет избежать проблем:

- `overflow: hidden` у родителей;
- `z-index`;
- clipping;
- неправильного stacking context.

Позиционирование выполняется через `@floating-ui/dom`, где это необходимо.

---

# Доступность

Компоненты стараются сохранять native HTML semantics.

Примеры:

- `Button` → native `<button>`;
- `Checkbox` → native checkbox;
- `Switch` → native checkbox + `role="switch"`;
- `Slider` → native range;
- `Select` → listbox semantics;
- `Tooltip` → `role="tooltip"` + `aria-describedby`;
- `AlertDialog` → `role="alertdialog"` + `aria-modal`;
- keyboard navigation реализована там, где нативного поведения недостаточно.

---

# Controlled и uncontrolled

Компоненты формы обычно поддерживают оба режима.

Controlled:

```tsx
const [value, setValue] = useState('')

<Input
  value={value}
  onChange={setValue}
/>
```

Uncontrolled:

```tsx
<Input
  defaultValue="Initial value"
/>
```

Аналогичный подход используется в:

- `Checkbox`;
- `Select`;
- `Slider`;
- `Toggle`;
- `MarkdownInput`;
- `MarkdownComment`.

Исключение — `Switch`, который по API является controlled:

```tsx
<Switch
  checked={checked}
  onChange={setChecked}
/>
```

---

# Storybook

Storybook используется для разработки и визуальной проверки компонентов.

Запуск:

```bash
npm run dev
```

По умолчанию Storybook запускается на:

```text
http://localhost:6006
```

Сборка:

```bash
npm run build-storybook
```

Storybook автоматически ищет stories в `src` согласно конфигурации `.storybook/main.ts`.

В toolbar доступно переключение темы `light/dark`.

---

# Сборка

Библиотека собирается Vite Library Mode.

```bash
npm run build
```

Дополнительно:

```bash
npm run typecheck
npm run test
npm run format
```

Упаковка npm tarball:

```bash
npm run pack
```

Результат сборки:

```text
dist/
├── index.js
├── index.d.ts
├── components/
├── icons/
├── hooks/
└── scss/
```

TypeScript declarations генерируются через `vite-plugin-dts`.

CSS/SCSS подключается библиотекой автоматически, а SCSS-ресурсы также доступны через package exports.

---

# Экспорт пакета

Корневой API:

```tsx
import {
  Button,
  Input,
  Select,
  Slider,
  ScrollArea,
  Carousel,
  DragArea,
  DragElement,
  ExpandableCard,
} from 'mangalicht-uikit'
```

Дополнительные package paths:

```text
mangalicht-uikit/components/*
mangalicht-uikit/icons
mangalicht-uikit/hooks
mangalicht-uikit/scss/*
```

`Sheet` сейчас является частью исходной архитектуры, но не экспортируется из `src/components/index.ts`; если компонент должен стать частью публичного API, его необходимо добавить в экспортный файл.

---

# Зависимости

Основные runtime зависимости:

- React 19;
- `@floating-ui/dom`;
- `dompurify`;
- `marked`;
- `lucide-react` как peer dependency.

Инструменты разработки:

- Vite;
- TypeScript;
- Storybook 10;
- Sass;
- Vitest;
- Testing Library;
- `vite-plugin-dts`;
- `vite-plugin-lib-inject-css`.

---

# Архитектурные рекомендации

## 1. Используйте controlled режим для серверного состояния

```tsx
<Select
  value={serverValue}
  onChange={setServerValue}
/>
```

## 2. Используйте uncontrolled режим для простых локальных форм

```tsx
<Input defaultValue="Имя" />
```

## 3. Для floating UI не создавайте собственное позиционирование

Используйте существующие `Select`, `DropDown`, `Tooltip` и их Portal/Floating UI архитектуру.

## 4. Для сортировки используйте только DragArea + DragElement

Не требуется самостоятельно хранить порядок для визуальной сортировки:

```tsx
<DragArea>
  {items.map(item => (
    <DragElement key={item.id} id={item.id}>
      {item.content}
    </DragElement>
  ))}
</DragArea>
```

Получить итоговый порядок можно через:

```tsx
onOrderChange={(order, activeId) => {
  // persist order
}}
```

## 5. Не смешивайте `className` и `classNames` без необходимости

В текущем API:

- `classNames` — основной кастомизационный prop многих UI Kit компонентов;
- `className` используется там, где компонент расширяет native HTML API или исторически использует стандартное имя.

Ориентируйтесь на TypeScript API конкретного компонента.

---

# Лицензия

MIT.
