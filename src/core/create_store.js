/**
 * 创建store
 *
 * - 返回store实例
 * - 为store添加辅助方法
 * - 在config.store中进行配置，参考https://vuex.vuejs.org/zh/api/#vuex-store-%E6%9E%84%E9%80%A0%E5%99%A8%E9%80%89%E9%A1%B9
 * - hook store.alter
 *
 * @module core/create_store
 */
import _ from 'lodash';
import Vue from 'vue';
import Vuex from 'vuex';
import plugin from './plugin';
import loadConfig from './load_config';
const config = loadConfig();
Vue.use(Vuex);

/**
 * 返回store实例，并给实例添加register
 * @param  {[type]} context [description]
 * @return {[type]}       [description]
 */
export default context => {
  let store = new Vuex.Store(_.get(config, 'store', {}));

  /**
   * 给store动态添加模块，保证不会在命名空间上重复添加。
   * @param {String|Array} namespace 命名空间
   * @param {String} modulepath 模块路径，相对于~/store/modules这个路径，如果忽略这个属
   * 性，则以namespace作为模块路径。
   * @return {Boolean} 返回是否添加成功。
   */
  store.register = function(namespace, modulepath, ...args){
    namespace = getNamespace(namespace);
    // 不能重复注册
    if(this.isRegistered(namespace)) return false;
    if(!modulepath) modulepath = namespace;
    // 模块的引用统一成下划线命名模式，snakeCase
    let {filename, pluginName} = plugin.parseModulePath(modulepath);
    filename = filename.split('/').map(i => _.snakeCase(i)).join('/');
    try{
      let mod = plugin.getModule('store/' + filename, pluginName);
      this.registerModule(namespace, mod(namespace, {...context, store}, ...args));
      return true;
    }catch(e){
      throw new Error(`store ${namespace}注册出错，filename:${filename}, pluginName:${pluginName}`);
    }
  }

  /**
   * 从store中卸载模块。
   * @param  {String|Array} namespace 命名空间名称
   * @return {Boolean}           是否卸载成功。
   */
  store.unregister = function(namespace){
    namespace = getNamespace(namespace);
    try{
      this.unregisterModule(namespace);
      delete this.cache[namespace];
      return true;
    }catch(e){
      return false;
    }
  }

  /**
   * 该命名空间下是否注册过模块
   * @param  {String|Array}  namespace 命名空间
   * @return {Boolean}       该命名空间下是否注册过模块
   */
  store.isRegistered = function(namespace){
    namespace = getNamespace(namespace);
    // 命名空间是以'/'结尾进行保存的。
    return !!this._modulesNamespaceMap[namespace + '/'];
  }

  /**
   * 检测该命名空间的这个方法只执行一遍，已执行过则不会再执行。
   * @param  {String}    type      执行类型, dispatch|commit
   * @param  {String}    namespace 命名空间
   * @param  {String}    name      执行的名称
   * @param  {Array} args      参数
   * @return {Mixed}              dispath/commit函数返回值。如果已执行，则返回undefined.
   * @todo  完善和应用。
   */
  store.cache = {};
  store.once = function(type, namespace, name, ...args){
    if(type != 'dispatch' && type != 'commit'){
      throw new Error(`store.once arguments type not support ${type}.`);
    }
    namespace = getNamespace(namespace);
    let key = `${type}:${name}`,
        cacheKey = `${type}:${name}:cache`,
        cache = this.cache[namespace];
    if(!cache){
      cache = this.cache[namespace] = {}
    }
    if(this.ensure(type, namespace, name)) return cache[cacheKey];
    cache[key] = true;
    cache[cacheKey] = this[type](namespace + '/' + name, ...args);

    return cache[cacheKey];
  }

  /**
   * 检测该命名空间的的这个方法有没有执行过。
   * @param  {[type]} type      [description]
   * @param  {[type]} namespace [description]
   * @param  {[type]} name      [description]
   * @return {[type]}           [description]
   */
  store.ensure = function(type, namespace, name){
    namespace = getNamespace(namespace);
    return !!this.cache[namespace][`${type}:${name}`];
  }

  /**
   * 检测是否拥有这个方法
   * @param  {String}  type       dispatch or commit
   * @param  {String}  namespace  命名空间。
   * @param  {String}  name       方法名
   * @return {Boolean}
   */
  store.has = function(type, namespace, name){
    if(_.isArray(namespace)) namespace = namespace.join('/');
    if(namespace) name = namespace + '/' + name;
    name = type == 'dispatch' ? `_actions.${name}` : `_mutations.${name}`;
    return _.has(this, name);
  }

  /**
   * 模块有方法就运行，没有就不了。
   * @param  {[type]} type      dispatch or commit
   * @param  {[type]} namespace [description]
   * @param  {[type]} name      [description]
   * @return {[type]}           [description]
   */
  store.try = function(type, namespace, name, ...args){
    namespace = getNamespace(namespace);
    if(this.has(type, namespace, name)){
      return this[type](namespace + '/' + name, ...args);
    }
  }

  // Hook store.alter
  plugin.invokeAll('store.alter', {...context, store});
  return store;
}

/**
 * 返回命名空间字符串
 * @param  {String|Array} namespace 命名空间
 * @return {String}           命名空间字符串
 */
function getNamespace(namespace){
  if(namespace instanceof Array) namespace = namespace.join('/');
  namespace = namespace.replace(/\//ig, '/');
  return namespace;
}
