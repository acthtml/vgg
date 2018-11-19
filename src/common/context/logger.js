/**
 * 日志
 *
 * @see https://eggjs.org/zh-cn/core/logger.html
 * @module common/context/logger
 */
import _ from 'lodash';
import vgg from '../../';

// 打印的级别
const level = levelmap(_.get(vgg.config, 'logger.level', 'debug'), 'number');

export default (context, ctx) => {
  // koa ctx
  const kaoCtx = _.get(context, 'ctx');
  let logger = {
    debug(...args){
      log('debug', kaoCtx, ...args);
    },
    info(...args){
      log('info', kaoCtx, ...args);
    },
    warn(...args){
      log('warn', kaoCtx, ...args);
    },
    error(...args){
      log('error', kaoCtx, ...args);
    }
  }

  // hook app.alterContextLogger
  vgg.plugin.invokeAll('app.alterContextLogger', context, ctx);
  vgg.logger = logger;
  return logger;
}

/**
 * 打印日志。
 * @param  {String}    type 类别
 * @param  {any} args  日志的参数
 */
function log(type, kaoCtx, ...args){
  // 是否需要打印。
  if(level == 0) return;
  if(level > levelmap(type, 'number')) return;

  // 进行打印
  type = levelmap(type, 'string');

  // 服务端
  if(kaoCtx && kaoCtx.logger){
    kaoCtx.logger[type](...args);
  }
  // 客户端
  else{
    console[type == 'debug' ? 'info' : type](...args);
    // @todo 将日志通过网关记录。
  }
}


/**
 * 级别映射
 * - 'none' == 0
 * - 'debug' == 1
 * - 'info' == 2
 * - 'warn' == 3
 * - 'error' == 4
 * @param  {String|Number} level 级别
 * @param {String} type 返回级别的类型。
 * @return {String|Number}  根据type返回指定的级别。
 */
function levelmap(level, type = 'string'){
  const map = ['none', 'debug', 'info', 'warn', 'error'];
  if(type == 'number'){
    return typeof level == 'number' ? level : _.indexOf(map, level);
  }else{
    return typeof level == 'string' ? level : map[level];
  }
}
