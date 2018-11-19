/**
 * 关于日期、时间的处理帮助函数
 * @module utils/datetime
 */
export default {
  /**
   * 周几
   * @param  {String|Number|Date} time 时间：'2017-09-03',时间戳，时间对象
   * @param  {Boolean} exact 设置false则会适时显示：今天、明天、后天，默认为不显示。
   * @return {String}      转换成周几或今天、明天、后天。
   */
  day(time, exact = true, desc = true, hasYesterday = false){
    let day = this.getDate(time),
      days = ['日', '一', '二', '三', '四', '五', '六'];

    if(!exact){
      let diffDays = this.diff(new Date(), time);

      if (diffDays == -1 && hasYesterday) {
        return '昨天';
      }
      if(diffDays == 0){
        return '今天';
      }else if(diffDays == 1){
        return '明天';
      }else if(diffDays == 2){
        return '后天';
      }
    }

    if (desc) {
      return `周${days[day.getDay()]}`;
    }else {
      return `星期${days[day.getDay()]}`;
    }
  },

  /**
   * 格式化日期。
   * @param  {String|Number|Date} time  时间：'2017-09-03',时间戳，时间对象
   * @param  {格式} pattern
   *         - YYYY 年：2008
   *         - YY 年：08
   *         - MM 月：01
   *         - M 月: 1
   *         - DD 日: 02
   *         - D 日：2
   *         - hh 时：01
   *         - h 时：1
   *         - mm 分：01
   *         - m 分：1
   *         - ss 秒：01
   *         - s 秒：1
   * @return {String}         格式化后的时间字符串。
   */
  format(time, pattern = 'YYYY-MM-DD') {
    let date = this.getDate(time);
    const o = {
      "Y+": date.getFullYear(), //年份
      "M+": date.getMonth() + 1, //月份
      "D+": date.getDate(), //日
      "h+": date.getHours(), //小时
      "m+": date.getMinutes(), //分
      "s+": date.getSeconds(), //秒
    };
    for (let k in o) {
      if (new RegExp("(" + k + ")").test(pattern)) {
        if (k == "Y+") {
          pattern = pattern.replace(RegExp.$1, ("" + o[k]).substr(4 - RegExp.$1.length));
        }
        else {
          pattern = pattern.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
      }
    }
    return pattern;
  },
  /**
   * 差几天
   * @param  {[type]} start [description]
   * @param  {[type]} end   [description]
   * @return {[type]}       [description]
   */
  diff(start, end, isExact = false){
    start = this.getDate(start).getTime();
    end = this.getDate(end).getTime();

    let days = (end - start) / (24 * 60 * 60 * 1000);
    if(!isExact){
      if(days >= 0){
        days = Math.ceil(days)
      }else{
        days = Math.floor(days);
      }
      // 修复同天不同时的情况。
      if((days == 1 || days == -1) && new Date(start).getDate() == new Date(end).getDate()){
        days = 0;
      }
    }else{
      // do nothing
    }
    return days;
  },

  /**
   * 获取日期对象，应对`2017-11-07`Safari不兼容的情况。
   * @param  {[type]} time [description]
   * @return {[type]}      [description]
   */
  getDate(time = new Date()){
    if(time == '') return new Date();
    if(typeof time == 'string'){
      time = time.replace(/\-/ig, '/');
    }
    return new Date(time);
  },

  /**
   * 根据时间对象或时间字符串，获取时间戳
   * @param  {String|Date} date 时间字符串或时间对象
   * @return {Number}      时间戳
   */
  getTime(date = new Date()){
    return this.getDate(date).getTime();
  },

  /**
   * 开始时间是否小于结束时间
   * @param  {String}  start 开始时间
   * @param  {String}  end   结束时间
   * @return {Boolean}       开始时间是否小于结束时间
   */
  isEarly(start, end){
    return this.getTime(start) < this.getTime(end);
  }
}


function getTwoNumber(n){
  if(n >= 10){
    return n;
  }else{
    return '0' + n;
  }
}

