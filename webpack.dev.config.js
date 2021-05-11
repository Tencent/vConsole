const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.js');

const contentBase = path.join(__dirname, '/');

module.exports = merge(baseConfig, {
  mode: 'development',
  devServer: {
    host: '0.0.0.0',
    port: 9191,
    disableHostCheck: true,
    contentBase: contentBase,
    openPage: 'dev/',
    historyApiFallback: true,
    noInfo: true,
    overlay: true,
    open: true,
    hot: true,
    inline: true,
    before(app) {
      app.post('*', (req, res) => {
        // res.redirect(req.originalUrl);
        res.setHeader('content-type', 'application/json')
        res.send(fs.readFileSync(path.join(contentBase, req.path)));
      });
    }
  },
  devtool: '#eval-source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
});