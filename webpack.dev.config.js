const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.js');

module.exports = merge(baseConfig, {
  mode: 'development',
  devServer: {
    port: 9090,
    contentBase: path.join(__dirname, '/'),
    openPage: 'dev/',
    historyApiFallback: true,
    noInfo: true,
    overlay: true,
    open: true,
    hot: true,
    inline: true,
    setup(app) {
      app.post('*', (req, res) => {
        res.redirect(req.originalUrl);
      });
    }
  },
  devtool: '#eval-source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
});