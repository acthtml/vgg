/**
 * app实例
 *
 * @module core/app
 */
import Vue from 'vue';
import { sync } from 'vuex-router-sync';
import plugin from './plugin';
import loadConfig from './loadConfig';
import loadCommon from './load_common';
import loadContext from './load_context';
import createStore from './create_store';
import createRouter from './create_router';

/**
 * 获取app实例，分别供客户端和服务端使用。
 * @see ./entry_client.js
 * @see ./entry_server.js
 * @param  {Object} context   服务端上下文环境
 * @return {Object} 返回一个对象，拥有以下属性：
 *         - appCreator app构造函数
 *         - app vue实例
 *         - store vuex实例
 *         - 其他自动绑定的上下文。
 */
export default (context) => {
  // 1. 插件进行初始化扫描。
  plugin.scan();

  // 2. 加载配置。
  loadConfig();

  // 3. 加载除上下文之外的通用资源（utils,directive,filter,plugins）。
  loadCommon(context);

  // 4. 加载上下文。
  let ctx = loadContext(context);

  // 5. 创建store和router
  const store = createStore({...context, ...ctx});
  const router = createRouter({store, ...context, ...ctx});
  // 同步路由状态 @see https://github.com/vuejs/vuex-router-sync
  sync(store, router);

  // 6. hook app/afterContextLoaded
  plugin.invokeAll('app.afterContextLoaded', {store, router, ...context, ...ctx})

  // 返回构造app构造函数，为了在客户端环境，store的状态能在router挂载时初始好，这样就能做
  // 服务端的权限判断了。
  let app;
  const appCreator = () => {
    if(!app){
      app = new Vue({
        ...ctx,
        store,
        router,
        render: h => h(appComponent)
      })
    }
    return app;
  };
  return {appCreator, store, router, ctx:context.ctx, ...ctx};
}