module.exports = app => {
  app.get(`${app.config.easyvue.siteRoot}(.+)?`, 'app.app.index');

  // 签名代理
  // app.get('/api/signature', 'minsu.proxySignature.get');
  // app.get('/api/minsu-proxy', 'minsu.proxy.get');
  // app.post('/api/minsu-proxy', 'minsu.proxy.post');
  // app.del('/api/minsu-proxy', 'minsu.proxy.post');
  // app.update('/api/minsu-proxy', 'minsu.proxy.post');
}
