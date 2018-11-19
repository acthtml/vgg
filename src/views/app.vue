<template>
  <div id="app">
    <div class="app-wrapper">
      <transition :name="transitionName">
        <router-view class="router-view"></router-view>
      </transition>
    </div>
  </div>
</template>
<script>
import {mapState} from 'vuex';

export default {
  data(){
    return {
      transitionName: 'page-in'
    }
  },
  computed: {
    ...mapState('route', ['path']),
  },
  watch: {
    path(){
      let isBack = this.$router.isBack;
      if( isBack ){
        this.transitionName = 'page-back';
      }else{
        this.transitionName = 'page-in';
      }
      this.$router.isBack = false;
    }
  }
}

</script>
<style scoped>
  /**
   * 页面进入离开动画
   * https://github.com/zhengguorong/pageAinimate
   */
  .page-in-enter-active{transition: all 0.26s cubic-bezier(.55,0,.1,1); position: fixed;top: 0;left: 0;z-index: 1;}
  .page-in-enter{transform: translateX(50px); opacity: 0;}
  .page-in-enter-to{transform: translateX(0); opacity: 1;}
  .page-in-leave-active{transition: all 0.26s cubic-bezier(.55,0,.1,1); position: fixed;top: 0;left: 0;}
  .page-in-leave{transform: translateX(0);opacity: 1;}
  .page-in-leave-to{transform: translateX(-50px); opacity: 0;}
  .page-back-enter-active{transition: all 0.26s cubic-bezier(.55,0,.1,1); position: fixed;top: 0;left: 0;z-index: 1;}
  .page-back-enter{transform: translateX(-50px); opacity: 0;}
  .page-back-enter-to{transform: translateX(0); opacity: 1;}
  .page-back-leave-active{transition: all 0.26s cubic-bezier(.55,0,.1,1); position: fixed;top: 0;left: 0;}
  .page-back-leave{transform: translateX(0);opacity: 1;}
  .page-back-leave-to{transform: translateX(50px); opacity: 0;}
</style>

