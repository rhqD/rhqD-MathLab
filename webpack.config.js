var path = require('path');
var urlJoin = require('url-join');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'cheap-module-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'build'),
    port: 88,
    historyApiFallback: true,
    inline: true,
    hot: true
  },
  entry: [
    'react-hot-loader/patch',
    './sample/app/index'
  ],
  output: {
    filename: '[name].[hash].js',
    chunkFilename: '[id].chunk.[chunkhash].js',
    sourceMapFilename: '[file].map',
    path: path.join(__dirname, 'build'),
    publicPath: ''
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('dev')
    }),
    new HtmlWebpackPlugin({
      template: './sample/index.tmpl.dev.html'
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader?insertAt=top',
          'css-loader'
        ],
        include: [path.join(__dirname, 'node_modules'), /TabForSystemBill.css/]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: true,
              importLoaders: 1,
              localIdentName: '[local]___[hash:base64:5]'
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: function () {
                return [
                  require("postcss-import")({ path: ['./app'] }),
                  require("postcss-url")(),
                  require("postcss-cssnext")(),
                  require("postcss-assets")({loadPaths: ['app/']}),
                  require("postcss-browser-reporter")(),
                  require("postcss-reporter")(),
                ];
              }
            }
          }
        ],
        exclude: [/TabForSystemBill.css/],
        include: path.join(__dirname, 'app')
      },
      {
        test: /\.(png|jpg|jpeg|gif|woff|woff2)$/,
        use: [{
          loader: 'url-loader',
          options: {
            name: '[path][name].[ext]?[hash]',
            limit: 10000
          }
        }]
      },
      {
        test: /\.(svg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            name: '[path][name].[ext]?[hash]',
            limit: 3052
          }
        }]
      },
      {
        test: /\.(eot|ttf|wav|mp3|pdf)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]?[hash]'
          }
        }]
      },
      {
        test: /\.worker\.js$/,
        use: [{
          loader: 'worker-loader'
        }]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.json']
  },
  node: {
    fs: 'empty'
  },
  externals: [
    {
      './cptable': 'var cptable',
      './jszip': 'jszip',
      './react-tooltip': 'react-tooltip',
      '../xlsx.js': 'var _XLSX'
    }
  ]
}
