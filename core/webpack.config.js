const { readFileSync } = require('fs');
const babelSettings = JSON.parse(readFileSync('.babelrc'));
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const sass = require('node-sass');

module.exports = {
  entry: {
    index: ['./src/main.js']
  },
  resolve: {
    mainFields: ['svelte', 'browser', 'module', 'main'],
    extensions: ['.js', '.html']
  },
  output: {
    path: __dirname + '/public',
    filename: 'luigi.js',
    chunkFilename: 'luigi.[id].js'
  },
  module: {
    rules: [
      {
        test: /\.(html|js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          query: babelSettings
        }
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        use: {
          loader: 'svelte-loader',
          options: {
            emitCss: true,
            name: 'Luigi',
            preprocess: {
              style: ({ content, attributes }) => {
                if (attributes.type !== 'text/scss') return;
                return new Promise((fulfil, reject) => {
                  sass.render(
                    {
                      data: content,
                      includePaths: ['src','node_modules/fundamental-ui/scss'],
                      sourceMap: true,
                      outFile: 'x' // this is necessary, but is ignored
                    },
                    (err, result) => {
                      if (err) return reject(err);

                      fulfil({
                        code: result.css.toString(),
                        map: result.map.toString()
                      });
                    }
                  );
                });
              }
            }
          }
        }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: 'url-loader',
        options: {
          limit: 50000
        }
      }
    ]
  },
  plugins: [new ExtractTextPlugin('luigi.css')],
  mode: 'production'
};
