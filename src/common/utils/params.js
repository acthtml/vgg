/**
 * 格式化参数
 *
 * @module utils/formateParams
 */
import _ from 'lodash';

export default {
  /**
   * 参数命名采用大驼峰
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  capitalize(params, deep = -1){
    return formate(params, 'upperFirst', deep);
  },
  /**
   * 采用小驼峰
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  camelCase(params, deep = -1){
    return formate(params, 'camelCase', deep);
  },

  /**
   * 清理参数，默认去除值为0，'', []的参数
   * @param  {[type]} params   [description]
   * @param  {[type]} iteratee 迭代器，function(value, key)，返回true保留，false剔除。
   * @return {[type]}          [description]
   */
  cleanly(params, iteratee){
    if(!iteratee){
      iteratee = defaultCleanlyFunction;
    }
    if(!_.isFunction(iteratee)) throw new Error('function cleanly param iteratee need function.')

    let obj = {};
    for(let key in params){
      if(iteratee(params[key], key)){
        obj[key] = params[key];
      }
    }
    return obj;
  },
  formate
}


function formate(params, type, deep = -1){
  if(deep == 0) return params;

  let obj = {};
  for(let key in params){
    if(!params.hasOwnProperty(key)) continue;
    let value = params[key];
    if(_.isObject(value) && !_.isArray(value)){
      value = formate(value, type, deep - 1);
    }
    obj[_[type](key)] = value;
  }
  return obj;
}


function defaultCleanlyFunction(value, key){
  return value != '' && value != 0 || !_.isNull(value) && !_.isEmpty(value);
}
