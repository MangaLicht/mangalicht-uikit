# mangalicht-uikit

React UI Kit на **React 19 + TypeScript**, предназначенный для создания интерфейсов с переиспользуемыми компонентами, общей системой темизации, SCSS/CSS Modules, Storybook и сборкой библиотеки через **Vite**.

# Навигация по компонентам

Быстрый переход к документации и исходному коду компонентов.

| Компонент                       | Описание                                 | Исходный код                                                     |
| ------------------------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| [Badge](#badge)                 | Значок уровня или достижения             | [`src/components/Badge`](./src/components/Badge)                 |
| [Block](#block)                 | Контейнер с заголовком                   | [`src/components/Block`](./src/components/Block)                 |
| [Button](#button)               | Универсальная кнопка                     | [`src/components/Button`](./src/components/Button)               |
| [Carousel](#carousel)           | Карусель с активным раскрытым слайдом    | [`src/components/Carousel`](./src/components/Carousel)           |
| [Checkbox](#checkbox)           | Чекбокс и radio-вариант                  | [`src/components/Checkbox`](./src/components/Checkbox)           |
| [DropDown](#dropdown)           | Выпадающее меню с вложенными подменю     | [`src/components/DropDown`](./src/components/DropDown)           |
| [Input](#input)                 | Поле ввода с валидацией                  | [`src/components/Input`](./src/components/Input)                 |
| [MarkdownField](#markdownfield) | Markdown-редактор с preview              | [`src/components/MarkdownField`](./src/components/MarkdownField) |
| [ProgressBar](#progressbar)     | Индикатор прогресса                      | [`src/components/ProgressBar`](./src/components/ProgressBar)     |
| [Select](#select)               | Кастомный выпадающий список              | [`src/components/Select`](./src/components/Select)               |
| [Slider](#slider)               | Ползунок на основе `input[type="range"]` | [`src/components/Slider`](./src/components/Slider)               |
| [Switch](#switch)               | Переключатель                            | [`src/components/Switch`](./src/components/Switch)               |
| [TabList](#tablist)             | Группа вкладок                           | [`src/components/TabList`](./src/components/TabList)             |
| [Tooltip](#tooltip)             | Всплывающая подсказка                    | [`src/components/Tooltip`](./src/components/Tooltip)             |

## Иконки

| Раздел            | Описание                            | Исходный код               |
| ----------------- | ----------------------------------- | -------------------------- |
| [Иконки](#иконки) | SVG-иконки в виде React-компонентов | [`src/icons`](./src/icons) |

## Хуки

| Хук                                           | Назначение                                 | Исходный код                                                             |
| --------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------ |
| [`useAnchoredPosition`](#useanchoredposition) | Позиционирование floating-элементов        | [`src/hooks/useAnchoredPosition.ts`](./src/hooks/useAnchoredPosition.ts) |
| [`useAnimationTrigger`](#useanimationtrigger) | Управление одноразовыми анимациями         | [`src/hooks/useAnimationTrigger.ts`](./src/hooks/useAnimationTrigger.ts) |
| [`useAutosizeTextarea`](#useautosizetextarea) | Автоматическая высота textarea             | [`src/hooks/useAutosizeTextarea.ts`](./src/hooks/useAutosizeTextarea.ts) |
| [`useClickOutside`](#useclickoutside)         | Обработка кликов вне элемента              | [`src/hooks/useClickOutside.ts`](./src/hooks/useClickOutside.ts)         |
| [`useMouseTracking`](#usemousetracking)       | Отслеживание положения мыши                | [`src/hooks/useMouseTracking.ts`](./src/hooks/useMouseTracking.ts)       |
| [`useSmoothFollow`](#usesmoothfollow)         | Плавное следование элемента за координатой | [`src/hooks/useSmoothFollow.ts`](./src/hooks/useSmoothFollow.ts)         |
| [`useValidation`](#usevalidation)             | Общая система валидации                    | [`src/hooks/useValidation.ts`](./src/hooks/useValidation.ts)             |

---

# Навигация по архитектуре

| Раздел                                      | Назначение                            | Расположение                                                         |
| ------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------- |
| [Компоненты](#компоненты)                   | Основные UI-компоненты                | [`src/components`](./src/components)                                 |
| [Хуки](#хуки)                               | Переиспользуемая логика               | [`src/hooks`](./src/hooks)                                           |
| [Иконки](#иконки)                           | SVG React-компоненты                  | [`src/icons`](./src/icons)                                           |
| [Стили и CSS Modules](#стили-и-css-modules) | Локальные стили компонентов           | [`src/components/*/*.module.scss`](./src/components)                 |
| [Общие SCSS-ресурсы](#общие-scss-ресурсы)   | Темы, mixins, normalize и utilities   | [`src/shared`](./src/shared)                                         |
| [Portal](#portal)                           | Общий контейнер для floating UI       | [`src/shared/utils/portalRoot.ts`](./src/shared/utils/portalRoot.ts) |
| [Storybook](#storybook)                     | Документация и разработка компонентов | [`.storybook`](./.storybook)                                         |
| [Конфигурация Vite](#сборка-библиотеки)     | Сборка npm-пакета                     | [`vite.config.ts`](./vite.config.ts)                                 |

## Содержание

- [Возможности](#возможности)
- [Технологический стек](#технологический-стек)
- [Архитектура проекта](#архитектура-проекта)
- [Установка](#установка)
- [Подключение](#подключение)
- [Темизация](#темизация)
- [Компоненты](#компоненты)
    - [Button](#button)
    - [Switch](#switch)
    - [Checkbox](#checkbox)
    - [Input](#input)
    - [MarkdownField](#markdownfield)
    - [Select](#select)
    - [Slider](#slider)
    - [ProgressBar](#progressbar)
    - [TabList](#tablist)
    - [Tooltip](#tooltip)
    - [Block](#block)
    - [Badge](#badge)
    - [DropDown](#dropdown)
    - [Carousel](#carousel)
- [Хуки](#хуки)
- [Иконки](#иконки)
- [Стили и CSS Modules](#стили-и-css-modules)
- [Валидация](#валидация)
- [Portal](#portal)
- [Storybook](#storybook)
- [Сборка библиотеки](#сборка-библиотеки)
- [Публикация пакета](#публикация-пакета)
- [Экспорты пакета](#экспорты-пакета)
- [Архитектурные принципы](#архитектурные-принципы)

---

## Возможности

- React 19 + TypeScript
- Vite для сборки библиотеки
- Storybook для разработки и документации компонентов
- SCSS
- CSS Modules для изолированных стилей компонентов
- светлая и тёмная темы
- CSS custom properties для дизайн-токенов
- controlled/uncontrolled компоненты форм
- `forwardRef` для доступа к нативным DOM-элементам
- переиспользуемые React-хуки
- React Portal для всплывающих элементов
- позиционирование через `@floating-ui/dom`
- Markdown-редактор с безопасным HTML-preview
- встроенная валидация полей
- TypeScript declaration files
- sourcemap при сборке
- экспорт исходных SCSS-файлов
- поддержка `prefers-reduced-motion` для анимаций

---

# Технологический стек

| Технология                   | Назначение                          |
| ---------------------------- | ----------------------------------- |
| React 19                     | UI-компоненты                       |
| TypeScript                   | Типизация                           |
| Vite                         | Сборка библиотеки                   |
| Storybook 10                 | Разработка и документация           |
| SCSS / Sass                  | Стили                               |
| CSS Modules                  | Изоляция стилей компонентов         |
| `@floating-ui/dom`           | Позиционирование floating-элементов |
| `marked`                     | Парсинг Markdown                    |
| `dompurify`                  | Безопасная очистка HTML             |
| `vite-plugin-dts`            | Генерация `.d.ts`                   |
| `vite-plugin-lib-inject-css` | Подключение CSS библиотеки          |

---

# Архитектура проекта

```text
mangalicht-uikit/
│
├── .storybook/
│   ├── main.ts
│   └── preview.tsx
│
├── src/
│   │
│   ├── components/
│   │   ├── Badge/
│   │   ├── Block/
│   │   ├── Button/
│   │   ├── Carousel/
│   │   ├── Checkbox/
│   │   ├── DropDown/
│   │   ├── Input/
│   │   ├── MarkdownField/
│   │   ├── ProgressBar/
│   │   ├── Select/
│   │   ├── Slider/
│   │   ├── Switch/
│   │   ├── TabList/
│   │   └── Tooltip/
│   │
│   │   └── index.ts
│   │
│   ├── hooks/
│   │   ├── useAnchoredPosition.ts
│   │   ├── useAnimationTrigger.ts
│   │   ├── useAutosizeTextarea.ts
│   │   ├── useClickOutside.ts
│   │   ├── useMouseTracking.ts
│   │   ├── useSmoothFollow.ts
│   │   └── useValidation.ts
│   │
│   ├── icons/
│   │   ├── Chevron.tsx
│   │   ├── Close.tsx
│   │   ├── Loading.tsx
│   │   ├── Markdown.tsx
│   │   ├── Search.tsx
│   │   └── index.ts
│   │
│   ├── shared/
│   │   ├── scss/
│   │   │   └── global-styles.scss
│   │   ├── types/
│   │   │   └── IUIKitProps.ts
│   │   ├── utils/
│   │   │   └── portalRoot.ts
│   │   ├── _media.scss
│   │   ├── _mixins.scss
│   │   ├── _utils.scss
│   │   ├── normalize.scss
│   │   └── theme-vars.scss
│   │
│   ├── global.d.ts
│   └── index.ts
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Ответственность директорий

### `src/components`

Основные UI-компоненты библиотеки.

Каждый компонент, как правило, содержит собственную директорию:

```text
Button/
├── Button.module.scss
├── Button.stories.tsx
├── _Button-vars.scss
└── index.tsx
```

Таким образом, логика компонента, его стили, SCSS-переменные и Storybook story находятся рядом.

### `src/hooks`

Переиспользуемая поведенческая логика, не привязанная к конкретному компоненту.

Например:

- позиционирование floating-элементов;
- определение клика вне элемента;
- отслеживание мыши;
- плавное следование за курсором;
- запуск анимаций;
- автоматическое изменение высоты textarea;
- валидация.

### `src/icons`

SVG-иконки в виде React-компонентов.

Иконки экспортируются через:

```tsx
import { SearchIcon, CloseIcon } from 'mangalicht-uikit'
```

### `src/shared`

Общие ресурсы библиотеки:

- дизайн-токены;
- темы;
- normalize;
- глобальные стили;
- SCSS mixins;
- типы;
- DOM utilities;
- portal root.

### `.storybook`

Конфигурация Storybook.

Storybook автоматически ищет:

```text
src/**/*.mdx
src/**/*.stories.ts
src/**/*.stories.tsx
```

---

# Установка

Для установки опубликованного пакета:

```bash
npm install mangalicht-uikit
```

Пакет использует React 19 и React DOM 19 как `peerDependencies`.

В проекте-потребителе должны быть установлены:

```bash
npm install react react-dom
```

---

# Подключение

Основные компоненты и иконки доступны из корневого экспорта:

```tsx
import { Button, Input, Select, Switch, SearchIcon } from 'mangalicht-uikit'
```

Стили библиотеки подключаются автоматически через entry point:

```text
src/index.ts
```

Он экспортирует компоненты и иконки, а также подключает:

```text
normalize.scss
theme-vars.scss
global-styles.scss
```

---

# Темизация

UI Kit использует атрибут:

```html
data-theme
```

с двумя поддерживаемыми значениями:

```text
light
dark
```

Например:

```html
<html data-theme="light"></html>
```

или:

```html
<html data-theme="dark"></html>
```

В React:

```tsx
document.documentElement.dataset.theme = 'dark'
```

Переключение темы в runtime:

```tsx
const toggleTheme = () => {
	document.documentElement.dataset.theme =
		document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
}
```

Дизайн-токены компонентов доступны через CSS custom properties:

```css
var(--uikit-bg-block)
var(--uikit-text-main)
var(--uikit-accent)
```

## Storybook

В Storybook переключение темы доступно через глобальный toolbar.

Конфигурация находится в:

```text
.storybook/preview.tsx
```

Storybook автоматически устанавливает:

```html
data-theme="light"
```

или:

```html
data-theme="dark"
```

на `document.documentElement`.

---

# Компоненты

## Button

Универсальная кнопка.

```tsx
import { Button } from 'mangalicht-uikit'
;<Button
	labelText='Сохранить'
	variant='highlight'
	onClick={() => console.log('saved')}
/>
```

Поддерживаемые варианты:

```text
default
highlight
bordered
borderedAccent
ghost
transparent
```

Основные props:

```ts
interface ButtonProps {
	labelText?: string
	variant?: ButtonVariants
	isAlert?: boolean
	disabled?: boolean
	type?: 'button' | 'submit' | 'reset'
	iconStart?: React.ReactNode
	iconEnd?: React.ReactNode
	animation?: 'default' | 'none'
	classNames?: string
}
```

Компонент также поддерживает нативные атрибуты `<button>`.

---

## Switch

Переключатель на основе нативного:

```html
input[type="checkbox"]
```

Компонент полностью controlled:

```tsx
import { useState } from 'react'
import { Switch } from 'mangalicht-uikit'

function Example() {
	const [enabled, setEnabled] = useState(false)

	return (
		<Switch
			checked={enabled}
			onChange={setEnabled}
			labelText='Тёмная тема'
		/>
	)
}
```

Props:

```ts
interface SwitchProps {
	checked: boolean
	onChange: (checked: boolean) => void
	labelText?: string
	disabled?: boolean
	name?: string
	size?: 'default' | 'small'
}
```

Нативный input используется для доступности и клавиатурного управления.

---

## Checkbox

Чекбокс с двумя визуальными вариантами:

```text
default
radio
```

```tsx
import { Checkbox } from 'mangalicht-uikit'
;<Checkbox
	labelText='Согласен с условиями'
	defaultChecked={false}
	onClick={checked => console.log(checked)}
/>
```

Поддерживаются оба режима:

```tsx
<Checkbox checked={checked} onClick={setChecked} />
```

и:

```tsx
<Checkbox defaultChecked />
```

---

## Input

Однострочное поле ввода с поддержкой валидации.

```tsx
import { useState } from 'react'
import { Input } from 'mangalicht-uikit'

function Example() {
	const [value, setValue] = useState('')

	return (
		<Input
			label='Email'
			value={value}
			onChange={setValue}
			placeholder='Введите email'
		/>
	)
}
```

Поддерживает:

- controlled/uncontrolled режим;
- label;
- hint;
- внешнюю ошибку;
- встроенную валидацию;
- иконку;
- очистку;
- нативные `<input>` props.

Пример поиска:

```tsx
<Input
	type='search'
	icon={<SearchIcon />}
	clearable
	value={query}
	onChange={setQuery}
	placeholder='Поиск...'
/>
```

Основные дополнительные props:

```ts
interface InputProps {
	value?: string
	defaultValue?: string
	onChange?: (
		value: string,
		event?: React.ChangeEvent<HTMLInputElement>
	) => void

	label?: string
	hint?: string
	errorMessage?: string

	rules?: ValidationRules
	validateOn?: 'change' | 'blur' | 'submit'

	onValidChange?: (isValid: boolean, error: string | null) => void

	icon?: React.ReactNode
	clearable?: boolean

	classNames?: string
	wrapperClassName?: string
}
```

---

## MarkdownField

Многострочный Markdown-редактор.

```tsx
import { MarkdownField } from 'mangalicht-uikit'
;<MarkdownField label='Описание' value={text} onChange={setText} />
```

Возможности:

- Markdown toolbar;
- bold;
- italic;
- links;
- lists;
- code;
- spoilers;
- preview;
- переключение `Написать / Превью`;
- автоматическое изменение высоты;
- ограничение максимальной высоты;
- счётчик символов;
- валидация.

Пример:

```tsx
<MarkdownField
	value={text}
	onChange={setText}
	minRows={5}
	maxRows={15}
	showToolbar
	showPreviewToggle
	showCounter
	showSpoilerButton
/>
```

Markdown обрабатывается через `marked`.

HTML preview дополнительно очищается через `DOMPurify` перед вставкой в DOM.

Это предотвращает вставку непроверенного HTML из пользовательского Markdown.

---

## Select

Кастомный выпадающий список.

```tsx
import { useState } from 'react'
import { Select } from 'mangalicht-uikit'

function Example() {
	const [value, setValue] = useState<string>()

	return (
		<Select
			options={[
				{ value: 'apple', label: 'Яблоко' },
				{ value: 'banana', label: 'Банан' },
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
	)
}
```

Формат option:

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
	placeholder?: string
	name?: string
	minWidth?: number

	classNames?: string
}
```

### Клавиатура

Поддерживаются:

- `Enter`;
- `Space`;
- `ArrowUp`;
- `ArrowDown`;
- `Home`;
- `End`;
- `Escape`.

Select использует listbox-паттерн с `aria-activedescendant`.

Выпадающая панель рендерится через Portal.

Позиционирование выполняется через `@floating-ui/dom`.

---

## Slider

Ползунок на основе нативного:

```html
input[type="range"]
```

```tsx
import { Slider } from 'mangalicht-uikit'
;<Slider min={0} max={100} value={40} onChange={setValue} />
```

Основные props:

```ts
interface SliderProps {
	value?: number
	defaultValue?: number

	onChange?: (
		value: number,
		event?: React.ChangeEvent<HTMLInputElement>
	) => void

	min?: number
	max?: number
	step?: number

	showLabel?: boolean
	label?: React.ReactNode

	classNames?: string
	wrapperClassName?: string
}
```

Нативный range input обеспечивает:

- клавиатурное управление;
- touch drag;
- стрелки;
- `Home`;
- `End`;
- `PageUp`;
- `PageDown`;
- стандартную ARIA-семантику.

---

## ProgressBar

Индикатор прогресса.

```tsx
import { ProgressBar } from 'mangalicht-uikit'
;<ProgressBar min={0} max={100} value={72} />
```

Props:

```ts
interface ProgressBarProps {
	min?: number
	max?: number
	value: number

	showLabel?: boolean
	label?: React.ReactNode
	ariaLabel?: string

	fillColor?: 'yellow' | 'accent'

	classNames?: string
	wrapperClassName?: string
}
```

`value` может выходить за пределы диапазона — визуальное заполнение при этом ограничивается диапазоном `[min, max]`.

---

## TabList

Группа вкладок с анимированным индикатором.

```tsx
import { useState } from 'react'
import { TabList } from 'mangalicht-uikit'

function Example() {
	const [activeTab, setActiveTab] = useState('home')

	return (
		<TabList
			tabs={[
				{ id: 'home', label: 'Главная' },
				{ id: 'about', label: 'О нас' },
				{ id: 'settings', label: 'Настройки' }
			]}
			activeTab={activeTab}
			onTabChange={setActiveTab}
		/>
	)
}
```

Структура вкладки:

```ts
interface TabItem {
	id: string
	label: string
	icon?: React.ReactNode
}
```

Варианты:

```text
block
inner
```

Индикатор автоматически измеряет активную вкладку и перемещается при изменении `activeTab`.

---

## Tooltip

Всплывающая подсказка, привязанная к позиции курсора.

```tsx
import { Tooltip } from 'mangalicht-uikit'
;<Tooltip content='Подсказка' position='top'>
	<button>Наведи на меня</button>
</Tooltip>
```

Props:

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

Позиция подсказки обновляется через `requestAnimationFrame`.

`cursorLag` задаёт инерционное отставание tooltip от курсора.

При:

```tsx
cursorLag={0}
```

сглаживание отключается.

Tooltip использует Portal и автоматически создаёт:

```html
<div id="uikit-portal-root"></div>
```

---

## Block

Контейнер с заголовком.

```tsx
import { Block } from 'mangalicht-uikit'
;<Block variant='outlined' title='Настройки' titleStyle={2} width={400}>
	<p>Содержимое блока</p>
</Block>
```

Варианты:

```text
default
outlined
```

`titleStyle` определяет используемый HTML-заголовок:

```text
1 → h1
2 → h2
3 → h3
4 → h4
5 → h5
6 → h6
```

Дополнительные возможности:

```ts
titleChildren?: React.ReactNode
width?: number
height?: number
classNames?: string
```

`titleChildren` используется для дополнительного содержимого рядом с заголовком.

---

## Badge

Значок уровня/достижения.

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
;<Badge variant='gold' level={10} />
```

Автоматически будет сформировано:

```text
Уровень 10
```

Можно передать собственное содержимое:

```tsx
<Badge variant='diamond' label='VIP' />
```

Анимацию блика можно отключить:

```tsx
<Badge variant='gold' level={10} shine={false} />
```

Анимация учитывает:

```css
prefers-reduced-motion
```

---

## DropDown

Выпадающее меню с поддержкой вложенных подменю.

```tsx
import { DropDown, DropDownItem } from 'mangalicht-uikit'
;<DropDown triggerLabel='Меню'>
	<DropDownItem label='Профиль' onClick={() => {}} />

	<DropDownItem label='Настройки' onClick={() => {}} />
</DropDown>
```

Для вложенного меню используется сам `DropDown`:

```tsx
<DropDown triggerLabel='Настройки'>
	<DropDownItem label='Профиль' />

	<DropDown triggerLabel='Внешний вид'>
		<DropDownItem label='Светлая тема' />
		<DropDownItem label='Тёмная тема' />

		<DropDown triggerLabel='Дополнительно'>
			<DropDownItem label='Пункт 1' />
			<DropDownItem label='Пункт 2' />
		</DropDown>
	</DropDown>
</DropDown>
```

Архитектура DropDown построена на контексте.

Корневой `DropDown` создаёт состояние меню, а вложенные экземпляры получают его через `DropDownContext`.

Поддерживаются:

- произвольная глубина вложенности;
- flyout-подменю;
- закрытие после выбора;
- блокировка;
- кастомный trigger;
- иконки;
- фиксированная ширина корневого меню.

Основные props:

```ts
interface DropDownProps {
	children: React.ReactNode

	trigger?: React.ReactElement
	triggerLabel?: string

	width?: number
	disabled?: boolean

	closeOnItemClick?: boolean

	onClick?: (event: React.MouseEvent<HTMLLIElement>) => void

	icon?: React.ReactNode
}
```

Элемент меню:

```ts
interface DropDownItemProps {
	label: string
	onClick?: (event: React.MouseEvent<HTMLLIElement>) => void
	disabled?: boolean
	icon?: React.ReactNode
	classNames?: string
}
```

---

## Carousel

Карусель со слайдами, активным раскрытым слайдом и компактными соседними слайдами.

```tsx
import { Carousel } from 'mangalicht-uikit'
;<Carousel
	slides={[
		{
			id: 'one',
			content: <div>Первый слайд</div>
		},
		{
			id: 'two',
			content: <div>Второй слайд</div>
		},
		{
			id: 'three',
			content: <div>Третий слайд</div>
		}
	]}
/>
```

Структура слайда:

```ts
interface CarouselSlide {
	id: string
	content: React.ReactNode
}
```

Основные props:

```ts
interface CarouselProps {
	slides: CarouselSlide[]

	activeIndex?: number
	defaultActiveIndex?: number

	onSlideChange?: (index: number) => void

	autoPlayInterval?: number

	showArrows?: boolean
	showDots?: boolean

	height?: number
	collapsedWidth?: number
	gap?: number

	classNames?: string
}
```

Поддерживаются controlled и uncontrolled режимы:

```tsx
<Carousel
	slides={slides}
	activeIndex={activeIndex}
	onSlideChange={setActiveIndex}
/>
```

или:

```tsx
<Carousel slides={slides} defaultActiveIndex={0} />
```

### Архитектура бесконечной прокрутки

Carousel использует несколько копий массива слайдов:

```text
COPY 0
COPY 1
COPY 2  ← центральная копия
COPY 3
COPY 4
```

После достижения края карусель выполняет невидимый reset в центральную копию.

Reset выполняется с временным отключением CSS transition и с принудительным reflow через `offsetWidth`, что предотвращает визуальное проигрывание reset-анимации.

Размер активного слайда рассчитывается относительно ширины контейнера.

Ширина контейнера отслеживается через `ResizeObserver`.

---

# Хуки

Все переиспользуемые хуки находятся в:

```text
src/hooks/
```

## `useValidation`

Общая система валидации для:

- `Input`;
- `MarkdownField`.

Поддерживает правила:

```text
required
minLength
maxLength
pattern
validate
```

Режим запуска:

```text
blur
change
submit
```

Типы `ValidationRules` и `ValidateOn` экспортируются из пакета.

```tsx
import type { ValidationRules, ValidateOn } from 'mangalicht-uikit'
```

---

## `useAnchoredPosition`

Общий механизм позиционирования floating-элементов относительно якоря.

Используется для компонентов, которым необходимо отображать панели вне обычного DOM-потока.

---

## `useClickOutside`

Отслеживает клики за пределами заданного элемента.

Используется для закрытия интерактивных floating-компонентов.

---

## `useAutosizeTextarea`

Автоматически изменяет высоту textarea в зависимости от содержимого.

Поддерживает:

```ts
minRows
maxRows
enabled
```

Используется `MarkdownField`.

При достижении `maxRows` появляется внутренний scroll.

---

## `useAnimationTrigger`

Запускает одноразовую анимацию после изменения указанного значения.

```tsx
const animate = useAnimationTrigger(value, 500)
```

Первоначальный render игнорируется.

---

## `useMouseTracking`

Универсальное отслеживание положения мыши.

Возвращает:

```ts
{
	;(isHovering, handlers)
}
```

Используется `Tooltip`, но сам хук не связан с tooltip и может применяться в других сценариях.

---

## `useSmoothFollow`

Плавное следование DOM-элемента за целевой координатой.

Использует:

```text
requestAnimationFrame
```

и экспоненциальное сглаживание.

Основной параметр:

```ts
lag
```

Чем больше `lag`, тем сильнее инерционное отставание.

---

# Иконки

Иконки экспортируются из корня пакета.

Доступны:

```tsx
import {
	ChevronIcon,
	SearchIcon,
	CloseIcon,
	LoadingIcon,
	BoldIcon,
	ItalicIcon,
	LinkIcon,
	ListIcon,
	CodeIcon,
	EyeIcon,
	PencilIcon
} from 'mangalicht-uikit'
```

Исходники находятся в:

```text
src/icons/
```

Иконки реализованы как React-компоненты.

---

# Стили и CSS Modules

Каждый компонент хранит свои стили рядом с исходным кодом:

```text
Button/
├── index.tsx
├── Button.module.scss
├── Button.stories.tsx
└── _Button-vars.scss
```

Компонент импортирует собственный CSS Module:

```tsx
import styles from './Button.module.scss'
```

Классы генерируются Vite с уникальными именами.

В конфигурации используется:

```ts
generateScopedName: '[name]__[local]___[hash:base64:5]'
```

Это снижает вероятность конфликтов CSS библиотеки со стилями приложения-потребителя.

---

# Общие SCSS-ресурсы

В:

```text
src/shared/
```

находятся:

```text
normalize.scss
theme-vars.scss
_media.scss
_mixins.scss
_utils.scss
```

и:

```text
shared/scss/global-styles.scss
```

Они используются для:

- нормализации;
- темизации;
- глобальных стилей;
- media queries;
- mixins;
- общих SCSS utilities.

При сборке исходные SCSS-файлы также копируются в:

```text
dist/scss/
```

Это позволяет потребителю при необходимости использовать исходные SCSS-ресурсы темы и общих стилей.

---

# Portal

Для floating-компонентов используется общий portal root:

```html
<div id="uikit-portal-root"></div>
```

Он создаётся автоматически функцией:

```text
src/shared/utils/portalRoot.ts
```

Если элемента ещё нет, библиотека создаёт его внутри:

```html
<body></body>
```

Portal root:

```css
position: fixed;
inset: 0;
pointer-events: none;
z-index: 10000;
```

Отдельные floating-панели могут включать `pointer-events` самостоятельно.

Это позволяет:

- не зависеть от `overflow: hidden` родителя;
- избежать проблем с `z-index`;
- вынести floating UI из локального stacking context.

Portal используется, в частности, для:

- `Tooltip`;
- `Select`;
- floating-панелей `DropDown`.

---

# Storybook

Storybook используется как основная среда разработки и визуального тестирования компонентов.

Запуск:

```bash
npm run dev
```

После запуска Storybook доступен по адресу:

```text
http://localhost:6006
```

Story-файлы находятся непосредственно рядом с компонентами:

```text
src/components/Button/Button.stories.tsx
src/components/Input/Input.stories.tsx
src/components/Carousel/Carousel.stories.tsx
```

Это позволяет изменять компонент и его документацию в одном месте.

## Темы Storybook

Storybook предоставляет глобальный toolbar:

```text
Light
Dark
```

Переключение изменяет:

```html
data-theme
```

на `document.documentElement`.

---

# Сборка Storybook

Для создания статической версии:

```bash
npm run build-storybook
```

Результатом является статическая сборка Storybook.

---

# Сборка библиотеки

Для production-сборки:

```bash
npm run build
```

Используется:

```text
Vite
```

Конфигурация находится в:

```text
vite.config.ts
```

## Что делает сборка

Vite:

1. собирает TypeScript/React;
2. обрабатывает SCSS;
3. создаёт CSS Modules;
4. генерирует declaration files;
5. создаёт sourcemaps;
6. исключает React из bundle;
7. копирует общие SCSS-файлы;
8. формирует ESM и CommonJS entry points.

---

# Структура `dist`

Публичная структура пакета определяется `package.json`.

Основные entry points:

```text
dist/
├── index.js
├── index.cjs
├── index.d.ts
├── index.css
├── components/
├── hooks/
├── icons/
├── shared/
└── scss/
```

Конкретный набор внутренних JS-файлов формируется Vite/Rollup на основании исходников `src`.

---

# Публикация пакета

В текущей версии проекта **нет `npm run publish`**.

Для подготовки npm-пакета используется:

```bash
npm run pack
```

Команда выполняет:

```bash
npm run build
npm pack
```

После этого создаётся `.tgz` архив пакета.

Для публикации в npm стандартным способом:

```bash
npm publish
```

Перед публикацией рекомендуется проверить:

```bash
npm pack --dry-run
```

и убедиться, что в пакет попадает только необходимое содержимое.

Публичное содержимое ограничивается настройкой:

```json
{
	"files": ["dist"]
}
```

---

# Экспорты пакета

Главная точка входа:

```text
src/index.ts
```

Она экспортирует:

```text
components
icons
```

и подключает глобальные SCSS:

```text
normalize.scss
theme-vars.scss
global-styles.scss
```

## Компоненты

Через:

```tsx
import {
	Badge,
	Block,
	Button,
	Carousel,
	Checkbox,
	DropDown,
	DropDownItem,
	Input,
	MarkdownField,
	ProgressBar,
	Select,
	Slider,
	Switch,
	TabList,
	Tooltip
} from 'mangalicht-uikit'
```

## Типы

Типы компонентов также экспортируются:

```tsx
import type {
	ButtonProps,
	SelectProps,
	InputProps,
	SliderProps,
	CarouselProps,
	CarouselSlide,
	DropDownProps,
	DropDownItemProps,
	MarkdownFieldProps,
	ProgressBarProps,
	SwitchProps,
	CheckboxProps,
	TabListProps,
	BadgeProps
} from 'mangalicht-uikit'
```

Также доступны:

```tsx
import type { ValidationRules, ValidateOn } from 'mangalicht-uikit'
```

## Иконки

```tsx
import {
	ChevronIcon,
	CloseIcon,
	SearchIcon,
	LoadingIcon,
	BoldIcon,
	ItalicIcon,
	LinkIcon,
	ListIcon,
	CodeIcon,
	EyeIcon,
	PencilIcon
} from 'mangalicht-uikit'
```

---

# Архитектурные принципы

## 1. Компоненты изолированы

Каждый компонент содержит собственную реализацию:

```text
Component/
├── index.tsx
├── Component.module.scss
├── _Component-vars.scss
└── Component.stories.tsx
```

Это упрощает:

- поддержку;
- тестирование;
- изменение стилей;
- развитие компонентов независимо друг от друга.

---

## 2. Поведение выносится в хуки

Компоненты не должны содержать универсальную логику, если её можно переиспользовать.

Например:

```text
Tooltip
 ├── useMouseTracking
 └── useSmoothFollow

Select
 ├── useAnchoredPosition
 └── useClickOutside

Input
 └── useValidation

MarkdownField
 ├── useValidation
 └── useAutosizeTextarea
```

---

## 3. Нативные HTML-элементы используются там, где это возможно

Например:

```text
Switch     → input[type=checkbox]
Checkbox   → input[type=checkbox]
Slider     → input[type=range]
Button     → button
Input      → input
Markdown   → textarea
```

Это позволяет сохранять нативное поведение браузера и доступность.

---

## 4. Controlled / uncontrolled API

Компоненты формы, где это уместно, поддерживают оба режима.

Controlled:

```tsx
<Input value={value} onChange={setValue} />
```

Uncontrolled:

```tsx
<Input defaultValue='Hello' />
```

Аналогичный подход используется в:

- `Checkbox`;
- `Select`;
- `Slider`;
- `Input`;
- `MarkdownField`;
- `Carousel`.

`Switch` намеренно остаётся полностью controlled.

---

## 5. `forwardRef`

Компоненты, которым необходим прямой доступ к DOM-элементу, используют:

```tsx
forwardRef(...)
```

Это позволяет потребителю библиотеки:

```tsx
const inputRef = useRef<HTMLInputElement>(null)

<Input ref={inputRef} />
```

и получать доступ к соответствующему нативному элементу.

---

## 6. Floating UI отделён от обычного DOM-потока

`Tooltip`, `Select` и `DropDown` используют отдельный Portal.

Это предотвращает типичные проблемы:

```text
overflow: hidden
z-index
stacking context
transform
```

родительских элементов.

---

## 7. CSS Modules для локальных стилей

Компоненты не используют глобальные CSS-классы для своей внутренней структуры.

Вместо этого:

```tsx
styles.button
styles.label
styles.icon
```

генерируются в уникальные имена.

Глобальными остаются только общие ресурсы:

```text
normalize
theme
global styles
```

---

## 8. Визуальная логика находится в Storybook

Каждый компонент имеет Storybook story:

```text
Component.stories.tsx
```

Это позволяет проверять:

- варианты;
- состояния;
- размеры;
- взаимодействия;
- темы;
- edge cases.

---

# Скрипты

В `package.json` доступны следующие команды.

### Разработка

```bash
npm run dev
```

Запускает Storybook на порту `6006`.

### Production Storybook

```bash
npm run build-storybook
```

Создаёт статическую сборку Storybook.

### Сборка библиотеки

```bash
npm run build
```

Создаёт production bundle библиотеки.

### Создание npm-архива

```bash
npm run pack
```

Собирает библиотеку и создаёт `.tgz` архив через `npm pack`.

---

# Алиасы разработки

Vite и Storybook поддерживают следующие aliases:

```text
@           → src
@components → src/components
@hooks      → src/hooks
@icons      → src/icons
@shared     → src/shared
```

Например:

```tsx
import { Button } from '@components/Button'
import { useValidation } from '@hooks/useValidation'
import { SearchIcon } from '@icons/Search'
import styles from '@shared/...'
```

---

# Peer Dependencies

Библиотека не включает React в собственный bundle.

Используются:

```json
{
	"react": "^19.2.6",
	"react-dom": "^19.2.6"
}
```

Они объявлены как `peerDependencies`.

Это позволяет приложению-потребителю использовать собственный экземпляр React.

---

# Runtime Dependencies

Библиотека использует:

```text
@floating-ui/dom
dompurify
marked
```

### `@floating-ui/dom`

Используется для позиционирования floating UI.

### `marked`

Используется для преобразования Markdown в HTML.

### `dompurify`

Используется для очистки HTML, генерируемого из пользовательского Markdown.

---

# Лицензия

Проект распространяется под лицензией:

```text
MIT
```

---

# Текущая архитектура

В упрощённом виде библиотека организована следующим образом:

```text
                    ┌──────────────────────┐
                    │     src/index.ts     │
                    │    Public API        │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
       │ Components  │  │    Icons    │  │   Shared    │
       └──────┬──────┘  └─────────────┘  └──────┬──────┘
              │                                  │
       ┌──────┴──────┐                    ┌──────┴──────┐
       │             │                    │             │
       ▼             ▼                    ▼             ▼
   UI logic       SCSS Modules        Theme vars   Global styles
       │
       ▼
   ┌─────────────┐
   │    Hooks    │
   └──────┬──────┘
          │
    ┌─────┼──────────────┐
    ▼     ▼              ▼
Validation Positioning   Mouse/RAF
```

Основная идея архитектуры — разделение:

```text
UI
│
├── Components
│
├── Behaviour
│   └── Hooks
│
├── Visual system
│   └── SCSS / Theme
│
├── Infrastructure
│   └── Portal / Utils
│
└── Documentation
    └── Storybook
```

Такое разделение позволяет развивать компоненты независимо, повторно использовать поведенческую логику и сохранять единый визуальный слой библиотеки.
