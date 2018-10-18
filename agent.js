module.exports = agent => {
  if(agent.config.vgg && agent.config.vgg.enabled){
    const runtimeBuilder = require('vgg/tools/plugin');
    runtimeBuilder.run(agent.config.vgg.watch);
  }
}
