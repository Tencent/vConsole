const Path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config.js');

const contentBase = Path.join(__dirname, '/');

module.exports = (env, argv) => {
  return merge(baseConfig(env, argv), {
    mode: 'development',
    // devtool: 'eval-source-map',
    devtool: false,
    devServer: {
      host: '0.0.0.0',
      port: 9191,
      open: 'dev/index.html',
      allowedHosts: 'all',
      historyApiFallback: true,
      client: {
        overlay: true,
      },
      static: [
        { directory: contentBase, },
      ],
      onBeforeSetupMiddleware(devServer) {
        devServer.app.all('*', (req, res) => {
          const delay = req.query.t || Math.ceil(Math.random() * 100);
          setTimeout(() => {
            res.status(req.query.s || 200);
            const filePath = Path.join(contentBase, req.path);
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
    optimization: {
      minimize: false,
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin()
    ]
  });
};
