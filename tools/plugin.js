/**
 * 插件的扫描和管理。
 *
 * @module tools/plugin
 */
const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');
const Toposort = require('toposort-class');
const chokidar = require('chokidar');

/**
 * 插件列表，顺序为安装顺序，要依赖的插件总是在插件之前，先声明的插件总是在声明的插件之前，核
 * 心插件总是在非核心插件之前。
 */
let cacheList;
/**
 * 插件对象列表，其key为插件名，value为对应插件的配置属性。其被系统解析后，会有这些属性：
 *
 * - package 插件的包名称或相对路径。根据插件所对应的路径最后转换为对于`${process.cwd()}/run`
 *   目录的相对路径。如果路径是包名的话，则转换到`${package}/src`；此属性值最后用于/run/plugin_runtime.js
 * - components 是否注入组件。
 * - routes 是否注入路由。
 *
 * 在plugin.scan()中进行初始化。
 */
let cachePlugins;

module.exports = {
  /**
   * 扫描vgg架构目录，在指定文件夹生成插件运行时文件(plugin_runtime.js)。
   * @param  {Boolean} watchmode 是否进行监控。
   * @return {[type]}            [description]
   */
  run(watchmode = false, env = 'local'){
    let start = new Date().getTime();
    this.scan(true);
    this.write(env);
    if(watchmode){
      this.watch();
    }
    console.log('vgg插件扫描结果：', cacheList.join(', '));
    console.log('vgg插件扫描耗时：', (new Date().getTime() - start) + 'ms');
  },
  /**
   * 扫描所有插件，创建：插件列表，插件对象列表。
   * 插件读取失败会有error提示，但不终止程序运行。
   *
   * @param {Boolean} force 是否强制忽略缓存重新扫描。
   * @return {Object}
   */
  scan(force = false){
    if(force || !this.scaned){
      cacheList = [];
      cachePlugins = {};

      // 扫描插件依赖，其中vgg和~分别是核心目录和工作目录。
      let defaultPlugins = {
        'vgg': 'vgg',
        '~': '~'
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
      this.scaned = true;
    }

    // @todo not return it.
    return {
      ...cachePlugins
    }
  },
  /**
   * 根据插件目录写入运行时文件
   * @return {[type]} [description]
   */
  write(env = 'local'){
    let file = path.join(process.cwd(), 'run', 'plugin_runtime.js');
    try{
      fs.outputFileSync(file, createRuntimeFileContent(env));
    }catch(e){
      e.name = 'plugin_runtime.js写入错误：' + e.name;
      throw e;
    }
  },
  /**
   * 监测插件配置文件，有变化时，重新创建runtime。
   * @return {[type]} [description]
   */
  watch(){
    // 关闭历史监测，根据新的文件列表创建新的监测。
    if(this.watcher) this.watcher.close();

    // 需要监测的文件
    let files = [];
    for(let key in cachePlugins){
      let plugin = cachePlugins[key];
      if(plugin.package.indexOf('.') != 0) continue;
      files.push(path.join(process.cwd(), 'run', plugin.package, 'config/plugin.js'));
      files.push(path.join(process.cwd(), 'run', plugin.package, 'config/plugin.json'));
    };

    // 开始监测
    let ready = false;
    this.watcher = chokidar.watch(files);
    this.watcher.on('all', p => {
      if(ready) this.run(true);
    });
    this.watcher.on('ready', () => {
      ready = true;
    });
  },
  // 监测者
  watcher: null,
  // 是否已经扫描
  scaned: false,
  // 插件列表
  get list(){
    this.scan();
    return cacheList;
  },
  // 插件对象列表
  get plugins(){
    this.scan();
    return cachePlugins;
  },
};

/**
 * 扫描插件，设置插件对象列表，设置依赖关系表。
 * @param  {Object} configs  父插件配置（当前插件的package.json）。
 * @param  {String} parent   父插件名称
 * @param  {String} baseDir  父插件所在目录
 * @param  {[type]} toposort 依赖关系表对象
 */
function _scan(configs, parent, baseDir, toposort){
  for(let name in configs){
    // 获取基础配置。
    let config = processPluginConfig(configs[name], baseDir);
    if(!config) continue;

    // 合并插件历史设置。
    if(cachePlugins.hasOwnProperty(name)){
      if(config.components) cachePlugins[name].components = true;
      if(config.routes) cachePlugins[name].routes = true;
    }
    // 新增设置
    else{
      cachePlugins[name] = config;
    }
    toposort.add(name, !parent || parent == 'vgg' || parent == '~' ? [] : name);

    // 扫描子插件。
    if(!cachePlugins[name].scaned){
      cachePlugins[name].scaned = true;
      let depConfigs = getModule('config/plugin', name, false);
      if(depConfigs){
        _scan(depConfigs, name, path.join(config.package, 'config/'), toposort);
      }
    }
  }
}

/**
 * 根据原始配置获取标准配置，标准配置包含：
 *
 * - package 插件所在包名称或文件夹相对路径。
 * - components 是否导入组件
 * - routes 是否导入路由
 *
 * @param  {String|Object}  oriConfig  原始配置
 * @param  {String}  baseDir    当前包的基础路径绝对地址。
 * @param  {Boolean} isStartDir 是否是开始目录。
 * @return {Object}             标准配置对象，原始配置无效则返回null
 */
function processPluginConfig(oriConfig, baseDir){
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

  // 2. 根据目录配置，计算真实文件夹地址和相对地址。
  let packagePath = config.package,
      absolutePath, // 真实绝对路径。
      relativePath; // 相对于/run的路径。
  // 相对地址型
  if(packagePath.indexOf('.') == 0){
    absolutePath = path.join(process.cwd(), 'run/', baseDir, packagePath);
    relativePath = getRelativePathFromRun(absolutePath);
  }
  // 绝对地址型
  else if(packagePath.indexOf('/') == 0){
    absolutePath = packagePath;
    relativePath = getRelativePathFromRun(absolutePath);
  }
  // 相对工作目录型
  else if(packagePath.indexOf('~') == 0){
    absolutePath = path.join(process.cwd(), 'app/web/', packagePath.replace('~', ''));
    relativePath = getRelativePathFromRun(absolutePath);
  }
  // 普通包目录型
  else{
    absolutePath = path.join(path.dirname(require.resolve(packagePath + '/package.json')), 'src/');
    relativePath = path.join(packagePath, 'src/');
  }

  // 3. 检测有效性。
  try{
    fs.readdirSync(absolutePath);
    // 兼容windows环境
    relativePath = relativePath.replace(/\\/ig, '/');
    config.package = relativePath;
  }catch(e){
    config = null;
  }
  return config;
}

/**
 * 获取相对于/run的相对路径
 * @param  {[type]} target [description]
 * @return {[type]}        [description]
 */
function getRelativePathFromRun(target){
  let rootPath = path.join(process.cwd(), 'run/');
  return path.relative(rootPath, target);
}

/**
 * 获取插件内的指定模块。插件上下文有pluginContext获取。
 * @param  {[type]} modulePath [description]
 * @param  {[type]} pluginName [description]
 * @return {[type]}            [description]
 */
function getModule(modulePath, pluginName, cache = true){
  let pack = cachePlugins[pluginName].package;
  if(!pack) return null;

  let mod = null;
  if(pack.indexOf('.') == 0){
    pack = path.join(process.cwd(), 'run/', pack);
  }
  try{
    modulePath = path.join(pack, modulePath);
    if(!cache){
      delete require.cache[require.resolve(modulePath)];
    }
    mod = require(modulePath);
  }catch(e){
    // 忽略模块找不到的错误。
    if(e instanceof SyntaxError){
      console.error(e);
    }
  }
  return mod;
}

/**
 * 创建plugin_runtime.js文件的文本内容。
 * @return {[type]} [description]
 */
function createRuntimeFileContent(env = 'local'){
  let content = '';
  for(let i = 0; i < cacheList.length; i++){
    let name = cacheList[i],
        plugin = cachePlugins[name],
        regx = '/(app|api\\/.*|store\\/.*|common\\/(context|directive|filter|plugins|utils)\\/index|views\\/app';
    // configs
    regx += `|config\\/(plugin|config\\.(default|${env}))`;

    if(plugin.components){
      regx += '|components\\/index';
    }
    if(plugin.routes){
      regx += '|router\\/index|router\\/routes'
    }else{
      regx += '|router\\/index'
    }
    regx += ')\\.(js|vue|json)$/';

    content += `
      '${name}': {
        package: '${plugin.package}',
        context: require.context('${plugin.package}', true, ${regx}),
        components: ${plugin.components ? 'true' : 'false'},
        routes: ${plugin.routes ? 'true' : 'false'}
      },
    `
  }
  content = `
    /**
     * plugin runtime created by vgg.
     */
    export default {
      ${content}
    }
  `;
  return content;
}
