const webpackConfig = require('egg-easywebpack');

module.exports = {
  webpack: {
    webpackConfigList: [
      webpackConfig('client', 'local', {enableHMR: true}),
      webpackConfig('server', 'local', {enableHMR: true})
    ]
  },
  // 是否开启vconsole
  vconsole: true
}
