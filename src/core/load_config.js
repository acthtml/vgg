/**
 * 载入配置
 *
 * 应用的配置在`config/`目录下，配置分为默认配置和环境配置。环境配置覆盖默认配置，覆盖规则为
 * 深度覆盖（`_.defaultsDeep()`）。配置文件的命名规范，其中默认配置文件为`config.default.js`，
 * 当前的环境配置为`config.${env}.js`，例如本地开发环境为config.local.js。
 *
 * @module core/load_config
 */
import _ from 'lodash';
import vgg from '../';
import plugin from './plugin';

export default () => {
  let config = vgg.config;
  if(!config){
    let defConfig = plugin.assign('config/config.default', 'defaultsDeep', true);
    let envConfig = plugin.assign(`config/config.${vgg.env}`, 'defaultsDeep', true);
    config = _.defaultsDeep({}, envConfig, defConfig);
    vgg.config = config;
  }

  return config;
}
