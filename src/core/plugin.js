/**
 * 插件帮助函数
 *
 * @module core/plugin
 */
import _ from 'lodash';
import Toposort from 'toposort-class';

let cacheList;
let cachePlugins;
export default {
  /**
   * 扫描所有插件
   * - 缓存插件配置。
   * - 按照依赖关系建立缓存列表。
   * @return {[type]} [description]
   */
  scan(){
    cacheList = [];
    cachePlugins = {};
    let plugins = {};

    // 1. 获取core插件
    try{
      let corePlugins = require('../config/plugin');
      Object.assign(plugins, corePlugins);
    }catch(e){}

    // 2. 获取工作区插件。
    try{
      let workPlugins = require('~/config/plugin');
      Object.assign(plugins, corePlugins);
    }catch(e){}

    let toposort = new Toposort();
  },

  list(){},
  invoke(name, hook, ...args){},
  invokeAll(hook, ...args){},
  async invokeAsync(name, hook, ...args){}
  async invokeAllAsync(hook, ...args){}
  assign(modulePath, mod = 'assign'){}
  getModule(modulePath, pluginName){}
}


function _scan(plugins){
  for(let name in plugins){
    let pluginConfig = {
      package: '',
      components: {
        importAll: true,
        namespaced: true
      }
    };
  }
}
