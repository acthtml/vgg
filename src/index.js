/**
 * vgg
 */
import plugin from './core/plugin';

const vgg = {};
vgg.env = typeof WEBPACK_ENV == 'undefined' ? 'local' : WEBPACK_ENV;
vgg.entryType = WEBPACK_ENTRY_TYPE;
vgg.plugin = plugin;
export default vgg;
