# mangalicht-uikit

UI Kit на React + TypeScript с поддержкой Storybook и сборкой через Webpack.

## Структура проекта

```
src/
  components/   — React-компоненты (например, Switch)
  icons/        — SVG-иконки как React-компоненты
  variables/    — дизайн-токены (SCSS/CSS-переменные, цвета, отступы и т.д.)
  index.ts      — точка входа библиотеки
```

## Стили

Стили пишутся на **SCSS**:
- `*.scss` — общие стили и дизайн-токены (например, `src/variables/colors.scss`)
- `*.module.scss` — CSS Modules для отдельных компонентов (например, `Switch.module.scss`), классы генерируются с уникальными хешами и импортируются как обычный объект: `import styles from './Switch.module.scss'`

Компиляция scss → css выполняется через `sass-loader`, дальше стили проходят через `css-loader` (с `modules: true` для `*.module.scss`) и подключаются в DOM через `style-loader`. Конфигурация одинаково настроена и в `webpack.config.js` (сборка библиотеки), и в `.storybook/main.ts` (запуск Storybook).


## Установка

```bash
npm install
```

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

## Компоненты

### Switch

Тумблер-переключатель с плавной CSS-анимацией движения бегунка, построен на
нативном `input[type="checkbox"]` для доступности.

```tsx
import { Switch } from 'create-ui-kit-template';

function Example() {
  const [checked, setChecked] = useState(false);
  return <Switch checked={checked} onChange={setChecked} label="Тёмная тема" />;
}
```

### Button

Кнопка с тремя вариантами оформления: `"default"`, `"highlight"`, `"bordered"`.

```tsx
import { Button } from 'create-ui-kit-template';

function Example() {
  return (
    <Button
      labelText="Сохранить"
      style="highlight"
      onClick={() => console.log('clicked')}
      disabled={false}
      classNames="my-custom-class"
    />
  );
}
```

Пропсы:
- `labelText: string` — текст на кнопке
- `style?: "default" | "highlight" | "bordered" | "borderedAccent"` — визуальный вариант (по умолчанию `"default"`)
- `disabled?: boolean` — заблокировать кнопку
- `onClick?: (event) => void` — колбэк клика
- `classNames?: string` — дополнительный className для кастомных стилей
- `iconStart?: React.ReactNode` — иконка (например, svg) перед текстом
- `iconEnd?: React.ReactNode` — иконка после текста

```tsx
import { Button } from 'create-ui-kit-template';

function Example() {
  return (
    <Button
      labelText="Добавить"
      style="default"
      iconStart={<PlusIcon />}
      onClick={() => console.log('clicked')}
    />
  );
}
```

