/**
 * hotel api代理
 * @module hotel/proxy
 * @todo 如果需要认证怎么办？例如用户信息。
 * ** warning ** 这个接口应该只在开发阶段有效，生产环境应该杜绝。
 */
const axios = require('axios');
const querystring = require('querystring');
const _ = require('lodash');

module.exports = app => {
  return class extends app.Controller {
    async get(){
      await proxy('get', this.ctx);
    }
    async post(){
      await proxy('post', this.ctx);
    }
  }
}

async function proxy(type, ctx){
  let url = ctx.url.replace('/api/minsu-proxy/', 'minsu/');
  let headers = ctx.headers;

  // 绕过token验证
  delete headers.host;
  let httpHeaders = getHttpHeaders(headers);
  // data 只有在非get请求时需要发送。
  let data = ctx.request.body;
  let config = {
    method: type,
    url: `http://m.elong.com/${url}`,
    headers: httpHeaders
  };

  // 如果是post提交表单数据。
  if(type != 'get'){
    if(ctx.is('application/x-www-form-urlencoded')){
      config.data = querystring.stringify(data);
    }else{
      config.data = data;
    }
  }

  // @tofix 如果结果为304，axios也会进入error。需要修复。
  let rst = await axios(config)
    .catch(e => {
      // console.log('==== http proxy error start ====');
      console.log(e);
      // console.log('==== http proxy error end ====');
      return {
        status: 500,
        data: e.response.data
      }
    })
  ctx.response.set(rst.headers);
  ctx.status = rst.status;
  ctx.body = rst.data;
}


// 获取符合http标准的头。
function getHttpHeaders(headers = {}){
  let httpHeaders = {};
  for(let key  in headers){
    httpHeaders[upFirst(key)] = headers[key];
  }
  return httpHeaders;
}

function upFirst(str){
  let rst = str.split('-').map(i => {
    return _.upperFirst(i)
  });
  return rst.join('-')
}

