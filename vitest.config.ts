import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(rootDir, 'src')

export default defineConfig({
	test: {
		environment: 'jsdom',
		globals: false
	},
	resolve: {
		alias: {
			'@': srcDir,
			'@components': path.resolve(srcDir, 'components'),
			'@hooks': path.resolve(srcDir, 'hooks'),
			'@icons': path.resolve(srcDir, 'icons'),
			'@shared': path.resolve(srcDir, 'shared')
		}
	}
})
