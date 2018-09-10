/**
 * 上传静态文件
 *
 * - 上传至jscdn
 * - publicpath: https://js.40017.cn/cn/h/minsu/v1/
 * @module upload
 */
const axios = require('axios');
const formData = require("form-data");
const fs = require('fs-extra');

// http://leonidmanager2.17usoft.com/mvcleonid/5a52ca0ca753370007aff740/34457/resource/api
const userToken = '8c7f9d3c696ee2dd430953dd73df66fb';
const assetKey = 'a1e31833288ff4741f38f8ce1a3084f5';
const bucket = 'js40017cnproduct';
const uploadDir = '/cn/h/test/v1/';

module.exports = async (file) => {
  // 1. 检测是否存在文件
  if(!await fs.ensureFile(file).then(() => true).catch(e => false)){
    throw new Error(`上传的文件不存在:${file}`);
  }

  // 准备上传数据
  let url, data, config;
  url = 'http://leonidapi.17usoft.com/libraapi2/leonid/v2/static/uploadzip/simple';
  data = new formData();
  data.append("zipfile", fs.createReadStream(file));
  data.append("bucket_name", bucket);
  data.append("key", uploadDir);
  config = {
    headers: Object.assign({}, data.getHeaders(), {
      //获取私有key
      "user-token": userToken,
      //获取公共key
      "asset-key": assetKey
    })
  }

  return await axios.post(url, data, config)
    .then(rst => {
      if(rst.data.code == 0){
        return true;
      }else{
        throw new Error(rst.data.msg)
        return false;
      }
    })
}
