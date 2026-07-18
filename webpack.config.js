const path = require('path');

/** @type {import('webpack').Configuration} */
module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, 'src/index.ts'),

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: {
      type: 'commonjs2',
    },
    clean: true,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@icons': path.resolve(__dirname, 'src/icons'),
    },
    extensions: ['.tsx', '.ts', '.js'],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
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
    ],
  },

  // react и react-dom не должны попадать в сборку библиотеки —
  // они уже объявлены в peerDependencies и придут из проекта, который подключит ui-kit
  externals: {
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
      root: 'React',
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'react-dom',
      root: 'ReactDOM',
    },
  },

  devtool: 'source-map',
};
