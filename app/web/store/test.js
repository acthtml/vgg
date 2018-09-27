import Test from '~/test';
const test = Test('~/store/test')

export default (namespace, context) => {
  return {
    namespaced: true,
    actions: {
      test
    }
  }
}
