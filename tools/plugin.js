/**
 * 插件的管理和运行时生成。
 */
const path = require('path');
const _ = require('lodash');
const Toposort = require('toposort-class');
const fs = require('fs-extra');

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
   * 扫描vgg架构目录，在指定文件夹生成插件运行时文件(plugin_runtime.js)。
   * @param  {Boolean} watchmode 是否进行监控。
   * @return {[type]}            [description]
   */
  async run(watchmode = false){
    console.log('插件扫描开始')
    await this.scan();
    this.write();
    if(watchmode){
      this.watch();
    }

    console.log('插件扫描结束：', cacheList, cachePlugins);
  },
  /**
   * 扫描所有插件，创建：插件列表，插件对象列表。
   * 插件读取失败会有error提示，但不终止程序运行。
   *
   * @return {[type]} [description]
   */
  async scan(){
    cacheList = [];
    cachePlugins = {};

    let baseDir = '';
    // 扫描插件依赖，其中vgg和~是分别表示核心默认插件，分别表示核心目录和工作目录。
    let defaultPlugins = {
      'vgg': getRelativePathFromRoot(path.join(__dirname, '../src/')),
      '~': '~/'
    }
    for(let key in defaultPlugins){
      let toposort = new Toposort();
      let pconfig = {};
      pconfig[key] = defaultPlugins[key];
      await _scan(pconfig, '', defaultPlugins[key], toposort);
      cacheList = cacheList.concat(toposort.sort().reverse());
      cacheList = _.pull(cacheList, key);
      cacheList.push(key);
    }
  },

  /**
   * 根据插件目录写入运行时文件
   * @return {[type]} [description]
   */
  async write(){
    let file = path.join(process.cwd(), 'run', 'plugin_runtime.js');
    await fs.ensureFile(file)
      .catch(e => {
        throw new Error('plugin_runtime.js文件无法创建。')
      });

    // 写入的内容。
    let content = getRuntimeContent();
    await fs.writeFile(file, content)
      .catch(e => {
        throw new Error('plugin_runtime.js文件无法写入。')
      })
  },
  watch(){},
  getRuntimeContent(){
    let content = '';
    for(let i = 0; i < cacheList.length; i++){
      let name = cacheList[i],
          plugin = cachePlugins[name],
          regx = '/(api\/.*|store\/.*|config\/.*|common\/(context|directive|filter|plugins|utils)\/index|views\/app';
      if(plugin.components){
        regx += '|components\/index';
      }
      if(plugin.routes){
        regx += '|router\/index|router\/routes'
      }else{
        regx += '|router\/index'
      }
      regx += ')\.(js|vue|json)$/';

      content += `
        '${name}': {
          context: require.context('${plugin.package}', true, ${regx}),
          components: ${plugin.components ? 'true' : 'false'},
          routes: ${plugin.routes ? 'true' : 'false'}
        },
      `
    }
    content = `
      export default {
        ${content}
      }
    `;
    return content;
  }
}

module.exports = plugin;

/**
 * 扫描插件配置。
 * @param  {Array} plugins      当前插件列表，key为插件名称, value为插件配置。
 * @param  {String} parentPluginName  父插件名称
 * @param  {Object} toposort     [description]
 * @return {[type]}              [description]
 */
async function _scan(configs, parent, baseDir, toposort){
  for(let name in configs){
    // 扫描依赖插件。
    if(cachePlugins[name] && cachePlugins[name].scaned) continue;

    // 获取基础配置。
    let config = await processPluginConfig(configs[name], baseDir, name == 'vgg' || name == '~');
    if(!config) continue;

    if(cachePlugins.hasOwnProperty(name)){
      if(config.components) cachePlugins[name].components = true;
      if(config.routes) cachePlugins[name].routes = true;
    }else{
      // 检测是否有效。
      cachePlugins[name] = config;
    }

    if(!parent || parent == 'vgg' || parent == '~'){
      toposort.add(name, []);
    }else{
      toposort.add(name, parent);
    }
    cachePlugins[name].scaned = true;
    let depConfigs = getModule('config/plugin', name);
    if(depConfigs){
      await _scan(depConfigs, name, config.package, toposort);
    }
  }
}

/**
 * 处理每个插件项，根据基础路径算出真实的文件夹地址。
 * @param  {[type]} item [description]
 * @return {[type]}      [description]
 */
async function processPluginConfig(oriConfig, baseDir, isStartDir){
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
  if(!config.package) return null;

  // 2. 计算所在目录，只在webpack构建时的服务端运行。
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

  // 检测文件夹是否有效。
  let packageDir = config.package;
  if(packageDir.indexOf('.') == 0){
    packageDir = path.join(process.cwd(), 'run', packageDir);
  }else{
    packageDir = path.resolve(packageDir);
  }

  if(!await fs.readdir(packageDir).then(() => true).catch(e => false)){
    config = null;
  }
  return config;
}

/**
 * 获取相对于/run的相对路径
 * @param  {[type]} target [description]
 * @return {[type]}        [description]
 */
function getRelativePathFromRoot(target){
  let rootPath = path.join(process.cwd(), 'run/');
  return path.relative(rootPath, target);
}

/**
 * 获取插件内的指定模块。插件上下文有pluginContext获取。
 * @param  {[type]} modulePath [description]
 * @param  {[type]} pluginName [description]
 * @return {[type]}            [description]
 */
function getModule(modulePath, pluginName){
  let pack = cachePlugins[pluginName].package;
  if(!pack) return null;

  let mod = null;
  if(pack.indexOf('.') == 0){
    pack = path.join(process.cwd(), 'run/', pack);
  }
  try{
    mod = require(path.join(pack, modulePath));
  }catch(e){}
  return mod;
}
