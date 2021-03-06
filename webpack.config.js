var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: path.resolve(__dirname, 'index.js'),
  externals: {
    clappr: 'Clappr',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        query: {
            compact: true,
        }
      },
      {
        test: /\.css$/,
        loaders: ['style', 'css'],
      },
     {
       test: /\.html/, loader: 'html?minimize=false'
     },
    ],
  },
  resolve: {
    extensions: ['', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'youtube.js',
    library: 'YoutubePlayback',
    libraryTarget: 'umd',
  },
};
