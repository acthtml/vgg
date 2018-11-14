const path = require('path');
const webpack = require('webpack-tool').webpack;
const merge = require('webpack-merge');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const baseConfig = require('./base');

module.exports = (env = 'local', options) => {
  let baseDir = options.baseDir;
  let config = merge(baseConfig(env, options), {
    entry: {
      app: require.resolve('vgg/src/entry_client.js'),
      vendor: ['vue', 'vuex', 'vue-router']
    },
    output: {
      publicPath: options.client.publicPath,
      path: options.client.path
    },
    devtool: 'source-map',
    plugins: [
      new webpack.DefinePlugin({
        'WEBPACK_ENTRY_TYPE': '"client"'
      }),
      new webpack.HashedModuleIdsPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: function (module, count) {
          // 将node_modules中的依赖模块全部提取到vendor文件中
          return (
            module.resource &&
            /\.js$/.test(module.resource) &&
            module.resource.indexOf(
              path.join(__dirname, '../node_modules')
            ) === 0
          )
        }
      }),
      // webpack在使用CommonsChunkPlugin时会生成一段runtime代码，并且打包进vendor中。
      // 这样即使不改变vendor代码，每次打包时runtime会变化导致vendor的hash变化，这里
      // 把独立的runtime代码抽离出来来解决这个问题
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
        // chunks: ['vendor'],
        minChunks: Infinity
      }),

      // 此插件在输出目录中
      // 生成 `vue-ssr-client-manifest.json`。
      new VueSSRClientPlugin()
    ]
  });

  // 非开发模式添加压缩，和去除warning。
  if(env != 'local'){
    // 非开发模式去掉sourcemap
    if(env != 'unittest') delete config.devtool;

    // 进行压缩
    config = merge(config, {
      plugins: [
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: '"production"'
          }
        }),
        // @todo webpack打包代码压缩
        new webpack.optimize.UglifyJsPlugin({
          minimize: true,
          compress: {
            warnings: false
          }
        })
      ]
    });
  }

  // 添加hmr
  if(env == 'local' && options.enableHMR){
    // 添加HMR
    // clientConfig.entry.app = ['webpack-hot-middleware/client', clientConfig.entry.app]
    // clientConfig.output.filename = '[name].js'
    config.entry.app = [`webpack-hot-middleware/client?path=//${options.ip}:${options.port}/__webpack_hmr&noInfo=false&reload=false&quiet=false`, config.entry.app]
    config.output.filename = '[name].js'
    config.plugins.push(
      // OccurenceOrderPlugin is needed for webpack 1.x only
      // new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      // Use NoErrorsPlugin for webpack 1.x
      new webpack.NoEmitOnErrorsPlugin()
    )
  }

  return config;
}
