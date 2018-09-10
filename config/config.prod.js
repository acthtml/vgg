const webpackConfig = require('egg-easywebpack');

module.exports = {
  webpack: {
    webpackConfigList: [
      webpackConfig('client', 'prod', {
        client: {
          publicPath:'//js.40017.cn/cn/h/test/v1/'
        }
      }),
      webpackConfig('server', 'prod', {
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
  },
  // 是否开启vconsole
  // 在正式发布的时候需要挂掉。
  vconsole: false
}
