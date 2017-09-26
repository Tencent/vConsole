var pkg = require('./package.json');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  devtool: false,
  entry: {
    vconsole : './src/vconsole.js'
  },
  output: {
    path: './dist',
    filename: '[name].min.js',
    library: 'VConsole',
    libraryTarget: 'umd',
    umdNameDefine: true
  },
  module: {
    loaders: [
      {
        test: /\.html$/, loader: 'html?minimize=false'
      },
      { 
        test: /\.js$/, loader: 'babel'
      },
      {
        test: /\.less$/,
        loader: 'style!css!less'
        // loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader') // 将css独立打包
      },
      {
        test: /\.json$/, loader: 'json'
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin([
        'vConsole v' + pkg.version + ' (' + pkg.homepage + ')',
        '',
        'Tencent is pleased to support the open source community by making vConsole available.',
        'Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.',
        'Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at',
        'http://opensource.org/licenses/MIT',
        'Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.'
    ].join('\n'))
    ,new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
    // ,new ExtractTextPlugin('[name].min.css') // 将css独立打包
  ]
};