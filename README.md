# mangalicht-uikit

React UI Kit на **React 19 + TypeScript** для создания переиспользуемых интерфейсов.

Проект построен вокруг:

- React 19;
- TypeScript;
- Vite;
- Storybook;
- SCSS;
- CSS Modules;
- переиспользуемых React hooks;
- Portal для floating UI;
- `@floating-ui/dom` для позиционирования;
- `marked` + `DOMPurify` для Markdown preview;
- controlled / uncontrolled API там, где это предусмотрено компонентом;
- `forwardRef` для компонентов, которым нужен доступ к DOM.

> README актуализирован по текущему состоянию исходников проекта. В частности, устаревший `MarkdownField` заменён фактическими `MarkdownInput`, `MarkdownPreview` и `MarkdownComment`, добавлены `Toggle`, `ScrollArea`, `ExpandableCard` и `Image`, а описание публичных экспортов приведено в соответствие с `src/components/index.ts`.

---

## Навигация

### Публичные компоненты

| Компонент | Назначение | Исходный код |
|---|---|---|
| [Badge](#badge) | Значок уровня | [`src/components/Badge`](./src/components/Badge) |
| [Block](#block) | Контейнер с заголовком | [`src/components/Block`](./src/components/Block) |
| [Button](#button) | Базовая кнопка | [`src/components/Button`](./src/components/Button) |
| [Carousel](#carousel) | Карусель | [`src/components/Carousel`](./src/components/Carousel) |
| [Checkbox](#checkbox) | Checkbox / radio-вариант | [`src/components/Checkbox`](./src/components/Checkbox) |
| [DropDown](#dropdown) | Выпадающее меню с вложенностью | [`src/components/DropDown`](./src/components/DropDown) |
| [ExpandableCard](#expandablecard) | Раскрывающаяся карточка | [`src/components/ExpandableCard`](./src/components/ExpandableCard) |
| [Image](#image) | `<picture>` / `<img>` wrapper | [`src/components/Image`](./src/components/Image) |
| [Input](#input) | Поле ввода с валидацией | [`src/components/Input`](./src/components/Input) |
| [MarkdownInput](#markdowninput) | Markdown textarea с toolbar и history | [`src/components/Markdown`](./src/components/Markdown) |
| [MarkdownPreview](#markdownpreview) | Безопасный Markdown preview | [`src/components/Markdown`](./src/components/Markdown) |
| [MarkdownComment](#markdowncomment) | Markdown-комментарий | [`src/components/Markdown`](./src/components/Markdown) |
| [ProgressBar](#progressbar) | Индикатор прогресса | [`src/components/ProgressBar`](./src/components/ProgressBar) |
| [Select](#select) | Кастомный select / listbox | [`src/components/Select`](./src/components/Select) |
| [Slider](#slider) | Range slider | [`src/components/Slider`](./src/components/Slider) |
| [Switch](#switch) | Переключатель | [`src/components/Switch`](./src/components/Switch) |
| [TabList](#tablist) | Группа вкладок | [`src/components/TabList`](./src/components/TabList) |
| [Toggle](#toggle) | Toggle на базе Button | [`src/components/Toggle`](./src/components/Toggle) |
| [Tooltip](#tooltip) | Floating tooltip | [`src/components/Tooltip`](./src/components/Tooltip) |

### Внутренние / инфраструктурные компоненты

| Компонент | Назначение | Исходный код |
|---|---|---|
| [ScrollArea](#scrollarea) | Кастомный scrollbar / viewport | [`src/components/ScrollArea`](./src/components/ScrollArea) |

`ScrollArea` присутствует в исходниках и имеет собственный Storybook story, но в текущем `src/components/index.ts` **не экспортируется из корневого public API**. Поэтому он документирован отдельно как внутренний компонент текущей архитектуры.

### Хуки

| Hook | Назначение | Исходный код |
|---|---|---|
| [`useAnchoredPosition`](#useanchoredposition) | Позиционирование floating-элементов | [`src/hooks/useAnchoredPosition.ts`](./src/hooks/useAnchoredPosition.ts) |
| [`useAnimationTrigger`](#useanimationtrigger) | Одноразовый animation trigger | [`src/hooks/useAnimationTrigger.ts`](./src/hooks/useAnimationTrigger.ts) |
| [`useAutosizeTextarea`](#useautosizetextarea) | Автоматическая высота textarea | [`src/hooks/useAutosizeTextarea.ts`](./src/hooks/useAutosizeTextarea.ts) |
| [`useClickOutside`](#useclickoutside) | Отслеживание клика вне элемента | [`src/hooks/useClickOutside.ts`](./src/hooks/useClickOutside.ts) |
| [`useHistoryBuffer`](#usehistorybuffer) | Группировка Undo/Redo history | [`src/hooks/useHistoryBuffer.ts`](./src/hooks/useHistoryBuffer.ts) |
| [`useMouseTracking`](#usemousetracking) | Отслеживание координат мыши | [`src/hooks/useMouseTracking.ts`](./src/hooks/useMouseTracking.ts) |
| [`useSelectionAnchor`](#useselectionanchor) | Расчёт позиции выделения textarea | [`src/hooks/useSelectionAnchor.ts`](./src/hooks/useSelectionAnchor.ts) |
| [`useSmoothFollow`](#usesmoothfollow) | Плавное следование за координатой | [`src/hooks/useSmoothFollow.ts`](./src/hooks/useSmoothFollow.ts) |
| [`useValidation`](#usevalidation) | Общая валидация | [`src/hooks/useValidation.ts`](./src/hooks/useValidation.ts) |

> Хуки находятся в `src/hooks`, но текущий `src/index.ts` экспортирует из hooks только типы `ValidationRules` и `ValidateOn`. Остальные hooks являются внутренними building blocks библиотеки.

### Дополнительные разделы

- [Архитектура проекта](#архитектура-проекта)
- [Установка](#установка)
- [Подключение](#подключение)
- [Темизация](#темизация)
- [Portal](#portal)
- [Иконки](#иконки)
- [Стили](#стили)
- [Storybook](#storybook)
- [Сборка](#сборка)
- [Публикация](#публикация)
- [Public API](#public-api)
- [Архитектурные принципы](#архитектурные-принципы)

---

# Возможности

- React 19 + TypeScript;
- Vite library build;
- Storybook 10;
- SCSS и CSS Modules;
- общие theme variables;
- `forwardRef`;
- controlled / uncontrolled компоненты;
- Portal infrastructure;
- floating positioning через `@floating-ui/dom`;
- кастомный `ScrollArea`;
- Select с keyboard navigation и ARIA listbox semantics;
- Markdown editor с floating toolbar;
- grouped Undo/Redo history;
- безопасный Markdown preview через `marked` + `DOMPurify`;
- общая система validation;
- `ResizeObserver` / `MutationObserver` там, где компоненту требуется отслеживать динамический layout;
- sourcemaps;
- TypeScript declaration files;
- экспорт shared SCSS через `dist/scss`.

---

# Технологический стек

| Технология | Назначение |
|---|---|
| React 19 | UI |
| TypeScript | Типизация |
| Vite | Production build |
| Storybook 10 | Разработка и документация |
| Sass | Стили |
| CSS Modules | Изоляция component styles |
| `@floating-ui/dom` | Floating positioning |
| `marked` | Markdown → HTML |
| `DOMPurify` | Sanitization Markdown HTML |

---

# Архитектура проекта

```text
src/
├── components/
│   ├── Badge/
│   ├── Block/
│   ├── Button/
│   ├── Carousel/
│   ├── Checkbox/
│   ├── DropDown/
│   ├── ExpandableCard/
│   ├── Image/
│   ├── Input/
│   ├── Markdown/
│   ├── ProgressBar/
│   ├── ScrollArea/
│   ├── Select/
│   ├── Slider/
│   ├── Switch/
│   ├── TabList/
│   ├── Toggle/
│   └── Tooltip/
│
├── hooks/
│   ├── useAnchoredPosition.ts
│   ├── useAnimationTrigger.ts
│   ├── useAutosizeTextarea.ts
│   ├── useClickOutside.ts
│   ├── useHistoryBuffer.ts
│   ├── useMouseTracking.ts
│   ├── useSelectionAnchor.ts
│   ├── useSmoothFollow.ts
│   └── useValidation.ts
│
├── icons/
├── shared/
└── index.ts
```

Большинство компонентов используют локальную структуру:

```text
Component/
├── index.tsx
├── Component.module.scss
├── _Component-vars.scss
└── Component.stories.tsx
```

У `Badge` и `Markdown` есть внутренняя композиция:

```text
Badge/
├── ProfileLevel/
├── Simple/
└── stories/

Markdown/
├── MarkdownInput.tsx
├── MarkdownPreview.tsx
├── MarkdownComment.tsx
├── Markdown.module.scss
└── stories
```

---

# Установка

```bash
npm install mangalicht-uikit
```

Для локальной разработки:

```bash
npm install
```

---

# Подключение

Основной импорт:

```tsx
import {
	Button,
	Input,
	Select,
	Tooltip,
	Toggle
} from 'mangalicht-uikit'
```

Глобальные стили подключаются самим entry point библиотеки:

```ts
import './shared/normalize.scss'
import './shared/theme-vars.scss'
import './shared/scss/global-styles.scss'
```

Также пакет предоставляет:

```text
mangalicht-uikit/styles.css
mangalicht-uikit/scss/*
```

через `package.json.exports`.

---

# Темизация

Тема построена на CSS custom properties и shared SCSS variables.

Основные источники:

```text
src/shared/theme-vars.scss
src/shared/scss/global-styles.scss
src/shared/_media.scss
src/shared/_mixins.scss
src/shared/_utils.scss
```

Компоненты используют собственные `_Component-vars.scss` для component-specific variables.

Подключение библиотеки не требует ручного импорта каждого `*.module.scss`.

---

# Компоненты

## Badge

В public API `Badge` — это `ProfileLevelBadge`.

Поддерживаемые варианты:

```text
bronze
silver
gold
platinum
ruby
diamond
```

Пример:

```tsx
import { Badge } from 'mangalicht-uikit'

<Badge variant='gold' level={10} />
```

Исходники:

```text
src/components/Badge/ProfileLevel/
src/components/Badge/Simple/
```

`SimpleBadge` существует в исходниках, но в текущем корневом public API отдельно не экспортируется.

---

## Block

Контейнер с заголовком.

```tsx
import { Block } from 'mangalicht-uikit'

<Block
	variant='outlined'
	title='Настройки'
	titleStyle={2}
	width={400}
>
	<p>Содержимое блока</p>
</Block>
```

Поддерживает:

```text
default
outlined
```

`titleStyle` соответствует:

```text
1 → h1
2 → h2
3 → h3
4 → h4
5 → h5
6 → h6
```

Исходник:

```text
src/components/Block/
```

---

## Button

Базовый интерактивный компонент библиотеки.

```tsx
import { Button } from 'mangalicht-uikit'

<Button
	variant='primary'
	onClick={() => {}}
>
	Сохранить
</Button>
```

Поддерживает варианты и animation API, определённые `ButtonProps`, а также `forwardRef`.

Исходник:

```text
src/components/Button/
```

---

## Carousel

Карусель со слайдами.

```tsx
import { Carousel } from 'mangalicht-uikit'

<Carousel
	slides={[
		{
			id: 'one',
			content: <div>Первый</div>
		},
		{
			id: 'two',
			content: <div>Второй</div>
		}
	]}
/>
```

Тип слайда:

```ts
interface CarouselSlide {
	id: string
	content: React.ReactNode
}
```

Поддерживаются controlled / uncontrolled сценарии через `activeIndex` / `defaultActiveIndex`, callback `onSlideChange`, autoplay и параметры визуального представления.

Исходник:

```text
src/components/Carousel/
```

---

## Checkbox

Checkbox с поддержкой checkbox / radio-варианта.

```tsx
import { Checkbox } from 'mangalicht-uikit'

<Checkbox
	checked={checked}
	onChange={setChecked}
>
	Запомнить меня
</Checkbox>
```

Основные типы экспортируются:

```ts
CheckboxProps
CheckboxVariant
```

Исходник:

```text
src/components/Checkbox/
```

---

## DropDown

Выпадающее меню с поддержкой вложенных меню.

```tsx
import {
	DropDown,
	DropDownItem
} from 'mangalicht-uikit'

<DropDown triggerLabel='Меню'>
	<DropDownItem
		label='Профиль'
		onClick={() => {}}
	/>

	<DropDown triggerLabel='Настройки'>
		<DropDownItem label='Общие' />
		<DropDownItem label='Внешний вид' />
	</DropDown>
</DropDown>
```

Архитектура использует context:

```text
DropDown
└── DropDownContext
    └── nested DropDown
        └── DropDownItem
```

Поддерживаются вложенные меню и `DropDownItem`.

Исходник:

```text
src/components/DropDown/
```

---

## ExpandableCard

Карточка, которая изменяет размер при раскрытии.

```tsx
import {
	ExpandableCard,
	ExpandableElenent
} from 'mangalicht-uikit'

<ExpandableCard>
	<ExpandableElenent>
		Содержимое
	</ExpandableElenent>
</ExpandableCard>
```

Поддерживает:

- начальные размеры;
- размеры раскрытого состояния;
- задержку открытия;
- длительность анимации;
- `disabled`;
- desktop hover/pointer interaction;
- touch double-tap сценарий;
- закрытие при клике вне карточки.

> В текущем API имя `ExpandableElenent` написано именно так и является частью public API.

Исходник:

```text
src/components/ExpandableCard/
```

---

## Image

Wrapper над `<picture>` / `<img>` с поддержкой responsive sources.

```tsx
import { Image } from 'mangalicht-uikit'

<Image
	src='/images/fallback.jpg'
	alt='Описание'
	sources={[
		{
			srcSet: '/images/mobile.webp',
			media: '(max-width: 768px)',
			type: 'image/webp'
		}
	]}
/>
```

Тип источника:

```ts
interface ImageSource {
	srcSet: string
	media?: string
	type?: string
}
```

Компонент использует `forwardRef<HTMLImageElement>`.

Исходник:

```text
src/components/Image/
```

---

## Input

Текстовое поле с общей системой validation.

```tsx
import { Input } from 'mangalicht-uikit'

<Input
	label='Email'
	value={email}
	onChange={setEmail}
/>
```

Для validation используются правила из:

```ts
ValidationRules
ValidateOn
```

Исходник:

```text
src/components/Input/
```

---

# Markdown

Markdown-часть библиотеки больше не представлена единым `MarkdownField`.

В текущей архитектуре она разделена на три публичных компонента:

```text
MarkdownInput
MarkdownPreview
MarkdownComment
```

---

## MarkdownInput

Textarea для редактирования Markdown.

```tsx
import { MarkdownInput } from 'mangalicht-uikit'

<MarkdownInput
	value={value}
	onChange={setValue}
	placeholder='Введите Markdown...'
	minRows={5}
	maxRows={15}
/>
```

Поддерживает:

- `value` / `defaultValue`;
- `onChange`;
- `minRows` / `maxRows`;
- `historySize`;
- `maxLength`;
- `disabled`;
- `readOnly`;
- floating Markdown toolbar;
- Undo / Redo;
- Markdown formatting actions;
- callback `onToolbarAction`;
- `forwardRef`.

Действия toolbar:

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

Основная внутренняя архитектура:

```text
MarkdownInput
├── useAutosizeTextarea
├── useHistoryBuffer
├── useSmoothFollow
├── Markdown toolbar
└── textarea
```

Исходник:

```text
src/components/Markdown/MarkdownInput.tsx
```

---

## MarkdownPreview

Рендерит Markdown в безопасный HTML.

```tsx
import { MarkdownPreview } from 'mangalicht-uikit'

<MarkdownPreview
	markdown={markdown}
	emptyText='Нечего показать'
/>
```

Внутри используются:

```text
marked
↓
DOMPurify
↓
dangerouslySetInnerHTML
```

Также реализован кастомный spoiler syntax:

```text
[spoiler]секрет[/spoiler]
```

Клик по spoiler переключает состояние раскрытия.

Props:

```ts
interface MarkdownPreviewProps {
	markdown: string
	emptyText?: string
	className?: string
}
```

Исходник:

```text
src/components/Markdown/MarkdownPreview.tsx
```

---

## MarkdownComment

Отдельный Markdown-компонент для comment-сценария.

Исходники:

```text
src/components/Markdown/MarkdownComment.tsx
src/components/Markdown/MarkdownComment.stories.tsx
```

API определяется `MarkdownCommentProps`.

---

## ScrollArea

`ScrollArea` — кастомный scrollbar-контейнер.

> В текущем архиве компонент существует, имеет public-looking `index.ts` и Storybook story, но **не экспортируется из `src/components/index.ts`**, поэтому не является частью корневого public API.

Поддерживает:

```ts
type ScrollAreaVisibleMode =
	| 'default'
	| 'none'
	| 'scroll'

type ScrollAreaAxis =
	| 'vertical'
	| 'horizontal'
	| 'both'
```

Пример внутреннего использования:

```tsx
<ScrollArea
	axis='vertical'
	visibleMode='scroll'
>
	<div>Длинный контент</div>
</ScrollArea>
```

Imperative API:

```ts
interface ScrollAreaHandle {
	scrollTo(options: ScrollToOptions): void
}
```

Архитектура:

```text
ScrollArea
├── viewport
│   └── content
├── vertical track
│   └── thumb
└── horizontal track
    └── thumb
```

Для производительности положение thumb изменяется напрямую через DOM. При обычном `scroll` React render не выполняется.

Размеры отслеживаются через:

```text
ResizeObserver
MutationObserver
```

Drag thumb использует document-level pointer listeners.

Исходник:

```text
src/components/ScrollArea/
```

---

## Select

Кастомный select, реализованный как listbox.

```tsx
import { Select } from 'mangalicht-uikit'

<Select
	options={[
		{
			value: 'apple',
			label: 'Яблоко'
		},
		{
			value: 'cherry',
			label: 'Вишня',
			disabled: true
		}
	]}
	value={value}
	onChange={setValue}
	placeholder='Выберите фрукт'
/>
```

Тип option:

```ts
interface SelectOption {
	value: string
	label: string
	disabled?: boolean
}
```

Основные props:

```ts
interface SelectProps {
	options: SelectOption[]

	value?: string
	defaultValue?: string

	onChange?: (value: string) => void

	disabled?: boolean
	classNames?: string
	placeholder?: string
	name?: string
	minWidth?: number
}
```

### Accessibility / keyboard

Используется:

```text
role="listbox"
role="option"
aria-activedescendant
aria-selected
```

Поддерживаются:

```text
Enter
Space
ArrowUp
ArrowDown
Home
End
Escape
```

Фокус остаётся на trigger button, а активная option определяется через `aria-activedescendant`.

### Floating panel

Выпадающая панель:

- рендерится через Portal;
- позиционируется через `useAnchoredPosition`;
- закрывается через `useClickOutside`;
- при внешнем scroll закрывается, если событие не относится к самой панели.

В текущем архиве `Select` использует собственный scrollable `ul`; `ScrollArea` ещё не подключён к Select.

Исходник:

```text
src/components/Select/
```

---

## Slider

Slider на основе нативного:

```html
<input type="range">
```

```tsx
import { Slider } from 'mangalicht-uikit'

<Slider
	min={0}
	max={100}
	value={40}
	onChange={setValue}
/>
```

Нативный range сохраняет стандартное keyboard/touch поведение браузера.

Исходник:

```text
src/components/Slider/
```

---

## Switch

Переключатель на основе checkbox semantics.

```tsx
import { Switch } from 'mangalicht-uikit'

<Switch
	checked={enabled}
	onChange={setEnabled}
/>
```

В текущей архитектуре `Switch` является controlled-компонентом.

Исходник:

```text
src/components/Switch/
```

---

## TabList

Группа вкладок с активным индикатором.

```tsx
import {
	TabList
} from 'mangalicht-uikit'

<TabList
	tabs={[
		{
			id: 'write',
			label: 'Написать'
		},
		{
			id: 'preview',
			label: 'Превью'
		}
	]}
	activeTab={activeTab}
	onTabChange={setActiveTab}
/>
```

Тип:

```ts
interface TabItem {
	id: string
	label: string
	icon?: React.ReactNode
}
```

Поддерживаемые варианты определяются `TabListProps`.

Индикатор измеряет активную вкладку и перемещается при изменении `activeTab`.

Исходник:

```text
src/components/TabList/
```

---

## Toggle

`Toggle` — отдельный компонент, построенный поверх `Button`.

```tsx
import { Toggle } from 'mangalicht-uikit'

<Toggle
	checked={active}
	onCheckedChange={setActive}
>
	Жирный
</Toggle>
```

Архитектура:

```text
Toggle
└── Button
```

Поддерживает controlled / uncontrolled состояние:

```ts
checked?: boolean
defaultChecked?: boolean
```

Изменение состояния:

```ts
onCheckedChange?: (
	checked: boolean,
	event: React.MouseEvent<HTMLButtonElement>
) => void
```

Также доступны:

```ts
activeClassName?: string
activeVariant?: ButtonProps['variant']
toggleDisabled?: boolean
```

По умолчанию активное состояние использует variant:

```text
highlight
```

Исходник:

```text
src/components/Toggle/
```

---

## Tooltip

Floating tooltip, следующий за курсором.

```tsx
import {
	Tooltip,
	Button
} from 'mangalicht-uikit'

<Tooltip
	content='Сохранить'
	position='top'
>
	<Button>
		Сохранить
	</Button>
</Tooltip>
```

Основные props:

```ts
interface TooltipProps {
	content: React.ReactNode
	children: React.ReactElement

	position?: 'top' | 'bottom'
	disabled?: boolean

	classNames?: string

	offset?: number
	showDelay?: number
	cursorLag?: number
}
```

По умолчанию:

```text
position = "top"
offset = 12
showDelay = 500
cursorLag = 100
```

Внутренняя архитектура:

```text
Tooltip
├── useMouseTracking
├── useSmoothFollow
└── Portal
```

`cursorLag` управляет плавным отставанием tooltip от координат мыши.

При:

```tsx
cursorLag={0}
```

сглаживание фактически отключается.

Для совместимости с компонентами, которые имеют внутреннюю DOM-структуру, Tooltip использует wrapper:

```tsx
<div style={{ display: 'contents' }}>
	{children}
</div>
```

Это позволяет получать mouse events независимо от внутренней реализации дочернего компонента.

Исходник:

```text
src/components/Tooltip/
```

---

# Хуки

## `useAnchoredPosition`

Общий hook для позиционирования floating panel относительно trigger.

Использует:

```text
@floating-ui/dom
computePosition
autoUpdate
flip
offset
size
```

Поддерживает:

```ts
open
offset
matchWidth
placement
```

Возвращает:

```ts
{
	panelRef,
	style,
	recalculate
}
```

Используется `Select` и другими floating сценариями.

---

## `useAnimationTrigger`

Запускает одноразовый animation trigger после изменения значения.

Исходник:

```text
src/hooks/useAnimationTrigger.ts
```

---

## `useAutosizeTextarea`

Автоматически изменяет высоту textarea на основании количества строк и размеров содержимого.

Используется Markdown editor.

---

## `useClickOutside`

Следит за событиями вне переданного набора refs.

Используется для закрытия:

```text
Select
DropDown
```

и других interactive floating UI.

---

## `useHistoryBuffer`

History buffer для Undo / Redo.

Особенность текущей реализации — группировка строкового ввода в логические блоки.

History boundary создаётся при завершении блока, например:

```text
space
Enter
punctuation
closing delimiter
```

Поэтому последовательность:

```text
H
He
Hel
Hell
Hello
```

не создаёт пять независимых history entries.

После завершения слова:

```text
Hello
Hello 
```

создаётся history boundary.

Также предусмотрен явный:

```ts
commit()
```

для действий, которые не являются обычным посимвольным вводом, например Markdown formatting или paste actions.

API:

```ts
interface UseHistoryBufferResult<T> {
	value: T

	setValue(value: T): void
	commit(): void

	undo(): void
	redo(): void

	canUndo: boolean
	canRedo: boolean

	reset(value: T): void
}
```

Основной потребитель в текущем коде:

```text
MarkdownInput
```

---

## `useMouseTracking`

Отслеживает положение курсора и состояние hover.

Используется `Tooltip`.

---

## `useSelectionAnchor`

Рассчитывает положение текущего выделения внутри `<textarea>`.

Hook создаёт скрытое mirror-представление textarea, измеряет выделенный диапазон и возвращает:

```ts
interface SelectionAnchorRect {
	x: number
	y: number
	width: number
	height: number
}
```

Подписывается на:

```text
selectionchange
resize
scroll
```

и использует `requestAnimationFrame` для ограничения количества перерасчётов.

Hook предназначен для floating UI, привязанного к выделению текста.

---

## `useSmoothFollow`

Плавно перемещает DOM-элемент к заданной координате.

Использует:

```text
requestAnimationFrame
```

и применяет сглаживание через `lag`.

Основной потребитель:

```text
Tooltip
MarkdownInput
```

---

## `useValidation`

Общая система validation.

Используется компонентами формы, которым требуется validation API.

Экспортируемые типы:

```ts
ValidationRules
ValidateOn
```

Доступны из корня пакета:

```tsx
import type {
	ValidationRules,
	ValidateOn
} from 'mangalicht-uikit'
```

---

# Иконки

Исходники:

```text
src/icons/
```

Текущий набор:

```text
Bookmark
Chevron
Close
Loading
Markdown
Redo
Search
Undo
```

Barrel:

```text
src/icons/index.ts
```

Пример:

```tsx
import {
	ChevronIcon,
	UndoIcon,
	RedoIcon,
	SearchIcon
} from 'mangalicht-uikit'
```

Markdown-specific icons находятся в:

```text
src/icons/Markdown.tsx
```

---

# Portal

Общий Portal root создаётся через:

```text
src/shared/utils/portalRoot.ts
```

Используемый контейнер:

```html
<div id="uikit-portal-root"></div>
```

Если контейнера нет, utility создаёт его автоматически.

Portal используется floating-компонентами, в частности:

```text
Tooltip
Select
DropDown
```

Это позволяет не зависеть от:

```text
overflow
z-index
stacking context
```

родительских элементов.

---

# Стили

Каждый компонент, которому нужны локальные стили, использует CSS Modules:

```tsx
import styles from './Button.module.scss'
```

Пример структуры:

```text
Button/
├── index.tsx
├── Button.module.scss
├── _Button-vars.scss
└── Button.stories.tsx
```

SCSS resources:

```text
src/shared/normalize.scss
src/shared/theme-vars.scss
src/shared/_media.scss
src/shared/_mixins.scss
src/shared/_utils.scss
src/shared/scss/global-styles.scss
```

Vite использует:

```ts
generateScopedName:
	'[name]__[local]___[hash:base64:5]'
```

для CSS Modules.

---

# Storybook

Storybook является основной средой разработки и визуальной проверки компонентов.

Запуск:

```bash
npm run dev
```

Порт:

```text
6006
```

Статическая сборка:

```bash
npm run build-storybook
```

Story-файлы находятся рядом с соответствующими компонентами.

Например:

```text
src/components/Button/Button.stories.tsx
src/components/Select/Select.stories.tsx
src/components/Toggle/Toggle.stories.tsx
src/components/Tooltip/Tooltip.stories.tsx
```

Для `Badge` stories находятся во внутренней папке:

```text
src/components/Badge/stories/
```

---

# Сборка

## Library build

```bash
npm run build
```

Vite собирает library entry:

```text
src/index.ts
```

и дополнительно формирует отдельные entry points из исходников через Rollup input.

В сборке:

- React externalized;
- CSS инжектируется через `vite-plugin-lib-inject-css`;
- declaration files создаются через `vite-plugin-dts`;
- sourcemaps включены;
- shared SCSS копируется в `dist/scss`.

---

# Создание npm-архива

```bash
npm run pack
```

Текущий script выполняет:

```bash
npm run build
npm pack
rmdir /s /q dist
```

> Последняя команда использует Windows `rmdir`, поэтому текущий `pack` script ориентирован на Windows shell.

Перед публикацией можно проверить содержимое архива:

```bash
npm pack --dry-run
```

---

# Публикация

Публичное содержимое npm-пакета ограничено:

```json
{
	"files": [
		"dist"
	]
}
```

После сборки публикация выполняется стандартным npm-командой:

```bash
npm publish
```

---

# Public API

Корневой entry:

```text
src/index.ts
```

Он экспортирует:

```text
components
icons
```

и подключает:

```text
normalize.scss
theme-vars.scss
global-styles.scss
```

## Public components

В текущем `src/components/index.ts` доступны:

```tsx
import {
	Switch,
	Toggle,
	Button,
	Checkbox,
	Tooltip,
	Select,
	Badge,
	Block,
	Input,
	MarkdownInput,
	MarkdownPreview,
	MarkdownComment,
	TabList,
	ProgressBar,
	Slider,
	DropDown,
	DropDownItem,
	Carousel,
	ExpandableCard,
	ExpandableElenent,
	Image
} from 'mangalicht-uikit'
```

`MarkdownInput`, `MarkdownPreview` и `MarkdownComment` экспортируются через:

```text
src/components/Markdown/index.ts
```

## Public types

Корневой API экспортирует типы соответствующих public components, включая:

```text
SwitchProps
ToggleProps
ButtonProps
ButtonAnimation
ButtonVariants
CheckboxProps
CheckboxVariant
TooltipProps
TooltipPosition
SelectProps
SelectOption
BadgeProps
BadgeVariant
IBlockProps
BlockVariant
TitleStyle
InputProps
MarkdownInputProps
MarkdownToolbarAction
MarkdownPreviewProps
MarkdownCommentProps
TabListProps
TabItem
ProgressBarProps
ProgressFill
SliderProps
DropDownProps
DropDownItemProps
CarouselProps
CarouselSlide
ExpandableCardProps
ExpandableElenentProps
ImageProps
ImageSource
ValidationRules
ValidateOn
```

### Что не является текущим public API

Несмотря на наличие исходников:

```text
src/components/ScrollArea/
src/hooks/*
```

они не экспортируются напрямую из `src/index.ts` (за исключением validation types).

Поэтому приложение-потребитель не должно рассчитывать на:

```tsx
import {
	ScrollArea,
	useHistoryBuffer
} from 'mangalicht-uikit'
```

если соответствующие exports не будут добавлены в `src/components/index.ts` / `src/index.ts`.

---

# Архитектурные принципы

## 1. Component composition

Сложные компоненты собираются из более простых primitives.

Примеры:

```text
Toggle
└── Button

Tooltip
├── useMouseTracking
├── useSmoothFollow
└── Portal

Select
├── useAnchoredPosition
├── useClickOutside
└── Portal

MarkdownInput
├── useAutosizeTextarea
├── useHistoryBuffer
├── useSmoothFollow
├── Button
└── Markdown icons

DropDown
└── DropDown context
```

---

## 2. Повторно используемая логика находится в hooks

Вместо копирования поведения между компонентами используется:

```text
useAnchoredPosition
useClickOutside
useMouseTracking
useSmoothFollow
useValidation
useAutosizeTextarea
useHistoryBuffer
useSelectionAnchor
```

---

## 3. Нативные элементы используются там, где это оправдано

Примеры:

```text
Button    → <button>
Input     → <input>
Slider    → <input type="range">
Switch    → checkbox semantics
Checkbox  → checkbox / radio semantics
Markdown  → <textarea>
Image     → <picture> + <img>
```

Это сохраняет браузерное поведение, keyboard support и accessibility.

---

## 4. Controlled / uncontrolled API

Там, где архитектура компонента это предусматривает, используются:

```tsx
value={value}
onChange={...}
```

или:

```tsx
defaultValue={...}
```

Примеры:

```text
Input
Checkbox
Select
Slider
Carousel
MarkdownInput
Toggle
```

Для `Toggle` дополнительно используются:

```text
checked
defaultChecked
onCheckedChange
```

---

## 5. Floating UI отделён от layout родителя

Floating components используют Portal и/или `@floating-ui/dom`.

Это особенно важно для:

```text
Tooltip
Select
DropDown
```

где обычный DOM-поток может быть ограничен:

```text
overflow: hidden
transform
stacking context
z-index
```

---

## 6. Scroll performance

`ScrollArea` не хранит положение thumb в React state.

При scroll:

```text
native scroll
    ↓
updateThumbs()
    ↓
DOM style.transform
```

а не:

```text
scroll
 ↓
setState
 ↓
React render
 ↓
options render
```

Размеры пересчитываются через:

```text
ResizeObserver
MutationObserver
```

Это позволяет использовать компонент для динамического контента без постоянных React rerenders.

---

## 7. Markdown разделён на editor и renderer

Текущая архитектура намеренно разделяет:

```text
MarkdownInput
    ↓
редактирование + toolbar + history

MarkdownPreview
    ↓
Markdown → HTML → sanitize → render
```

`MarkdownComment` является отдельным composition layer для comment-сценариев.

Это предпочтительнее старой модели единого `MarkdownField`.

---

## 8. CSS Modules

Внутренние component classes изолированы:

```text
Button.module.scss
Input.module.scss
Select.module.scss
...
```

Общие theme / normalization styles находятся отдельно в `src/shared`.

---

# Aliases

Vite настроен с aliases:

```text
@           → src
@components → src/components
@hooks      → src/hooks
@icons      → src/icons
@shared     → src/shared
```

Пример:

```tsx
import { Button } from '@components/Button'
import { useValidation } from '@hooks/useValidation'
import { SearchIcon } from '@icons/Search'
```

---

# Package scripts

Текущий `package.json` содержит:

### Storybook development

```bash
npm run dev
```

### Library build

```bash
npm run build
```

### Create package archive

```bash
npm run pack
```

### Storybook production build

```bash
npm run build-storybook
```

---

# Dependencies

Runtime dependencies:

```text
@floating-ui/dom
dompurify
marked
```

React и React DOM объявлены как `peerDependencies`:

```json
{
	"react": "^19.2.6",
	"react-dom": "^19.2.6"
}
```

TypeScript, Vite, Storybook, Sass и build plugins находятся в `devDependencies`.

---

# License

MIT
