const webpackConfig = require('vgg-webpack');

module.exports = {
  webpack: {
    webpackConfigList: [
      webpackConfig('client', 'local', {enableHMR: true}),
      webpackConfig('server', 'local', {enableHMR: true})
    ]
  },
  // 是否开启vconsole
  vconsole: true,
  vgg: {
    watch: true
  }
}
