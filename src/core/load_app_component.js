/**
 * 加载app.vue
 *
 * @module core/load_app_component
 */
import _ from 'lodash';
import plugin from './plugin';

let appComponent;
/**
 * 加载 /views/app.vue，优先级
 *
 * - work
 * - plugins
 * - core
 *
 * @return {[type]} [description]
 */
export default () => {
  if(!appComponent){
    // 2. 加载插件中的
    let plugins = plugin.list(true);
    for(let i = 0; i < plugins.length; i++){
      appComponent = plugin.getModule('views/app.vue', plugins[i]);
      if(appComponent) break;
    }
  }
  return appComponent;
}
