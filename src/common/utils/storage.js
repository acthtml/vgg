/**
 * api for localStorage
 *
 * 在config.storage中进行该项目的配置：
 *
 * - namespace [String]('default') 命名空间。
 * - [@todo]defaultExpiredTime [Number](0) 默认过期毫秒数，0表示永久。
 *
 * ** client only **
 *
 * @module utils/storage
 */

import _ from 'lodash';
import vgg from '../../';

const namespace = _.get(vgg.config, 'storage.namespace', 'default');
var localStorage;
// 兼容node环境
if(typeof window != 'undefined'){
  localStorage = window.localStorage;
}
else if(typeof localStorage == 'undefined'){
  localStorage = {};
  localStorage.getItem = () => undefined;
  localStorage.setItem = () => {};
  localStorage.removeItem = () => {};
  localStorage.length = 0;
}

export default {
  // 命名空间
  namespace,
  /**
   * 获取指定key的值
   * @param  {[type]} key          [description]
   * @param  {[type]} defaultValue [description]
   * @return {[type]}              [description]
   */
  get(key, defaultValue){
    let keyName = this.getKeyName(key),
        data = localStorage.getItem(keyName);
    try{
      data = JSON.parse(data);
    }catch(e){
      data = {};
    }
    if(!data) data = {};

    let value;
    // 值已过期
    if(data.options && data.options.expires && new Date().getTime() > data.options.expires){
      this.remove(key);
    }
    else{
      value = data.value;
    }
    return value || defaultValue;
  },
  /**
   * 设置值
   * @param {[type]} key     [description]
   * @param {[type]} value   [description]
   * @param {[type]} options {expiredIn, expires}
   *                         - expiredIn 在多少毫秒后过期
   *                         - expires 在什么时候过期，跟expiredIn不能同时存在。
   */
  set(key, value, options = {}){
    let keyName = this.getKeyName(key),
        data = {},
        expires = 0;
    data.value = value;

    if(options.expires){
      expires = options.expires;
    }
    else if(options.expiredIn){
      expires = new Date().getTime() + options.expiredIn;
    }
    if(expires != 0){
      data.options = {
        expires
      }
    }
    localStorage.setItem(keyName, JSON.stringify(data));
  },
  /**
   * 清空指定键值
   * @param  {[type]} key 指定键值，为空则清空所有命名空间下的值。
   * @return {[type]}     [description]
   */
  remove(key){
    if(typeof key != 'undefined'){
      localStorage.removeItem(this.getKeyName(key));
    }else{
      for(let i = 0; i < localStorage.length; i++){
        let name = localStorage.key(i);
        // 是该命名空间下的值
        if(name.indexOf(this.namespace + ':') == 0){
          localStorage.removeItem(name);
        }
      }
    }
  },
  /**
   * 获取指定的key名称。
   */
  getKeyName(key){
    if(!key){
      throw new Error('storage get should got a key.');
      return;
    }
    return this.namespace + ':' + key;
  }
}
