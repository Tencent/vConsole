var Path = require('path');
var Webpack = require('webpack');

module.exports = {
  mode: 'production',
  // devtool: false,
  entry: {
    index : Path.resolve(__dirname, './index.js')
  },
  output: {
    path: Path.resolve(__dirname, './'),
    filename: '[name].dist.js',
  },
  module: {
    rules: [
    ]
  },
  stats: {
    colors: true,
  },
  plugins: [
    new Webpack.SourceMapDevToolPlugin()
  ]
};