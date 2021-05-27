const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
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
        let contentType = '';
        if (req.path.includes('.json')) {
          contentType = 'application/json';
        } else if (req.path.includes('.txt')) {
          contentType = 'text/html';
        } else if (req.path.includes('.png')) {
          contentType = 'image/png';
        } else if (req.path.includes('.blob')) {
          contentType = 'application/octet-stream';
        }

        if (contentType) {
          res.setHeader('content-type', contentType);
        }
        res.send(fs.readFileSync(path.join(contentBase, req.path)));
      });

      app.options('*', (req, res) => {
        let status = 200;
        let match = req.path.match(/\/([0-9]{3})\./);
        if (match) {
          status = match[1];
        }
        res.status(status).end();
      });
    }
  },
  devtool: 'eval-source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
});