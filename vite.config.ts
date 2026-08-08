import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { libInjectCss as injectCssPlugin } from 'vite-plugin-lib-inject-css'
import dts from 'vite-plugin-dts'
import path from 'node:path'
import fs from 'node:fs'
import { glob } from 'glob'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function copyScssSources() {
	const srcDir = path.resolve(__dirname, 'src/shared')
	const outDir = path.resolve(__dirname, 'dist/scss')

	return {
		name: 'copy-scss-sources',
		apply: 'build' as const,
		closeBundle() {
			fs.mkdirSync(outDir, { recursive: true })
			if (fs.existsSync(srcDir)) {
				for (const file of fs.readdirSync(srcDir)) {
					if (file.endsWith('.scss')) {
						fs.copyFileSync(
							path.join(srcDir, file),
							path.join(outDir, file)
						)
					}
				}
			}
		}
	}
}

export default defineConfig({
	plugins: [
		react(),

		injectCssPlugin(),

		dts({
			insertTypesEntry: true,
			include: ['src'],
			exclude: ['**/*.stories.*', '.storybook', 'stories']
		}),

		copyScssSources()
	],

	css: {
		modules: {
			localsConvention: 'camelCaseOnly',
			// Рекомендуется оставить хэширование, чтобы стили вашей библиотеки
			// гарантированно не конфликтовали со стилями в проекте пользователя
			generateScopedName: '[name]__[local]___[hash:base64:5]'
		}
	},

	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
			'@components': path.resolve(__dirname, 'src/components'),
			'@hooks': path.resolve(__dirname, 'src/hooks'),
			'@icons': path.resolve(__dirname, 'src/icons'),
			'@shared': path.resolve(__dirname, 'src/shared')
		}
	},

	build: {
		// lib.entry мы ОСТАВЛЯЕМ для совместимости, но rollupOptions.input его расширит
		lib: {
			entry: path.resolve(__dirname, 'src/index.ts'),
			name: 'MangalichtUIKit',
			formats: ['es'] // Рекомендуется оставить преимущественно 'es' для лучшего разделения
		},
		sourcemap: true,
		rollupOptions: {
			external: ['react', 'react-dom', 'react/jsx-runtime'],

			// 2. Явно указываем Rollup собирать каждый файл отдельно
			input: Object.fromEntries(
				glob
					.sync('src/**/*.{ts,tsx}', {
						ignore: ['src/**/*.stories.{ts,tsx}', 'src/**/*.d.ts']
					})
					.map(file => [
						// Превращает путь вида 'src/components/Button/Button' в ключ 'components/Button/Button'
						path
							.relative('src', file)
							.slice(0, -path.extname(file).length),
						fileURLToPath(new URL(file, import.meta.url))
					])
			),

			output: {
				// Задаем структуру для сохранения папок внутри dist
				entryFileNames: '[name].js',
				assetFileNames: 'assets/[name][extname]',
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM'
				}
			}
		}
	}
})
