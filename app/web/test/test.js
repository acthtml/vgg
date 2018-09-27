/**
 * 测试
 */
import _ from 'lodash';
import expect from 'expect.js';
import vgg from '~/../../src/';


function describe(group, cb){
  console.group(group);
  try{
    cb();
  }catch(e){
    console.error(group, e);
  }
  console.groupEnd();
}

function it(part, cb){
  describe(part, cb);
}


export default () => {
  // test plugins
  describe('plugin', () => {
    it('plugin.list', () => {
      expect(vgg.plugin.list().join(',')).to.be('vgg,pluginA,pluginD,pluginB,~');
      expect(vgg.plugin.list(true).join(',')).to.be('~,pluginB,pluginD,pluginA,vgg');
    });

    it('plugin.getModule', () => {
      expect(_.isNull(vgg.plugin.getModule('some', 'pluginA'))).to.be.ok();
    });

    it('plugin.parseModulePath', () => {
      expect(vgg.plugin.parseModulePath('$myPlugin/foo/bar.ext')).to.eql({
        pluginName: 'myPlugin',
        filename: 'foo/bar.ext'
      })
    })
  })

  // config
  describe('config', () => {
    expect(vgg.config).to.eql({
      env: 'base',
      plugin: 'pluginA'
    })
  })
}
