const REG_CONTEXT = /(api\/.*(?#)|store\/.*|router\/.*|config\/.*|components\/index|common\/(context|directive|filter|plugins|utils)\/index).js$/ig

export default {
  pluginA: require.context('../app/web/plugins/plugin_a', true, REG_CONTEXT),
  pluginB: require.context('vgg-plugin-plugin-b/src', true, REG_CONTEXT)
}
