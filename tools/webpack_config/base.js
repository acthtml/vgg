const path = require("path");
const webpack = require('webpack-tool').webpack;
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const {GenerateSW} = require('workbox-webpack-plugin');
const autoprefixer = require('autoprefixer');
const vggTool = require('vgg/tools/plugin');

module.exports = (env = "local", options) => {
  let config = {
    output: {
      filename: path.join("js", "[name].[chunkhash].js")
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: file => (/node_modules(?!(\/|\\)vgg).*/.test(file) &&
            !/\.vue\.jsx?/.test(file)),
          use: [
            {
              loader: "babel-loader", // 'babel-loader' is also a legal name to reference
            }
          ]
        },
        {
          test: /\.vue$/,
          exclude: /node_modules(?!(\/|\\)vgg).*/,
          use:[
            {
              loader: "vue-loader",
              options: {
                postcss: [autoprefixer({ browsers: ['last 2 versions', 'iOS >= 8'] })],
              }
            }
          ]
        },
        {
          test: /\.css$/,
          // loader: ['css-loader'],
          // extract text plugin有些问题
          use: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: [
              { loader: "css-loader", options: { importLoaders: 1 } },
              {
                loader: "postcss-loader",
                options: {
                  plugins: () => [
                    autoprefixer({ browsers: ['last 2 versions', 'iOS >= 8'] })
                  ]
                }
              }
            ]
          })
        },
        {
          test: /\.(gif|jpg|png|svg)\??.*$/,
          loader: "url-loader?limit=1024&name=images/[name].[hash].[ext]"
        },
        {
          test: /\.(woff|eot|ttf)\??.*$/,
          loader: "url-loader?limit=1024&name=font/[name].[hash].[ext]"
        },
        {
          test: /\.(html|tpl)$/,
          loader: "html-loader?name=html/[name].[hash].[ext]"
        }
      ]
    },
    resolve: {
      alias: {
        vue$: "vue/dist/vue.esm.js",
        "~": path.join(options.baseDir, "app/web"),
        ...getAlias(options)
      },
    },
    plugins: [
      new VueLoaderPlugin(),
      new webpack.DefinePlugin({
        'WEBPACK_ENV': `"${env}"`
      }),
      new ExtractTextPlugin({
        filename: path.join("css", "[name].[contenthash].css")
      }),
      new ProgressBarPlugin(),
    ]
  };

  // 启用service worker来缓存前端资源。
  // https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#configuration
  if(options.serviceWorker){
    let serviceWorkerConfig = _.defaultsDeep({}, options.serviceWorker, {skipWaiting: true, importWorkboxFrom: 'local'});
    config.plugins.push(new GenerateSW(serviceWorkerConfig))
  }

  return config;
};

/**
 * 获取所有插件别名
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function getAlias(options){
  let alias = {};
  let plugins = vggTool.scan();
  for(let name in plugins){
    if(name == '~') continue;
    let plugin = plugins[name];
    if(plugin.package.indexOf('.') == 0){
      alias['$' + name] = path.join(options.baseDir, 'run', plugin.package);
    }else{
      alias['$' + name] = plugin.package;
    }
  }
  return alias;
}
