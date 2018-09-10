import plugin from './core/plugin';

let vgg = {};
vgg.env = 'local';
// vgg.env = WEBPACK_ENV;
vgg.entryType = WEBPACK_ENTRY_TYPE;
vgg.plugin = plugin;

export default vgg;
