import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        react(),

        dts({
            insertTypesEntry: true,
            include: ['src'],
            exclude: [
                '**/*.stories.*',
                '.storybook',
                'stories'
            ]
        })
    ],

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
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'MangalichtUIKit',
            fileName: 'index',
            formats: ['es', 'cjs']
        },

        sourcemap: true,

        cssCodeSplit: false,

        rollupOptions: {
            external: [
                'react',
                'react-dom',
                'react/jsx-runtime'
            ],

            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM'
                }
            }
        }
    }
});