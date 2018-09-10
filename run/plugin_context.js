// const REG_CONTEXT = /(api\/.*|store\/.*|router\/.*|config\/.*|components\/index|common\/(context|directive|filter|plugins|utils)\/index).[js|vue]$/ig

export default {
  vgg: require.context('../src', true, /(api\/.*|store\/.*|router\/.*|config\/.*|components\/index|common\/(context|directive|filter|plugins|utils)\/index).[js|vue]$/),
  pluginA: require.context('../app/web/plugins/plugin_a', true, /(api\/.*|store\/.*|router\/.*|config\/.*|components\/index|common\/(context|directive|filter|plugins|utils)\/index).[js|vue]$/),
  pluginB: require.context('../app/web/plugins/plugin_b', true, /(api\/.*|store\/.*|router\/.*|config\/.*|components\/index|common\/(context|directive|filter|plugins|utils)\/index).[js|vue]$/),
  pluginC: require.context('../src/plugins/plugin_c', true, /(api\/.*|store\/.*|router\/.*|config\/.*|components\/index|common\/(context|directive|filter|plugins|utils)\/index).[js|vue]$/),
  pluginD: require.context('../app/web/plugins/plugin_d', true, /(api\/.*|store\/.*|router\/.*|config\/.*|components\/index|common\/(context|directive|filter|plugins|utils)\/index).[js|vue]$/),
  '~': require.context('../app/web', true, /(api\/.*|store\/.*|router\/.*|config\/.*|components\/index|common\/(context|directive|filter|plugins|utils)\/index).[js|vue]$/),
}
