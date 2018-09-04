/**
 * 加载上下文。
 *
 * 加载common/context模块。模块是个对象。其中key为上下文的名称，value为上下文创建方法。创
 * 建方法可接受一个来自服务端的context对象（koa context）。
 *
 * @module core/load_context
 */
import _ from 'lodash';
import plugin from './plugin';
export default context => {
  let creators = plugin.assign('common/context');
  let ctx = {}

  if(creators && _.isObject(creators)){
    for(let key in creators){
      let target;
      try{
        target = creators[key](context);
      }catch(e){
        console.error(`上下文${key}创建失败`, e);
        continue;
      }
      if(target){
        ctx[key] = target;
      }
    };
  }
  return ctx;
}
