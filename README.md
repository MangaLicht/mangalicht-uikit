# mangalicht-uikit

UI Kit на React + TypeScript с поддержкой Storybook и сборкой через Webpack.

## Структура проекта

```
src/
  components/   — React-компоненты (Button, Switch, Checkbox, Select, Tooltip, Block, Input, MarkdownField)
  hooks/        — переиспользуемые хуки (useValidation, useAnchoredPosition, useClickOutside и т.д.)
  icons/        — SVG-иконки как React-компоненты
  shared/       — дизайн-токены (SCSS/CSS-переменные), миксины, normalize, общие утилиты
  index.ts      — точка входа библиотеки
```

## Стили

Стили пишутся на **SCSS**:

- `*.scss` — общие стили и дизайн-токены (`src/shared/theme-vars.scss`, `src/shared/normalize.scss`, `src/shared/global-styles.scss`)
- `*.module.scss` — CSS Modules для отдельных компонентов (например, `Button.module.scss`), классы генерируются с уникальными хешами и импортируются как обычный объект: `import styles from './Button.module.scss'`

Компиляция scss → css выполняется через `sass-loader`, дальше стили проходят через `css-loader` (с `modules: true` для `*.module.scss`) и подключаются в DOM через `style-loader`. Конфигурация одинаково настроена и в `webpack.config.js` (сборка библиотеки), и в `.storybook/main.ts` (запуск Storybook).

> Стили инжектятся в `<head>` через JS во время выполнения (`style-loader`), поэтому для использования кита нужен браузерный `document` — библиотека не предназначена для рендера на сервере (SSR/SSG) без дополнительной настройки на стороне потребителя.

### Тема (обязательный шаг для подключения)

Все цветовые токены компонентов (`--uikit-*`) объявлены не на `:root`, а на `:root[data-theme='light']` и `:root[data-theme='dark']` — поэтому после установки пакета **на `<html>` или любой родительский элемент нужно проставить атрибут `data-theme`**, иначе компоненты будут не окрашены:

```tsx
document.documentElement.dataset.theme = 'light' // или 'dark'
```

```html
<html data-theme="light"></html>
```

Переключение темы в рантайме — это просто смена значения атрибута.

## Установка

```bash
npm install mangalicht-uikit
```

Библиотека требует `react` и `react-dom` версии `^19` в проекте-потребителе (объявлены как `peerDependencies`, в сборку кита не попадают).

Импортируйте стили и компоненты из точки входа пакета:

```tsx
import { Button, Input } from 'mangalicht-uikit'
// normalize/theme-vars/global-styles подключаются автоматически вместе с пакетом
```

Всплывающие элементы (`Tooltip`, панель `Select`) рендерятся через React-портал в отдельный `<div id="uikit-portal-root">`, который кит создаёт в `document.body` сам при первом использовании — никаких дополнительных контейнеров в разметке готовить не нужно.

## Разработка компонентов в Storybook

```bash
npm run dev
```

Откроется на http://localhost:6006

## Сборка статической версии Storybook

```bash
npm run build-storybook
```

## Сборка библиотеки

```bash
npm run build
```

Результат появится в `dist/index.js` (+ `dist/index.d.ts`).

## Публикация в npm

```bash
npm run publish
```

Команда соберёт библиотеку через webpack, поднимет patch-версию и опубликует пакет в npm.

---

````tsx
import { Switch } from 'mangalicht-uikit';

Общий паттерн для всех компонентов формы (`Switch`, `Checkbox`, `Select`, `Input`, `MarkdownField`): поддерживается **controlled** режим (значение задаётся через `value`/`checked` + `onChange`) и, где это применимо, **uncontrolled** (через `defaultValue`/`defaultChecked`). Все компоненты пробрасывают `ref` на нативный DOM-элемент (`forwardRef`) и принимают `classNames` для дополнительных стилей поверх базовых.

### Button

Кнопка с пятью вариантами оформления.

```tsx
import { Button } from 'mangalicht-uikit'

function Example() {
  return (
    <Button
      labelText='Сохранить'
      variant='highlight'
      onClick={() => console.log('clicked')}
      disabled={false}
      classNames='my-custom-class'
    />
  )
}
````

Пропсы:

- `labelText?: string` — текст на кнопке
- `variant?: "default" | "highlight" | "bordered" | "borderedAccent" | "ghost"` — визуальный вариант (по умолчанию `"default"`)
- `isAlert?: boolean` — окрасить кнопку в акцентный (тревожный) цвет, независимо от `variant`
- `disabled?: boolean` — заблокировать кнопку
- `onClick?: (event) => void` — колбэк клика
- `type?: "button" | "submit" | "reset"` — нативный type, по умолчанию `"button"`
- `animation?: "default" | "none"` — управление hover/active-анимацией маски
- `iconStart?: React.ReactNode` — иконка перед текстом
- `iconEnd?: React.ReactNode` — иконка после текста
- `classNames?: string` — дополнительный className
- остальные нативные атрибуты `<button>` пробрасываются как есть (`{...rest}`)

```tsx
import { Button } from 'mangalicht-uikit'
import { PlusIcon } from './PlusIcon'

function Example() {
  return <Button labelText='Добавить' iconStart={<PlusIcon />} onClick={() => {}} />
}
```

### Switch

Тумблер-переключатель с плавной CSS-анимацией движения бегунка, построен на нативном `input[type="checkbox"]` для доступности. **Полностью controlled** — состояние всегда приходит через `checked`, компонент не хранит его сам.

```tsx
import { useState } from 'react'
import { Switch } from 'mangalicht-uikit'

function Example() {
  const [checked, setChecked] = useState(false)
  return <Switch checked={checked} onChange={setChecked} labelText='Тёмная тема' />
}
```

Пропсы:

- `checked?: boolean` — текущее состояние
- `onChange: (checked: boolean) => void` — **обязательный** колбэк переключения
- `labelText?: string` — подпись рядом с переключателем
- `size?: "default" | "small"` — размер
- `disabled?: boolean` — заблокировать
- `name?: string` — `name` нативного input, для форм

### Checkbox

Чекбокс с двумя вариантами оформления: `"default"` (квадратный) и `"radio"` (круглый, чисто визуально — семантика остаётся `checkbox`). Поддерживает controlled и uncontrolled режимы.

```tsx
import { Checkbox } from 'mangalicht-uikit'

function Example() {
  return (
    <Checkbox
      defaultChecked={false}
      onClick={(checked) => console.log(checked)}
      labelText='Согласен с условиями'
      variant='default'
    />
  )
}
```

Пропсы:

- `checked?: boolean` / `defaultChecked?: boolean` — управляемое/неуправляемое состояние
- `onClick?: (checked: boolean) => void` — колбэк переключения (несмотря на название, вызывается при изменении состояния, а не при клике мышью)
- `variant?: "default" | "radio"` — визуальный вариант
- `labelText?: string`, `disabled?: boolean`, `name?: string`

### Select

Кастомный выпадающий список: доступность через паттерн collapsible listbox (`aria-activedescendant`), позиционирование через `@floating-ui/dom`, панель рендерится в портал.

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
        { value: 'cherry', label: 'Вишня', disabled: true },
      ]}
      value={value}
      onChange={setValue}
      placeholder='Выберите фрукт'
    />
  )
}
```

Пропсы:

- `options: { value: string; label: string; disabled?: boolean }[]` — список опций
- `value?: string` / `defaultValue?: string` — управляемое/неуправляемое значение
- `onChange?: (value: string) => void`
- `placeholder?: string` — текст-заглушка
- `name?: string` — если задан, рядом рендерится скрытый `<input type="hidden">` для нативных форм
- `minWidth?: number` — минимальная ширина триггера в px (по умолчанию `220`)
- `disabled?: boolean`

Управление с клавиатуры: `Enter`/`Space`/стрелки открывают список, `↑`/`↓` перемещают подсветку, `Home`/`End` — к первой/последней доступной опции, `Enter`/`Space` выбирают, `Escape` закрывает.

### Tooltip

Всплывающая подсказка, следующая за курсором с эффектом плавного отставания (реализовано на `requestAnimationFrame`, а не на CSS-transition).

```tsx
import { Tooltip } from 'mangalicht-uikit'

function Example() {
  return (
    <Tooltip content='Подсказка появится здесь' position='top' showDelay={300}>
      <button>Наведи на меня</button>
    </Tooltip>
  )
}
```

Пропсы:

- `content: React.ReactNode` — содержимое подсказки
- `children: React.ReactElement` — **единственный** дочерний элемент-триггер (на него навешиваются обработчики мыши через `cloneElement`)
- `position?: "top" | "bottom"` — появление над/под курсором (по умолчанию `"top"`)
- `offset?: number` — отступ от курсора в px (по умолчанию `12`)
- `showDelay?: number` — задержка перед показом, мс (по умолчанию `500`)
- `cursorLag?: number` — сглаживание "отставания" подсказки от курсора, мс, `0` — без сглаживания (по умолчанию `100`)
- `disabled?: boolean`, `classNames?: string`

> Триггер реагирует только на события мыши (`mouseenter`/`mousemove`/`mouseleave`) — подсказка не появляется по фокусу с клавиатуры.

### Block

Контейнер-карточка с опциональным заголовком (`h1`–`h6` через `titleStyle`) и двумя вариантами оформления.

```tsx
import { Block } from 'mangalicht-uikit'

function Example() {
  return (
    <Block variant='outlined' title='Настройки' titleStyle={3} width={400}>
      <p>Содержимое блока</p>
    </Block>
  )
}
```

Пропсы:

- `variant: "default" | "outlined"` — **обязательный** визуальный вариант
- `title?: string` — заголовок
- `titleStyle?: 1 | 2 | 3 | 4 | 5 | 6` — какой тег заголовка использовать, `h1`–`h6` (по умолчанию `2`)
- `titleChildren?: React.ReactNode` — доп. содержимое рядом с заголовком (разрешены только `<svg>` и `Button`, остальное будет отфильтровано с предупреждением в консоли)
- `width?: number`, `height?: number` — размеры блока в px (по умолчанию растягивается на `100%` родителя)
- `className?: string` / `classNames?: string`

### Input

Однострочное поле ввода с валидацией. Подходит и для обычных текстовых полей, и для поисковой строки (через `icon` + `clearable`).

```tsx
import { useState } from 'react'
import { Input } from 'mangalicht-uikit'
import { SearchIcon } from 'mangalicht-uikit'

function SearchExample() {
  const [query, setQuery] = useState('')
  return (
    <Input
      icon={<SearchIcon />}
      value={query}
      onChange={setQuery}
      placeholder='Поиск...'
      clearable
      type='search'
    />
  )
}

function EmailExample() {
  const [email, setEmail] = useState('')
  return (
    <Input
      label='Email'
      value={email}
      onChange={setEmail}
      hint='Мы не передаём email третьим лицам'
      rules={{
        required: 'Укажите email',
        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Похоже, это не email' },
      }}
      validateOn='change'
    />
  )
}
```

Пропсы:

- `value?: string` / `defaultValue?: string` — управляемое/неуправляемое значение
- `onChange?: (value: string, event?) => void`
- `label?: string` — подпись над полем
- `hint?: string` — подсказка под полем (скрывается, если есть ошибка)
- `errorMessage?: string` — ошибка, заданная снаружи (например, ответ сервера) — перекрывает результат встроенной валидации
- `rules?: ValidationRules` — правила валидации (см. раздел [«Валидация»](#валидация-rules--validateon))
- `validateOn?: "change" | "blur" | "submit"` — когда пересчитывать ошибку (по умолчанию `"blur"`)
- `onValidChange?: (isValid: boolean, error: string | null) => void`
- `icon?: React.ReactNode` — иконка слева (например, `SearchIcon` для поисковой строки)
- `clearable?: boolean` — показывать кнопку очистки, когда есть значение
- `disabled?: boolean`
- `classNames?: string` — на сам `<input>`, `wrapperClassName?: string` — на корневой контейнер
- остальные нативные атрибуты `<input>` пробрасываются как есть (`{...rest}`), включая `type`, `placeholder`, `maxLength` и т.д.

### MarkdownField

Многострочное поле с поддержкой markdown: тулбар форматирования, переключатель «Написать / Превью» и автоматическое расширение по высоте — **ширина поля остаётся неизменной**, текст переносится по словам, а контейнер растёт вниз вслед за контентом.

```tsx
import { useState } from 'react'
import { MarkdownField } from 'mangalicht-uikit'

function Example() {
  const [text, setText] = useState('')
  return (
    <MarkdownField
      label='Описание'
      value={text}
      onChange={setText}
      placeholder='Поддерживается **markdown**: списки, ссылки, код...'
      minRows={4}
      maxRows={12}
      rules={{ maxLength: { value: 500, message: 'Максимум 500 символов' } }}
      showCounter
    />
  )
}
```

Пропсы:

- `value?: string` / `defaultValue?: string`, `onChange?: (value: string, event?) => void` — сырой markdown-текст
- `label?: string`, `hint?: string`, `errorMessage?: string`
- `rules?: ValidationRules`, `validateOn?: "change" | "blur" | "submit"`, `onValidChange?: (isValid, error) => void` — как в `Input`
- `minRows?: number` — минимальная высота в строках (по умолчанию `4`)
- `maxRows?: number` — после превышения появляется внутренний скролл вместо дальнейшего роста контейнера (без ограничения по умолчанию)
- `showToolbar?: boolean` — тулбар bold/italic/code/link/list (по умолчанию `true`)
- `showPreviewToggle?: boolean` — переключатель «Написать / Превью» (по умолчанию `true`)
- `showCounter?: boolean` — счётчик символов, виден при заданном `rules.maxLength` (по умолчанию `false`)
- `disabled?: boolean`
- `classNames?: string` — на `<textarea>`, `wrapperClassName?: string` — на корневой контейнер

> Превью рендерит markdown через `marked` и прогоняет результат через `DOMPurify` перед вставкой в DOM — сторонний непросанитайзенный HTML в поле не попадает.

### Валидация (`rules` / `validateOn`)

`Input` и `MarkdownField` используют общий формат правил валидации:

```ts
interface ValidationRules {
  required?: boolean | string // своя ошибка вместо дефолтной — передайте строку
  minLength?: number | { value: number; message: string }
  maxLength?: number | { value: number; message: string }
  pattern?: RegExp | { value: RegExp; message: string }
  validate?: (value: string) => string | null | undefined | false // произвольный валидатор
}
```

```tsx
<Input
  rules={{
    required: true,
    minLength: 3,
    validate: (value) => (value.includes(' ') ? 'Без пробелов' : null),
  }}
/>
```

`validateOn` определяет момент пересчёта ошибки:

- `"blur"` (по умолчанию) — ошибка не показывается, пока поле не потеряло фокус хотя бы раз; после этого пересчитывается по каждому blur
- `"change"` — после первого blur ошибка пересчитывается на каждое изменение значения (быстро пропадает по мере исправления)
- `"submit"` — валидация не запускается автоматически; вызывайте её вручную при отправке формы (например, храните `ref` на поле и валидируйте значение самостоятельно перед сабмитом)

### ProgressBar

Горизонтальный индикатор прогресса с закруглёнными краями и подписью значения справа.

```tsx
import { ProgressBar } from 'mangalicht-uikit'

function Example() {
  return <ProgressBar min={0} max={1000} value={500} />
}
```

Пропсы:

- `value: number` — **обязательный**, текущее/целевое значение (визуально клэмпится в диапазон `[min, max]`, если выходит за него)
- `min?: number` — минимум шкалы (по умолчанию `0`)
- `max?: number` — максимум шкалы (по умолчанию `100`)
- `showLabel?: boolean` — показывать подпись справа (по умолчанию `true`)
- `label?: React.ReactNode` — переопределяет содержимое подписи (по умолчанию отображается само `value`), например для вывода процентов вместо сырого числа
- `ariaLabel?: string` — доступное имя для screen reader, полезно при `showLabel={false}`
- `classNames?: string` — на трек, `wrapperClassName?: string` — на корневой контейнер (трек + подпись)
  `min`/`max`/`value` — обычные React-пропы, компонент не кеширует их при монтировании, поэтому шкалу можно свободно менять в рантайме (например, если границы приходят с сервера и обновляются уже после первого рендера):

```tsx
function Example({ target }: { target: number }) {
  const [max, setMax] = useState(100)
  // max можно менять в любой момент — полоса пересчитается на следующий рендер
  return <ProgressBar min={0} max={max} value={target} />
}
```

### Иконки

Библиотека экспортирует набор SVG-иконок, использующихся во встроенных компонентах — их можно переиспользовать и в своей разметке:

```tsx
import { ChevronIcon, SearchIcon, CloseIcon } from 'mangalicht-uikit'
```

Доступны: `ChevronIcon`, `SearchIcon`, `CloseIcon`, `BoldIcon`, `ItalicIcon`, `LinkIcon`, `ListIcon`, `CodeIcon`, `EyeIcon`, `PencilIcon`. Все иконки — `currentColor`, наследуют размер и цвет от родителя через CSS.
