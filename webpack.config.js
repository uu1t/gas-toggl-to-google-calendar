const path = require('path');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'Main'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [{ test: /\.ts$/, loader: 'ts-loader' }]
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: { ie8: true }
      })
    ]
  }
};
