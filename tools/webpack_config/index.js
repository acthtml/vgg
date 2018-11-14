/**
 * @module webpackConfig
 */
const path = require('path');
const _ = require('lodash');
const getIp = require('../get_ip');
const PROXY_PORT = Number(process.env.PORT || 7001) + 1;

/**
 * 获取vue ssr项目的webpack配置。
 * @param  {String} type    配置类型:client或server
 * @param  {String} env     配置所在环境local/unittest/stage/prod
 * @param  {Object} options 选型，包含以下属性
 *                          - baseDir 站点根目录，默认 process.cwd()
 *                          - ip 代理ip
 *                          - port 代理端口
 *                          - enableHMR 开启热更新
 *                          - client 客户端产物配置
 *                            - publicPath output.publicPath
 *                            - path output.public.path
 * @return {Object}         webpack config
 */
module.exports = (type, env = 'local', options) => {
  let baseDir = options && options.baseDir;
  options = _.defaultsDeep({}, options, getDefaultOptions());

  // 当没有开启热加载时，修改默认的publicPath为非代理路径。
  if(!options.enableHMR && options.client.publicPath == `//${options.ip}:${options.port}/public/static/`){
    options.client.publicPath = `//${options.ip}:${process.env.PORT || 7001}/public/static/`
  }

  let config = null;
  if(type == 'client' || type == 'server'){
    config = require(`./${type}`)(env, options);
  }
  return config;
}

function getDefaultOptions(baseDir = process.cwd()){
  let options = {
    // 站点根目录
    baseDir: baseDir,
    // proxy ip 或域名，例如 '127.0.0.1' 或 'example.com'
    ip: getIp(),
    // proxy port
    port: PROXY_PORT,
    // 是否开启热更新
    enableHMR: false,
    // 客户端产物配置
    client: {
      // webpack output public path
      publicPath: '',
      // webpack output path
      path: ''
    }
  }

  // 默认使用代理的地址。
  options.client.publicPath = `//${options.ip}:${options.port}/public/static/`;
  options.client.path = `${baseDir}/public/static/`;
  return options;
}
