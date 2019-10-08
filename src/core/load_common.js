/**
 * 加载通用资源(加载common文件夹下的directive, filter, plugins, utils模块。)
 *
 * - directive, filter, plugins 在模块文件中直接注入Vue即可。
 * - utils会合并，最后注入到vgg.utils中。
 *
 * @module core/load_common
 */
import _ from 'lodash';
import Vue from 'vue';
import plugin from './plugin';
import vgg from '../';

export default (context) => {
  let resources = ['utils', 'directive', 'filter', 'plugins', 'components'];
  vgg.utils = {};
  resources.forEach(resource => {
    let modulePath = resource == 'components' ? 'components' : `common/${resource}`;
    plugin.each(modulePath, (rst, pluginName) => {
      if(!_.isObject(rst)){
        throw new Error(`插件${pluginName}的对应的模块${modulePath}默认输出应该是对象。`);
      }
      for(let key in rst){
        if(resource == 'utils'){
          vgg.utils[key] = rst[key];
        }else if(resource == 'plugins'){
          let args = [rst[key]];
          if(_.isArray(rst[key])){
            args = rst[key];
          }
          Vue.use(...args);
        }else if(resource == 'filter' || resource == 'directive'){
          Vue[resource](key, rst[key]);
        }else if(resource == 'components'){
          if(plugin.pluginRuntime[pluginName].components){
            Vue.component(key, rst[key]);
          }
        }
      }
    })
  })
}

