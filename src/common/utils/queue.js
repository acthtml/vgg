/**
 * 队列
 *
 * @module utils/queue
 */
const queues = {};

/**
 * 在队列中，按token注册一个函数，只有第一个注册的函数会执行，最终返回函数执行结果。
 *
 * @param  {[type]} token   [description]
 * @param  {[type]} handler [description]
 * @return {[type]}         [description]
 */
async function queue(token, handler){
  if(!queues.hasOwnProperty(token)){
    queues[token] = new Promise(async (res, rej) => {
      setTimeout(async () => {
        try{
          let rst = await handler();
          res(rst);
        }catch(e){
          rej(e);
        }
        delete queues[token];
      }, 0)
    });
  }
  return queues[token];
}

export default queue;
