<template>
  <div>
    <h1>t.e.s.t</h1>
    <router-link to="/plugin-a">pluin a</router-link>
    <p>{{'filter test' | test}}</p>
  </div>
</template>
<script>
  import vgg from '../../../src/';
  import {mapActions} from 'vuex';
  import runTest from '../test/test';
  export default {
    mounted(){
      // 1. 配置
      console.log(vgg.config)

      // 2. utils
      vgg.utils.test();

      // 3. filter, plugins.
      this.test();

      // 4. context http, logger, cookies
      console.log('context/http', this.$http ? 'working' : 'down');
      console.log('context/logger', this.$logger ? 'working' : 'down');
      console.log('context/cookies', this.$cookies ? 'working' : 'down');

      // 5. api
      this.$api('test').test();
      this.$api('test', 'pluginD').test();

      // 6. store
      this.$store.register('test', '$pluginA/test');
      this.storeTest();

      runTest();
    },
    methods: {
      ...mapActions('test', {
        storeTest: 'test'
      })
    }
  }

  function assert(){}
</script>
