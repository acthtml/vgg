/**
 * 加载上下文和api
 *
 * 加载common/context模块。模块是个对象。其中key为上下文的名称，value为上下文创建方法。创
 * 建方法可接受一个来自服务端的context对象（koa context）。
 *
 * @module core/load_context
 */
import Vue from 'vue';
import _ from 'lodash';
import plugin from './plugin';
import createApi from './create_api';
import contextPlugin from '../common/plugins/context';

export default context => {
  let creators = plugin.assign('common/context');
  let ctx = {}
  if(creators && _.isObject(creators)){
    for(let key in creators){
      let creation = creators[key](context, ctx);
      if(creation){
        ctx[key] = creation;
      }
    };
  }
  ctx.api = createApi(ctx);

  // 注入到vue上下文中。
  for(let key in ctx){
    Vue.use(contextPlugin(key));
  }
  return ctx;
}
