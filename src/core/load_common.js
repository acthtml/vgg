/**
 * 加载通用资源(加载common文件夹下的directive, filter, plugins, utils模块。)
 *
 * - directive, filter, plugins 在模块文件中直接注入Vue即可。
 * - utils会合并，最后注入到vgg.utils中。
 *
 * @module core/load_common
 */
import Vue from 'vue';
import plugin from './plugin';
import vgg from '../index';

export default (context) => {
  let resources = ['directive', 'filter', 'plugins', 'utils'];
  resources.forEach(resource => {
    let sets = plugin.assign(`common/${resource}`);
    if(resource == 'utils'){
      vgg.utils = sets;
      return;
    }

    for(let key in sets){
      if(resource == 'plugins'){
        Vue.use(sets[key]);
      }else{
        Vue[resource](key, sets[key]);
      }
    }
  })
}
