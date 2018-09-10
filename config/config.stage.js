const webpackConfig = require('egg-easywebpack');

module.exports = {
  webpack: {
    webpackConfigList: [
      webpackConfig('client', 'stage', {
        client: {
          publicPath:'//js.40017.cn/cn/h/test/v1/'
        }
      }),
      webpackConfig('server', 'stage', {
        client: {
          publicPath:'//js.40017.cn/cn/h/test/v1/'
        }
      })
    ]
  },
  static: {
    prefix: '/app/public/'
  },
  easyvue: {
    // 站点spa根目录
    siteRoot: '/app',
  }
}
