/**
 * 加载通用资源(加载common文件夹下的directive, filter, plugins, utils模块。)
 *
 * - directive, filter, plugins 在模块文件中直接注入Vue即可。
 * - utils会合并，最后注入到vgg.utils中。
 *
 * @module core/load_common
 */
import Vue from 'vue';
import plugin from './plugin';
import vgg from '../index';

export default (context) => {
  // directive
  plugin.assign('common/directive');
  // filter
  plugin.assign('common/filter');
  // plugin
  plugin.assign('common/plugins');
  // utils
  let utils = plugin.assign('common/utils');
  vgg.utils = utils;
}
