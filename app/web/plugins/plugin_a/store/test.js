import Test from '~/test';
const test = Test('$pluginA/store/test')

export default (namespace, context) => {
  return {
    namespaced: true,
    actions: {
      test
    }
  }
}
