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
import vgg from '../index';

Vue.use(VueRouter);
export default (context) => {
  let routes = getRoutes();

  // default router config.
  let routerConfig = _.get(vgg.config, 'router', {});
  Object.assign({
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
    await plugin.invokeAll('router.onError', router, context);
  })

  // hook router.beforeEach
  router.beforeEach(async (to, from, next) => {
    await plugin.invokeAllAsync('router.beforeEach', router, to, from, next, context)
      .then(isNext => {
        if(isNext){
          next();
        }else{
          next(false);
        }
      })
      .catch(e => {
        next(e);
      })
  });

  // hook router.afterEach
  router.afterEach(async (to, from, next) => {
    await plugin.invokeAllAsync('router.beforeEach', router, to, from, context);
  });

  // hook router.alter
  plugin.invokeAll('router.alter', router, context);
  return router;
};


/**
 * 获取全部路由，并去重。
 * @return {[type]} [description]
 */
function getRoutes(){
  let plugins = plugin.list();
  let routes = [];
  plugins.each((pname, index) => {
    let mod = plugin.getModule('router/routes', pname);
    if(mod && mod.default && _.isArray(mod.default)){
      routes = routes.concat(mod.default);
    }
  });

  return _.unionBy(routes, 'path');
}
