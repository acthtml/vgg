import _ from 'lodash';
export default (prefixer, obj = {}) => {
  if(!prefixer) return obj;
  let rst = {};
  for(let key in obj){
    rst[_.kebabCase(prefixer + ' ' + key)] = obj[key]
  }
  return rst;
}
