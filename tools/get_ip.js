/**
 * 获取当前的ip地址。
 * @type {[type]}
 */
const os = require('os');

module.exports = position => {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (let k in interfaces) {
    for (let k2 in interfaces[k]) {
      const address = interfaces[k][k2];
      if (address.family === 'IPv4' && !address.internal) {
        ips.push(address.address);
      }
    }
  }
  if (position > 0 && position <= ips.length) {
    return ips[position - 1];
  } else if (ips.length) {
    return ips[0];
  }
  return '127.0.0.1';
};
