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
          const contentType = {
            'flv': 'video/x-flv',
            'wav': 'audio/x-wav',
          };
          const fileType = req.path.split('.').pop();
          // console.log('Req:::', fileType, req.path, req.query);
          if (fileType === 'flv') {
            res.set({
              'Content-Type': contentType[fileType],
              // 'Content-Type', 'application/octet-stream',
              'Transfer-Encoding': 'chunked',
              'Connection': 'keep-alive',
            });
            let n = 0;
            const write = () => {
              setTimeout(() => {
                n++;
                const buf = Buffer.alloc(100000, 1);
                res.write(buf);
                if (n < 100) {
                  write();
                } else {
                  res.end();
                }
              }, 100);
            };
            write();

          } else {
            const delay = req.query.t || Math.ceil(Math.random() * 100);
            setTimeout(() => {
              const filePath = Path.join(contentBase, req.path);
              try {
                fs.accessSync(filePath, fs.constants.F_OK);
                res.type(fileType);
                res.status(req.query.s || 200);
                if (req.query.chunked) {
                  res.set({
                    'Transfer-Encoding': 'chunked',
                    'Connection': 'keep-alive',
                  });
                  res.write(fs.readFileSync(filePath));
                } else {
                  res.send(fs.readFileSync(filePath));
                }
                // res.sendFile(filePath, options);
              } catch (e) {
                res.status(404);
                res.end();
              }
              // console.log(req.query);
            }, delay);
          }
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
