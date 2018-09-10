const os = require('os');

module.exports = position => {
  const interfaces = os.networkInterfaces();
  const ips = [];

  // if (interfaces.en0) {
  //   for (let i = 0; i < interfaces.en0.length; i++) {
  //     if (interfaces.en0[i].family === 'IPv4') {
  //       ips.push(interfaces.en0[i].address);
  //     }
  //   }
  // }
  // if (interfaces.en1) {
  //   for (let i = 0; i < interfaces.en1.length; i++) {
  //     if (interfaces.en1[i].family === 'IPv4') {
  //       ips.push(interfaces.en1[i].address);
  //     }
  //   }
  // }
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
