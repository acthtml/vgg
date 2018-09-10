/**
 * 清空文件夹。
 * @module clean
 */
const fs = require('fs-extra');

module.exports = async (dirpath) => {
  return fs.emptyDir(dirpath);
}
