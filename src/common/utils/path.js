export default {
  isAbsolute(path){
    return !this.isRelative(path);
  },
  isRelative(path){
    return path.indexOf('http:') < 0 && path.indexOf('https:') < 0 && path.indexOf('//') < 0
  }
}
