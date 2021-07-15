const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config.js');

const contentBase = path.join(__dirname, '/');

module.exports = merge(baseConfig, {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: {},
  devServer: {
    host: '0.0.0.0',
    port: 9191,
    disableHostCheck: true,
    contentBase: contentBase,
    openPage: 'dev/index.html',
    historyApiFallback: true,
    noInfo: true,
    overlay: true,
    open: true,
    hot: true,
    inline: true,
    before(app) {
      app.all('*', (req, res) => {
        const delay = req.query.t || Math.ceil(Math.random() * 100);
        setTimeout(() => {
          res.status(req.query.s || 200);
          const filePath = path.join(contentBase, req.path);
          try {
            fs.accessSync(filePath, fs.constants.F_OK);
            // res.send(fs.readFileSync(filePath));
            res.sendFile(filePath);
          } catch (e) {
            res.end();
          }
          // console.log(req.query);
        }, delay);
      });
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
});