/**
 * 扫描vgg架构目录，在指定文件夹生成插件运行时文件(plugin_runtime.js)。
 * @type {[type]}
 */
const scan = require('./scan');
const write = require('./write');
const watch = require('./watch');
module.exports = async (watchmode = false){
  let plugins = scan();
  await write(plugins);
  if(watchmode){
    watch();
  }
}
