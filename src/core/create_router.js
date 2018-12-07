/**
 * 创建router
 *
 * - 返回router实例。
 * - 合并路由（router/routes），并去重。
 * - hook router.alter
 * - hook router.onError
 * - hook router.beforeEach
 * - hook router.afterEach
 * - 在config.router进行路由配置，配置项参考https://router.vuejs.org/zh/api/#router-%E6%9E%84%E5%BB%BA%E9%80%89%E9%A1%B9
 *
 * @module core/create_router
 */
import _ from 'lodash';
import Vue from 'vue';
import VueRouter from 'vue-router';
import plugin from './plugin';
import loadConfig from './load_config';
const config = loadConfig();
Vue.use(VueRouter);

export default (context) => {
  let routes = getRoutes();

  // default router config.
  let routerConfig = _.get(config, 'router', {});
  routerConfig = Object.assign({
    mode: 'history',
    // 需要设置base，因为eggjs还不允许根目录形式注入。
    // 配置参考 https://router.vuejs.org/zh-cn/api/options.html#base
    base: context.siteRoot
  }, routerConfig);
  let router = new VueRouter({
    routes,
    ...routerConfig
  });

  // hook router.onError
  router.onError(async () => {
    await plugin.invokeAll('router.onError', {...context, router});
  })

  // hook router.beforeEach
  router.beforeEach(async (to, from, next) => {
    let processed = false;
    await plugin.invokeAllAsync('router.beforeEach', to, from, next, {...context, router})
      .then(isNext => {
        processed = true;
        if(_.isBoolean(isNext) && !isNext){
          next(false);
        }else{
          next();
        }
      })
      .catch(e => {
        processed = true;
        next(e);
      })
      .finally(() => {
        if(!processed) next();
      })
  });

  // // hook router.afterEach
  router.afterEach(async (to, from) => {
    await plugin.invokeAllAsync('router.afterEach', to, from, {...context, router});
  });

  // hook router.alter
  let altor = {...context, router};
  plugin.invokeAll('router.alter', altor);
  router = altor.router;
  return router;
};


/**
 * 获取全部路由，并去重。
 * @return {[type]} [description]
 */
function getRoutes(){
  let plugins = plugin.list();
  let routes = [];
  for(let i = 0; i < plugins.length; i++){
    let mod = plugin.getModule('router/routes', plugins[i]);
    if(mod && _.isArray(mod)){
      routes = routes.concat(mod);
    }
  }

  return _.unionBy(routes, 'path');
}
