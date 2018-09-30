/**
 * plugin
 *
 * @module core/plugin
 */
import _ from 'lodash';
import pluginRuntime from '~/../../run/plugin_runtime';


let cacheList, cacheListReverse;
export default {
  /**
   * 获取插件名称列表
   * @param  {Boolean} reverse 是否是反序。反序用在文件覆盖类型的hook，例如app.vue。反
   *                           序之后会将vgg总是放到最后。
   * @return {Array}           插件名称列表
   */
  list(reverse = false){
    if(!cacheList){
      cacheList = _.keys(pluginRuntime);
      cacheListReverse = _.reverse([...cacheList]);
      cacheListReverse = _.pull(cacheListReverse, 'vgg');
      cacheListReverse.push('vgg');
    }
    return reverse ? cacheListReverse : cacheList;
  },
  invoke(name, hook, ...args){},
  invokeAll(hook, ...args){},
  async invokeAsync(name, hook, ...args){},
  async invokeAllAsync(hook, ...args){},
  /**
   * 合并指定模块
   * @param  {[type]} modulePath [description]
   * @param  {String} mod        [description]
   * @return {[type]}            [description]
   */
  assign(modulePath, mod = 'assign', reverse = false){
    let plugins = this.list(),
        target = {};
    plugins.forEach(plugin => {
      let rst = this.getModule(modulePath, plugin);
      if(_.isObject(rst)){
        if(!reverse){
          target = _[mod]({}, target, rst);
        }else{
          target = _[mod]({}, rst, target);
        }
      }
    });
    return target;
  },
  /**
   * 获取模块，如果没有则返回null
   * @param  {[type]} modulePath [description]
   * @param  {[type]} pluginName [description]
   * @param  {[type]} raw   是否抛出原始模块，否的话会抛出default
   * @return {[type]}            [description]
   */
  getModule(modulePath, pluginName = '~', raw = false){
    let modulePathObj = this.parseModulePath(modulePath);
    modulePath = modulePathObj.filename;
    pluginName = modulePathObj.pluginName || pluginName;

    if(!pluginRuntime.hasOwnProperty(pluginName)){
      throw new Error(`vgg.plugin.getModule() 没有找到指定${pluginName}`);
    }
    // 是否是合法的路径，合法的后缀为.js/json/vue。默认后缀为.js
    if(!modulePath || modulePath.indexOf('.') == 0 || modulePath.indexOf('/') == 0){
      throw new Error(`vgg.plugin.getModule() 路径不合法: ${modulePath}`);
    }

    let indexFilenames = getIndexFilenames(modulePath);
    let mod = null;
    for(let i = 0; i < indexFilenames.length; i++){
      try{
        mod = pluginRuntime[pluginName].context('./' + indexFilenames[i]);
      }catch(e){
        if(e.message.indexOf('Cannot find module') < 0){
          console.warn(e);
        }
      }
      if(mod) break;
    }
    if(!raw && mod) mod = mod.default;
    return mod;
  },
  /**
   * 根据路径获取模块名称。
   * @param  {[type]} modulePath 路径名称[$pluginName/]foo/bar
   * @return {[type]}            包含当前的插件名称和相对于插件根目录的路径地址。
   */
  parseModulePath(modulePath){
    let pluginName = '',
        filename = modulePath;
    if(modulePath.indexOf('$') == 0){
      if(modulePath.indexOf('/') == -1){
        throw new Error(`vgg.plugin.parseModulePath() 路径不合法: ${modulePath}。`);
      }
      pluginName = modulePath.substr(1, modulePath.indexOf('/') - 1);
      filename = modulePath.substr(modulePath.indexOf('/') + 1);
    }
    return {
      pluginName,
      filename
    }
  }
}

/**
 * 获取文件名的后缀。
 * @param  {[type]} filename [description]
 * @return {[type]}          [description]
 */
function getExtension(filename){
  let extension = '';
  filename = filename.split('/');
  filename = filename[filename.length - 1];
  if(filename.lastIndexOf('.') >= 0){
    extension = filename.substr(filename.lastIndexOf('.') + 1, filename.length);
  }
  return extension;
}

/**
 * 根据模块路径，返回需要索引的文件集合。例如模块foo/bar，则需要索引['foo/bar.js', 'foo/bar.json', 'foo/bar/index.js', 'foo/bar/index.json']
 * @param  {[type]} modulePath [description]
 * @return {[type]}            [description]
 */
function getIndexFilenames(modulePath){
  if(modulePath == '') throw new Error(`不合法的路径${modulePath}`);

  let filenames = [];
  if(modulePath.lastIndexOf('/') == modulePath.length -1){
    filenames = ['index.js', 'index.json'];
  }else{
    let extension = getExtension(modulePath);
    if(_.indexOf(['js', 'json', 'vue'], extension) == -1){
      filenames = ['.js', '.json', '/index.js', '/index.json'];
    }
  }
  filenames = filenames.map(ext => {
    return modulePath + ext;
  });

  return filenames.length > 0 ? filenames : [modulePath];
}

