/// <reference types="node" />
import * as path from 'path';
import type { StorybookConfig } from '@storybook/react-webpack5';

declare const __dirname: string;

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],

  addons: [
    '@storybook/addon-essentials',
    {
      name: "@storybook/addon-webpack5-compiler-swc",
      options: {
        swc: () => ({
          jsc: {
            transform: {
              react: {
                runtime: "automatic", 
              },
            },
          },
        }),
      },
    },
  ],

  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },

  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
  },

  webpackFinal: async (config) => {
    config.module = config.module ?? { rules: [] };

    // --- НАЧАЛО ИНТЕГРАЦИИ SVGR ---
    // 1. Исключаем SVG из дефолтных правил Storybook для ассетов/картинок
    config.module.rules = (config.module.rules ?? []).map((rule) => {
      if (rule && typeof rule === 'object' && rule.test instanceof RegExp && rule.test.test('.svg')) {
        return { ...rule, exclude: /\.svg$/ };
      }
      return rule;
    });

    // 2. Добавляем загрузчик SVGR для обработки SVG как React-компонентов
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            typescript: true,
            ext: 'tsx',
          },
        },
      ],
    });
    // --- КОНЕЦ ИНТЕГРАЦИИ SVGR ---

    // Storybook уже добавляет собственные правила для *.css (в т.ч. внутри rule.oneOf).
    // Если рядом добавить ещё одно правило с тем же test, файл пройдёт по двум цепочкам
    // загрузчиков сразу, и итоговый JS-модуль соберётся некорректно
    // (например, именованные CSS-классы потеряются — styles.wrapper окажется undefined).
    // Поэтому рекурсивно вычищаем все дефолтные css-правила и ставим свои — для *.scss.
    const isStyleRule = (rule: any): boolean => {
      if (!rule || typeof rule !== 'object' || !('test' in rule)) return false;
      const test = rule.test;
      if (!(test instanceof RegExp)) return false;
      return (
        test.test('styles.css') ||
        test.test('styles.module.css') ||
        test.test('styles.scss') ||
        test.test('styles.module.scss')
      );
    };

    const stripStyleRules = (rules: any[]): any[] =>
      (rules ?? [])
        .filter((rule) => !isStyleRule(rule))
        .map((rule) => {
          if (rule && typeof rule === 'object' && Array.isArray(rule.oneOf)) {
            return { ...rule, oneOf: stripStyleRules(rule.oneOf) };
          }
          return rule;
        });

    config.module.rules = stripStyleRules(config.module.rules as any[]);

    config.module.rules.push(
      {
        // файлы дизайн-токенов и прочие "обычные" стили
        test: /\.scss$/i,
        exclude: /\.module\.scss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        // CSS Modules для стилей отдельных компонентов
        test: /\.module\.scss$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                namedExport: false,
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
            },
          },
          'sass-loader',
        ],
      },
    );

    config.resolve = config.resolve ?? { alias: {} };
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@': path.resolve(__dirname, '../src'),
      '@components': path.resolve(__dirname, '../src/components'),
      '@hooks': path.resolve(__dirname, '../src/hooks'),
      '@shared': path.resolve(__dirname, '../src/shared'),
      '@icons': path.resolve(__dirname, '../src/icons'),
    };

    return config;
  },
};

export default config;
