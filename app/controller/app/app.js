const path = require('path');

// 页面需要注入的vconsole脚本
const vconsole = `<script src="https://res.wx.qq.com/mmbizwap/zh_CN/htmledition/js/vconsole/3.0.0/vconsole.min.js"></script>
  <script>var vConsole = new VConsole()</script>`;

module.exports = app => {
  return class extends app.Controller {
    async index(){
      await this.ctx.render('vue-ssr-server-bundle.json',
        // local context
        {
          // 页面url
          url: this.ctx.url.replace(app.config.easyvue.siteRoot, ''),
          // 站点根目录
          siteRoot: app.config.easyvue.siteRoot,
          // cookies
          cookies: this.ctx.cookies,
          // koa ctx
          ctx: this.ctx,
          vconsole: app.config.vconsole ? vconsole : ''
        },
        // render options
        {
          renderOptions: {
            // https://ssr.vuejs.org/zh/api.html#runinnewcontext
            runInNewContext: false
          }
        }
      )
    }
  }
}

