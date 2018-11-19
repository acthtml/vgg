# vgg

vgg是根据vue技术栈的最佳实践总结而来的技术架构，它能以插件的形式扩展框架本身。支持单页面应用
的服务端和客户端渲染。

架构如下：

```
|--------------------|
| vgg + vgg-plugin-* |
|--------------------|
|     egg-vgg        |
|--------------------|
|      eggjs         |
|--------------------|
```

**重要：**我们基于[egg-vgg](https://github.com/acthtml/egg-vgg)可快速开始开发。

## 1. 文件目录结构

```
  - api                             api service层
    - modules                       api对应的接口模块
      - user.js
    - index.js                      api实例扩展
  - common                          通用资源
    - context                       vue上下文，这里的资源会绑定到vue原型，允许你以this.$的形式访问。
    - filter                        vue filter
    - directive                     vue directive
    - plugins                       vue plugin
    - utils                         vgg.utils工具库
  - commponents                     全局组件
    - index.js
  - config                          配置
    - config.default.js
    - config.local.js
    - config.stage.js
    - config.prod.js
    - plugin.json                   插件配置
  - plugins                         插件约定存放文件夹
    - plugin_a
  - router                          路由
    - router.js                     router实例扩展
    - routes.js                     路由注册
  - store                           vuex store
    - modules                       store对应命名空间的模块
      - user.js
    - index.js                      vuex实例扩展
  - views                           单页面应用视图层
    - home.vue
    - app.template.html             服务端渲染基础html
    - app.vue                       根组件
  - pages                           多页面应用视图层
    - page_a.vue
  - app.js                          根实例扩展
```

从目录结构我们可以看出，框架分为如下几个重要的部分：

- 配置（config）
- 通用vue资源（common和commponents）
- store
- api服务层
- 路由系统
- 插件系统


## 2. 环境与配置

根据当前的环境读取对于的配置，运行环境配置参考[eggjs运行环境](https://eggjs.org/zh-cn/basics/env.html)。

配置上的约定也跟eggjs一致，即config.default.js为默认配置，环境配置覆盖默认配置，覆盖采用
`_.defaultsDeep`方式。

通过vgg.env获取当前环境，vgg.config获取当前配置。

```js
  // config/config.default.js
  export default {
    auth: {
      enabled: false,
      mod: 'sso'
    }
  }

  // config/config.local.js
  export default {
    auth: {
      enabled: true
    }
  }

  // 当在本地开发环境（local）时
  vgg.config.auth.enabled === true;
  vgg.config.auth.mod === 'sso';
```


## 3. 通用vue资源

框架支持几种vue资源全局性的注入，分别是：

- 组件（componetns）
- 上下文（common/context）
- vue的过滤器、指令、插件
- 工具类库(utils)

只要按照约定，框架会自动注入你配置的资源。

### 3.1 组件（components）

在`components/index.js`中声明组件，key为组件名称，value为需要引入的组件。

```js
  // components
  import MyApp from './app.vue';
  export default {
    MyHeader: () => import('./header.vue'),
    MyApp
  }

  // 也可以使用辅助函数来自动添加前缀。
  let components = vgg.utils.prefix('My', {
    Header: () => import('./header.vue'),
    App: () => import('./app.vue')
  });
  export default components;
```

### 3.2 上下文（common/context）

在`common/context/index.js`中声明上下文，key为上下文名称，value为上下文创建函数。

```js
  // common/context/index.js
  import axios from 'axios';
  export default {
    /**
     * 创建一个axios实例，并注入上下文。
     * @param  {[type]} appContext koa app context，是服务端返回的上下文。
     * @param  {[type]} context    注入好的上下文。
     * @return {[type]}            上下文对应的内容。
     */
    http: (appContext, context) => {
      return axios.create();
    }
  }
```

注入好之后，你能在其他appContext中使用，例如appContext.http，或则在组件中以this.$http来
访问。

框架内置的上下文有：cookies, http, logger。

### 3.3 vue的过滤器、指令、插件

分别对应这些文件夹：`common/filter、common/directive、common/plugin`。

这3类资源跟context的声明方式类似，在各自文件夹下的`index.js`中声明，key为资源名称，value为
创建方法，最终都会交给Vue来进行全局性的注入：

```js
  // 对于filter
  Vue.filter(key, filters[key]);
  // 对于directive
  Vue.directive(key, directives[key]);
  // 对于plugin
  Vue.use(plugins[key]);
```

### 3.4 工具类库（common/utils）

全局性的工具类库，注入到vgg.utils中。

```js
  // 在`common/utils/index.js`中进行注入对应的方法。
  export default {
    now(){return new Date()}
  }

  // 其他地方使用
  import vgg from 'vgg';
  vgg.utils.now();
```

## 4. store

store是vuex的实现，[文章和架构参考](https://vuex.vuejs.org/zh-cn/structure.html)。

### 4.1 创建store module

在文件夹`store/modules`中创建模块，创建之后，即可使用`store.register`对模块进行注册，文件
命名采用`snake_case`规则。

```js
  // 创建store模块
  // store/modules/my_book.js
  export default (namespace, appContext) => {
    return {
      namespaced: !!namespace,
      state(){
        return {}
      },
      // getters,
      // mutations,
      // actions
    }
  }
```

### 4.2 使用store module

要使用模块，先要使用`store.register()`进行模块注册。注册的本质是获取对应的store模块，调用
`store.registerModule()`注册到对应的命名空间中。

```js
  // 某某组件：my_component.vue
  export default {
    async asyncData({store}){
      // 注册模块到指定命名空间上
      // store.register(namespace, modulepath, ...args)
      // 向命名空间example/some添加模块example/some
      store.register('example/some', 'example/some');
      // 该语句有个简写
      store.register('example/some');
    },
    created(){
      this.$store.register('example/some')
    },
    methods: {
      ...mapState('example/some', ['some'])
    }
  }
```

其他一些api，参考[create_store.js](./src/core/create_store.js)。

- store.register(namespace[, modulepath[, ...args]])
- store.unregister(namespace)
- store.isRegistered(namespace)
- store.once(type, namespace, name[, ...args])
- store.ensure(type, namespace, name)
- store.has(type, namespace, name)
- store.try(type, namespace, name, ...args)

``注意点``

1. 如果模块需要在组件beforeCreate生命周期(包含beforeCreate)前使用，那么这个模块需要在路由
组件的asyncData中注入。[参考服务器端数据预取](https://ssr.vuejs.org/zh/data.html)
2. 保留命名空间'route'。[参考vue-router-sync](https://github.com/vuejs/vuex-router-sync)

## 5. api服务层

类似于service层，用于跟后端进行数据交互。

### 5.1 api的创建

api在文件夹`api/modules`中创建，创建后可在组件、store中使用，文件名采用`snake_case`规范。

```js
  // 创建api book。
  // 文件：api/modules/book.js
  // 整个模块的默认格式为如下，其函数返回内容即为这个api的可使用接口。
  export default (http, api, logger) => {
    return {
      async getList(){
        return http( /* ...do some http request */)
      },
      async getDetail(){
        return http( /* ...do some http request */)
      }
    }
  }
```

### 5.2 api的使用

在`store`中，api被注入到上下文appContext中。

```js
  export default (namespace, appContext) => {
    const {api} = appContext;
    return {
      // ....
      // 某某store
      actions: {
        async init(){
          let data = await api('book').getList();
        }
      }
    }
  }
```

在组件中可通过`$api`这个对象访问：

```js
  // 某某组件中
  export default {
    methods: {
      async init(){
        let data = await this.$api('book').getList();
      }
    },
    // 但在asyncData方法中，因为组件还没有实例化，所以通过参数进行注入了。
    async asyncData({api}){
      let data = await api('book').getList();
    }
  }
```


## 6. 路由

路由是基于[vue-router](https://router.vuejs.org/zh-cn/)实现的，在`router/routes.js`
中添加路由，配置同`vue-router`。

在config的router属性中配置路由初始化属性，配置项[参考](https://router.vuejs.org/zh/api/#router-%E6%9E%84%E5%BB%BA%E9%80%89%E9%A1%B9)

通过hook系统可扩展router实例本身：

- hook router.alter
- hook router.onError
- hook router.beforeEach
- hook router.afterEach


## 7. 插件

框架通过插件来扩展自身，可以扩展框架的所有内容。

### 7.1 使用插件

在文件夹`config/plugin.js`中来声明要使用的插件。

```js
  // config/plugin.js
  export default {
    // 命名空间。(插件的命名空间，使用的时候，因为技术限制，不能自定义命名空间。命名空间是由插件作者指定好的。)
    pluginA: {
      // 对应插件的包名称或相对地址。例如'./plugin/plugin_a'
      package: 'plugin-a',
      // 默认注入组件。关闭之后需要手动注入，这样有助于减少打包体积。
      components: true,
      // 默认注入路由。关闭之后需要手动注入，这样有助于减少打包体积。
      routes: true
    },
    // 当components和routes都是需要注入时，配置可以简写：
    // pluginA: 'plugin-a'
  }
```

引入其他插件的资源：`import('$pluginA/foo/bar')`。这样就是找根目录是插件`pluginA`，文件
相对地址是`./foo/bar`的模块。

使用插件的api和store:

```js
  // api
  this.$api('myapi', 'pluginA');
  // store
  this.$store.register('pluginA/user', '$pluginA/user');
  // 等同于
  this.$store.register('$pluginA/user');
```

### 7.2 创建插件

@todo





