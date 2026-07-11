# create-ui-kit-template

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
npm run storybook
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
