import Test from '~/test';
const test = Test('~/plugins/test')

export default {
  test: {
    install(Vue){
      Vue.mixin({
        methods: {
          test
        }
      })
    }
  }
}
