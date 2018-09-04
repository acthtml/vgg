/**
 * 加载配置
 *
 * @module core/load_config
 */
import vgg from '../';
import plugin from './plugin';

export default context => {
  if(vgg.config) return;

  let config = plugin.assign('config/config.base', 'defaultsDeep');
  let envConfig = plugin.assign(`config/config.${vgg.env}`, 'defaultsDeep');
  config = _.defaultsDeep({}, config, envConfig);
  vgg.config = config;
}
