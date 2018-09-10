/**
 * 插件
 *
 * 插件机制能保证核心精简，易于扩展，促进业务逻辑复用和生态圈的形成。
 *
 * 插件能扩展框架所有的资源：
 *
 * - api
 * - store
 * - router,routes
 * - components,views
 * - utils
 * - Vue(context, directive, filter)
 *
 * ## 如何使用插件
 *
 * 插件在 `/config/plugin.js`中进行定义，输出的key即为插件的命名空间，value即为对应插件的
 * 配置。
 *
 * 配置有这些选项：
 *
 * - package 插件对应的包名称，例如'vgg-plugin-user'。也可以是相对地址，例如'../plugins/plugin_a'。
 * - components [Boolean]{true} 插件组件是否注入。
 * - routes [Boolean](true) 插件路由是否注入。
 *
 * 插件的配置值可以直接是包名，例如：
 *
 * ```js
 * {
 *   user: 'vgg-plugin-user',
 *   pluginA: '../plugins/plugin_a'
 * }
 * ```
 *
 * 配置好之后，资源会已如下的顺序加载资源，其中，如果资源命名空间相同，则后面的会覆盖前面的：
 *
 * - 框架
 * - 插件依赖的插件
 * - 插件（按照定义顺序）
 * - 应用本身
 *
 * ## 引用插件的资源。
 *
 * - api,store 通过'$插件名/模块名'
 * - 其他资源 import('$插件名/xxxx')  其中'$插件名'会经过webpack转义成插件对应的路径。
 *
 * ## 如何创建插件
 *
 * @todo
 *
 * @module core/pulgin
 */
const _ = require('lodash');
const Toposort = require('toposort-class');

/**
 * 插件列表，顺序为安装顺序，要依赖的插件总是在插件之前，先声明的插件总是在声明的插件之前，核
 * 心插件总是在非核心插件之前。
 */
let cacheList;
/**
 * 插件对象列表，其key为插件名，value为对应插件的配置属性。其被系统解析后，会有这些属性：
 *
 * - package 插件的包名称或相对路径名称。是根据插件配置转换而来的。如果路径是包名的话，则转
 *   换到`${package}/src`；如果是相对路径的话，则转换成相对于`${process.cwd()}/run`的根
 *   目录。此属性值最后用到/run/plugin_context.js中。
 * - components 是否注入组件。
 * - routes 是否注入路由。
 *
 * 在plugin.scan()中进行初始化。
 */
let cachePlugins;

const plugin = {
  /**
   * 扫描所有插件，创建：插件列表，插件对象列表。
   * 插件读取失败会有error提示，但不终止程序运行。
   *
   * @return {[type]} [description]
   */
  scan(){
    cacheList = [];
    cachePlugins = {};

    let baseDir = '';
    // 扫描插件依赖，其中vgg和~是分别表示核心默认插件，分别表示核心和工作目录。
    let defaultPlugins = {
      'vgg': '../',
      '~': '~/'
    }
    if(typeof WEBPACK_ENV_TYPE == 'undefined'){
      const path = require('path');
      defaultPlugins.vgg = getRelativePathFromRoot(path.join(__dirname, '../'));
    }
    for(let key in defaultPlugins){
      let toposort = new Toposort();
      let pconfig = {};
      pconfig[key] = defaultPlugins[key];
      _scan(pconfig, '', defaultPlugins[key], toposort);
      cacheList = cacheList.concat(toposort.sort().reverse());
      cacheList = _.pull(cacheList, key);
      cacheList.push(key);
    }
  },
  /**
   * 获取插件列表，并按加载优先级排好序。
   * @param {Boolean} isReverse 是否排序时。使用在覆盖类型的加载资源，所以core vgg总是
   *                            出现在最末端，
   * @return {Array} 插件列表
   */
  list(isReverse = false){
    if(typeof cacheList == 'undefined'){
      this.scan();
    }

    if(isReverse){
      let cacheListReverse = _.reverse(cacheList);
      cacheListReverse = _.pull(cacheListReverse, 'vgg');
      cacheListReverse.unshift('vgg');
      return cacheListReverse;
    }else{
      return cacheList;
    }
  },
  invoke(name, hook, ...args){},
  invokeAll(hook, ...args){},
  async invokeAsync(name, hook, ...args){},
  async invokeAllAsync(hook, ...args){},
  assign(modulePath, mod = 'assign'){},

  /**
   * 获取插件内的指定模块。插件上下文有pluginContext获取。
   * @param  {[type]} modulePath [description]
   * @param  {[type]} pluginName [description]
   * @return {[type]}            [description]
   */
  getModule(modulePath, pluginName){
    let pack = cachePlugins[pluginName].package;
    if(!pack) return null;

    let mod = null;
    if(typeof WEBPACK_ENV_TYPE != 'undefined'){
      const pluginContext = require('~/../../run/plugin_context');
      mod = pluginContext[pluginName](modulePath);
    }else{
      let path = require('path');
      if(pack.indexOf('.') == 0){
        pack = path.join(process.cwd(), 'run/', pack);
      }
      try{
        mod = require(path.join(pack, modulePath));
      }catch(e){}
    }
    return mod;
  }
}

export default plugin;
// module.exports = plugin

/**
 * 扫描插件配置。
 * @param  {Array} plugins      当前插件列表，key为插件名称, value为插件配置。
 * @param  {String} parentPluginName  父插件名称
 * @param  {Object} toposort     [description]
 * @return {[type]}              [description]
 */
function _scan(configs, parent, baseDir, toposort){
  for(let name in configs){
    if(!parent || parent == 'vgg' || parent == '~'){
      toposort.add(name, []);
    }else{
      toposort.add(name, parent);
    }

    // 获取基础配置。
    let config = processPluginConfig(configs[name], baseDir, name == 'vgg' || name == '~');
    if(cachePlugins.hasOwnProperty(name)){
      if(config.components) cachePlugins[name].components = true;
      if(config.routes) cachePlugins[name].routes = true;
    }else{
      cachePlugins[name] = config;
    }

    // 扫描依赖插件。
    if(cachePlugins[name].scaned) continue;
    cachePlugins[name].scaned = true;
    let depConfigs = plugin.getModule('config/plugin', name);
    if(depConfigs){
      _scan(depConfigs, name, config.package, toposort);
    }
  }
}


/**
 * 处理每个插件项，根据基础路径算出真实的文件夹地址。
 * @param  {[type]} item [description]
 * @return {[type]}      [description]
 */
function processPluginConfig(oriConfig, baseDir, isStartDir){
  let config = {
    package: '',
    components: true,
    routes: true
  };

  // 1. 合并配置项。
  if(_.isString(oriConfig)){
    config.package = oriConfig;
  }else if(_.isObject(oriConfig)){
    Object.assign(config, oriConfig);
  }

  // 2. 计算所在目录，只在webpack构建时的服务端运行。
  if(typeof WEBPACK_ENV_TYPE == 'undefined'){
    const path = require('path');
    if(config.package.indexOf('.') == 0){
      config.package = path.join(baseDir, isStartDir ? '' : 'config', config.package);
    }
    else if(config.package.indexOf('/') == 0){
      config.package = getRelativePathFromRoot(config.package);
    }
    else if(config.package.indexOf('~') == 0){
      config.package = path.join(process.cwd(), 'app/web/', config.package.replace('~/', ''));
      config.package = getRelativePathFromRoot(config.package);
    }else{
      config.package = path.join(config.package, 'src');
    }
  }

  if(!config.package){
    return null;
  }else{
    return config;
  }
}


/**
 * 获取相对于/run的相对路径
 * @param  {[type]} target [description]
 * @return {[type]}        [description]
 */
function getRelativePathFromRoot(target){
  if(typeof WEBPACK_ENV_TYPE == 'undefined'){
    const path = require('path');
    let rootPath = path.join(process.cwd(), 'run/');
    return path.relative(rootPath, target);
  }else{
    return '';
  }
}

function proxyPath(method, ...args){
  if(typeof WEBPACK_ENV_TYPE == 'undefined'){
    const path = require('path');
    return path[method](...args);
  }else{
    return ''
  }
}
