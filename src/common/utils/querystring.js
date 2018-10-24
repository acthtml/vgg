/**
 * @module utils/querystring
 *
 * 将对象转换成请求字符串
 * @param  {Object}  data  参数对象，对象深度只支持1层。
 * @param  {Boolean} clean 是否清除空值，例如当值为0, '', []，对应的键值名是否保留。
 * @return {String}        请求字符串
 */
export default (data, clean = false) => {
  if(typeof data != 'object') return '';

  let qs = [];
  for(let key in data){
    if(!data.hasOwnProperty(key)) continue;

    let value = data[key];
    if(typeof value == 'object'){
      if(value instanceof Array){
        value = value.join(',');
      }else{
        value = JSON.stringify(value);
      }
    }

    // 忽略为空
    if(clean && (value == '' || value == 0)) continue;

    // 添加最终数据
    let encodeURIComponent;
    if(typeof window != 'undefined'){
      encodeURIComponent = window.encodeURIComponent;
    }else{
      encodeURIComponent = require('querystring').escape;
    }
    value = encodeURIComponent(value);
    qs.push(`${key}=${value}`);
  }

  return qs.join('&');
}
