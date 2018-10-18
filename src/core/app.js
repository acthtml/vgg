/**
 * app实例
 *
 * - hook app.contextLoaded
 *
 * @module core/app
 */
import Vue from 'vue';
import { sync } from 'vuex-router-sync';
import plugin from './plugin';
import loadConfig from './load_config';
import loadCommon from './load_common';
import loadContext from './load_context';
import loadAppComponent from './load_app_component';
import createStore from './create_store';
import createRouter from './create_router';

/**
 * 初始化前后端通用的app实例，返回appContext。
 * @see ./entry_client.js
 * @see ./entry_server.js
 * @param  {Object} context   服务端上下文环境
 * @return {Object} 返回appContext，拥有以下属性：
 *         - appCreator app构造函数
 *         - app vue实例
 *         - store vuex实例
 *         - 其他自动绑定的上下文。
 */
export default (context) => {
  // 1. 加载配置
  loadConfig();

  // 2. 加载通用资源（utils,directive,filter,plugins）。
  loadCommon(context);

  // 3. 加载上下文和api
  let ctx = loadContext(context);

  // 4. 创建store/router
  ctx.store = createStore({...context, ...ctx});
  ctx.router = createRouter({...context, ...ctx});
  // 同步路由状态 @see https://github.com/vuejs/vuex-router-sync
  sync(ctx.store, ctx.router);

  // 5. hook app.contextLoaded
  plugin.invokeAll('app.contextLoaded', {...context, ...ctx});

  // 返回构造app构造函数，为了在客户端环境，store的状态能在router挂载时初始好，这样就能做
  // 服务端的权限判断了。
  let app;
  let appComponent = loadAppComponent();
  const appCreator = () => {
    if(!app){
      app = new Vue({
        ...ctx,
        render: h => h(appComponent)
      })
    }
    return app;
  };
  return {appCreator, ctx:context.ctx, ...ctx};
}
