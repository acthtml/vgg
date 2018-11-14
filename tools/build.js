#!/usr/bin/env node

/**
 * @fileOverview 构建静态文件
 */
const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');
const vggTool = require('vgg/tools/plugin');
const WebpackTool = require('webpack-tool');
const webpackConfig = require('./webpack_config');
const env = process.env.EGG_SERVER_ENV || 'local';

async function build(config){
  const webpackTool = new WebpackTool({
    view: false,
    isServerBuild: false
  });

  // @todo 检测错误
  // @todo 显示
  return new Promise((res, rej) => {
    webpackTool.build(config, (compiler, compilation) => {
      res();
    })
  })
}

async function run(){
  console.log('构建环境为:', env);
  // 1. clean
  await fs.emptyDir(path.join(process.cwd(), 'public', 'static'));
  // @todo clean the folders: /public/static and /app/view/

  // 2. runtime.
  vggTool.run(false, env);

  // 3. build.
  let webpackConfigList;
  let config = {};
  try{
    config = require(path.join(process.cwd(), `/config/config.${env}`));
  }catch(e){
    console.warn('没有指定当前环境的配置，所以采用默认配置。')
  }
  webpackConfigList = _.get(config, 'webpack.webpackConfigList', null);
  if(!webpackConfigList){
    webpackConfigList = [
      webpackConfig('client', env),
      webpackConfig('server', env)
    ];
  }
  await builder(webpackConfigList);
}

run().catch(e => {
  if(_.isError(e)) e.name = '构建出错:' + e.name;
  throw e;
});

