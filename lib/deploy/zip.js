/**
 * 压缩文件夹
 * https://www.npmjs.com/package/archiver
 * @module zip
 */
const fs = require('fs');
const archiver = require('archiver');

/**
 * 压缩指定文件夹
 * @param  {String} source 源文件夹
 * @param  {String} dest   目标文件
 * @return {Boolean}       是否压缩成功
 */
module.exports = async (source, dest) => {
  return new Promise((res, rej) => {
    let output = fs.createWriteStream(dest);
    let zip = archiver('zip', {zlib: {level: 9}});

    output.on('close', () => {
      res(true);
    });

    output.on('error', e => {
      rej(e);
    });

    zip.pipe(output);
    zip.directory(source, false);
    zip.finalize();
  })
}
