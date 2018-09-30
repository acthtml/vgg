/**
 * api服务，可以想象成service层。
 *
 * 因为ssr需要避免单例模式，这样可以避免多用户访问时上下文污染的问题。此为api的主入口，会配合
 * vue插件(/common/plugins/api)将实例$api和实例api分别注入到组件和asyncData方法中。
 *
 * 我们在开发时，只要关注子模块就行了。
 *
 * 例如创作一个模块login，那么在创建一个文件 /api/modules/login.js，文件如下：
 *
 * ```js
 *   // 该文件需要默认输出一个方法，该方法的第一个参数必须是http，该实例即为axios的实例。
 *   export default async http => {
 *     return ({username, password}) => {
 *       return http.post('/api/login', {
 *         params: {username, password}
 *        })
 *     }
 *   }
 *
 *   // 如何调用api，例如在vue组件中，可直接通过$api调用到模块
 *   this.$api('login')({
 *     username: 'admin',
 *     password: '123456'
 *   }).then()
 * ```
 * @module api
 */
import _ from 'lodash';
import plugin from './plugin';
import vgg from '../index'

/**
 * api 网关
 * @param  {Object} http axios的实例，应该有~/common/context/http生成。
 * @param  {String} name api模块名称
 * @return {Mixed}       返回对应的api模块方法
 */
export default (ctx) => {
  function api(name, pluginName = '~'){
    let mod;
    try{
      // formate name to snakeCase.
      name = name.split('/').map(i => _.snakeCase(i)).join('/');
      mod = plugin.getModule('api/' + name, pluginName);
      if(!mod) throw new Error();
    }catch(e){
      let errmsg = `api没有找到模块${name}`;
      if(pluginName != '~'){
        errmsg += `（插件${pluginName}）`;
      }
      throw new Error(errmsg);
    }
    return mod({...ctx, api});
  }

  vgg.api = api;
  return api
}
