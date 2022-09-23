const Webpack = require('webpack');
const Path = require('path');
const { execSync } = require('child_process');
const TerserPlugin = require('terser-webpack-plugin');
const sveltePreprocess = require('svelte-preprocess');
const pkg = require('./package.json');
const BuildTarget = ['web', 'wx'];

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';
  const __TARGET__ = BuildTarget.indexOf(env.target) === -1 ? BuildTarget[0] : env.target;
  const noCoreJS = !!env['no-core-js'] || __TARGET__ === 'wx';
  // define plugins
  const plugins = [
    new Webpack.BannerPlugin({
      banner: [
        'vConsole v' + pkg.version + ' (' + pkg.homepage + ')',
        '',
        'Tencent is pleased to support the open source community by making vConsole available.',
        'Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.',
        'Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at',
        'http://opensource.org/licenses/MIT',
        'Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.',
      ].join('\n'),
      entryOnly: true,
    }),
    new Webpack.DefinePlugin({
      __VERSION__: JSON.stringify(pkg.version),
      __TARGET__: JSON.stringify(__TARGET__),
    }),
  ];
  if (isDev) {
    plugins.push({
      apply: (compiler) => {
        compiler.hooks.done.tap('DeclarationEmitter', () => {
          execSync('npm run build:typings');
        });
      },
    })
  }
  if (noCoreJS) {
    const dummyModulePath = Path.resolve(__dirname, './build/dummy.js');
    plugins.push(new Webpack.NormalModuleReplacementPlugin(/^core-js\/.*/, dummyModulePath));
  }

  return {
    mode: argv.mode,
    devtool: false,
    entry: {
      vconsole: Path.resolve(__dirname, './src/vconsole.ts'),
    },
    target: ['web', 'es5'],
    output: {
      path: Path.resolve(__dirname, './dist'),
      filename: '[name].min.js',
      library: {
        name: 'VConsole',
        type: 'umd',
        umdNamedDefine: true,
        export: "default",
      },
      globalObject: 'this || self',
    },
    resolve: {
      extensions: ['.ts', '.js', '.html', '.less', '.mjs', '.svelte'],
      alias: {
        svelte: Path.resolve('node_modules', 'svelte'),
      },
      mainFields: ['svelte', 'browser', 'module', 'main'],
    },
    module: {
      rules: [
        {
          test: /\.(js|ts)$/,
          use: [
            { loader: 'babel-loader' }
          ],
        },
        {
          test: /\.(less|css)$/i,
          use: [
            {
              loader: 'style-loader',
              options: { injectType: 'lazyStyleTag' },
            },
            { loader: 'css-loader' },
            {
              loader: 'less-loader',
              options: {
                lessOptions: { math: 'always' },
              },
            },
          ],
        },
        {
          test: /\.(svelte)$/,
          use: [
            'babel-loader',
            {
              loader: 'svelte-loader',
              options: {
                preprocess: sveltePreprocess({
                  sourceMap: isDev,
                }),
                compilerOptions: {
                  dev: isDev,
                  accessors: true,
                },
                emitCss: true,
                hotReload: false,
              },
            },
          ],
        },
        {
          // required to prevent errors from Svelte on Webpack 5+, omit on Webpack 4
          test: /node_modules[\\/]svelte[\\/].*\.m?js$/,
          resolve: {
            fullySpecified: false,
          },
          use: ['babel-loader'],
        },
      ],
    },
    stats: {
      colors: true,
      errorDetails: true,
    },
    optimization: {
      minimize: !isDev,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            compress: {
              pure_funcs: ['console.log'], // drop `console.log` only
            },
          },
        }),
      ],
    },
    watchOptions: {
      ignored: ['**/node_modules'],
    },
    plugins
  };
};
