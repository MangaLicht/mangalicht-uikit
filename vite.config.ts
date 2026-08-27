import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { libInjectCss } from 'vite-plugin-lib-inject-css'
import dts from 'vite-plugin-dts'
import path from 'node:path'
import fs from 'node:fs'
import { glob } from 'glob'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(rootDir, 'src')

const entries = Object.fromEntries(
	glob.sync('src/**/*.{ts,tsx}', {
		ignore: [
			'src/**/*.stories.{ts,tsx}',
			'src/**/*.d.ts',
			'src/**/__tests__/**'
		]
	}).map(file => [
		file
			.replace(/^src[\\/]/u, '')
			.replace(/\.(ts|tsx)$/u, ''),
		path.resolve(rootDir, file)
	])
)

function copyScssSources() {
	return {
		name: 'copy-scss-sources',
		apply: 'build' as const,
		closeBundle() {
			const sourceRoot = srcDir
			const outputRoot = path.resolve(rootDir, 'dist/scss')

			if (!fs.existsSync(sourceRoot)) return

			for (const file of glob.sync('**/*.scss', { cwd: sourceRoot })) {
				const source = path.join(sourceRoot, file)
				const destination = path.join(outputRoot, file)
				fs.mkdirSync(path.dirname(destination), { recursive: true })
				fs.copyFileSync(source, destination)
			}
		}
	}
}

export default defineConfig({
	plugins: [
		react({
			jsxRuntime: 'automatic'
		}),
		libInjectCss(),
		dts({
			entryRoot: srcDir,
			insertTypesEntry: true,
			rollupTypes: false,
			include: ['src'],
			exclude: ['**/*.stories.*', '.storybook', 'stories', '**/__tests__/**']
		}),
		copyScssSources()
	],

	css: {
		modules: {
			localsConvention: 'camelCaseOnly',
			generateScopedName: '[name]__[local]___[hash:base64:5]'
		}
	},

	resolve: {
		alias: {
			'@': srcDir,
			'@components': path.resolve(srcDir, 'components'),
			'@hooks': path.resolve(srcDir, 'hooks'),
			'@icons': path.resolve(srcDir, 'icons'),
			'@shared': path.resolve(srcDir, 'shared')
		}
	},

	build: {
		lib: {
			entry: entries,
			name: 'MangalichtUIKit',
			formats: ['es']
		},
		outDir: path.resolve(rootDir, 'dist'),
		sourcemap: true,
		emptyOutDir: true,
		rollupOptions: {
			external: id =>
				/^react(?:\/|$)/u.test(id) ||
				/^react-dom(?:\/|$)/u.test(id) ||
				id === 'lucide-react',
			output: {
				entryFileNames: '[name].js',
				chunkFileNames: 'chunks/[name]-[hash].js',
				assetFileNames: 'assets/[name]-[hash][extname]'
			}
		}
	}
})
