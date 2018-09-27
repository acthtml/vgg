/**
 * 服务端入口
 *
 * - hook app.appCreated
 *
 * @see  https://github.com/vuejs/vue-hackernews-2.0/blob/master/src/entry-server.js
 */
import createApp from './app';

export default context => {
  console.log(11112221)
  const appContext = createApp(context, 'server');
  console.log(11112223)
  const {appCreator, router, store} = appContext;
  const app = appCreator();

  console.log(1111222)

  // hook app.appCreated
  plugin.invokeAll('app.appCreated', appContext);


  // 解析动态组件。
  router.push(context.url);
  return new Promise((res, rej) => {
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()
      // no matched routes
      if (!matchedComponents.length) {
        // @todo
        return rej({ code: 404 })
      }

      Promise.all(matchedComponents.map(({ asyncData }) => asyncData && asyncData({
        ...appContext,
        app,
        route: router.currentRoute
      }))).then(() => {
        context.state = store.state
        res(app);
      }).catch(rej)
    }, rej)
  })
}


