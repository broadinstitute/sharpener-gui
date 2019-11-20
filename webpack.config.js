var path = require('path');

module.exports = [{
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.join(__dirname, 'dist'),
    publicPath: '/dist/',
    library: 'star-sharpener'
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: "source-map-loader"
      },
      {
        test: /\.js[x]{0,1}$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
      	test: /\.tsx$/,
	loader: 'awesome-typescript-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  },
  devtool: 'source-map'
}];
