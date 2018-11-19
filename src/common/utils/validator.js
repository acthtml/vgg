/**
 * 验证
 *
 * @todo 将原来的utils/valid模块重构，新的验证都支持两种类型的api:
 *       - assertFooBar() 如果不合法则抛出错误
 *       - isFooBar() 返回true/false
 *
 * @module utils/validator
 */
import _ from 'lodash';
import datetime from './datetime';

// 姓名敏感词
const sensitiveList = ['test', '法轮功', '发轮功', '张三', '李四', '王五', 'SB', '逼', '傻逼', '傻冒', '王八', '王八蛋', '混蛋', '你妈', '你大爷', '操你妈', '你妈逼', '先生', '小姐', '男士', '女士', '夫人', '小沈阳', '丫蛋', '男人', '女人', '骚', '騒', '搔', '傻', '逼', '叉', '瞎', '屄', '屁', '性', '骂', '疯', '臭', '贱', '溅', '猪', '狗', '屎', '粪', '尿', '死', '肏', '骗', '偷', '嫖', '淫', '呆', '蠢', '虐', '疟', '妖', '腚', '蛆', '鳖', '禽', '兽', '屁股', '畸形', '饭桶', '脏话', '可恶', '吭叽', '小怂', '杂种', '娘养', '祖宗', '畜生', '姐卖', '找抽', '卧槽', '携程', '无赖', '废话', '废物', '侮辱', '精虫', '龟头', '残疾', '晕菜', '捣乱', '三八', '破鞋', '崽子', '混蛋', '弱智', '神经', '神精', '妓女', '妓男', '沙比', '恶性', '恶心', '恶意', '恶劣', '笨蛋', '他丫', '她丫', '它丫', '丫的', '给丫', '删丫', '山丫', '扇丫', '栅丫', '抽丫', '丑丫', '手机', '查询', '妈的', '犯人', '垃圾', '死鱼', '智障', '浑蛋', '胆小', '糙蛋', '操蛋', '肛门', '是鸡', '无赖', '赖皮', '磨几', '沙比', '智障', '犯愣', '色狼', '娘们', '疯子', '流氓', '色情', '三陪', '陪聊', '烤鸡', '下流', '骗子', '真贫', '捣乱', '磨牙', '磨积', '甭理', '尸体', '下流', '机巴', '鸡巴', '鸡吧', '机吧', '找日', '婆娘', '娘腔', '恐怖', '穷鬼', '捣乱', '破驴', '破罗', '妈必', '事妈', '神经', '脑积水', '事儿妈', '草泥马', '杀了铅笔', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J8', 's.b', 'sb', 'sbbt', 'Sb', 'Sb', 'sb', 'bt', 'bt', 'sb', 'saorao', 'SAORAO', 'fuck', 'shit', '0', '*', '.', ':', ';', '-', '_', '－', '<', '>', '”', '’', '&', '\\', '：', '='];

// 发票抬头
const invoiceList = ['个人', '公司', '客户', '先生', '女士', '单位', '国际旅行社有限公司', '抬头', '小姐', '旅游', 'tclvyou', 'tcgoulv', 'taitou', 'kehu', 'xiaojie', 'nvshi', 'xiansheng', 'danwei', 'gongsi', 'geren'];


export default {
  /**
   * 是否是用户名
   * @param  {[type]}  str [description]
   * @return {Boolean}     [description]
   */
  assertName(str, isChina){
    let errorMsg;

    if (!str) {
      errorMsg = '请填写姓名';
    } else if (str.length < 2) {
      errorMsg = '姓名必须至少两个字';
    }
    if (!errorMsg && !/^[a-zA-Z]+$/.test(str) && !/^[\u4e00-\u9fa5]+$/.test(str)) {
      errorMsg = '请输入正确的姓名，支持全部中文或全部拼音以及英文';
    }
    if (!errorMsg && isInSensitiveList(str)) {
      errorMsg = `请输入正确的姓名，请勿使用敏感字符：${isInSensitiveList(str)}`;
    }
    if(errorMsg){
      throw new Error(errorMsg);
    }
  },
  /**
   * 是否是合法的用户名
   */
  isName(str, isChina){
    try{
      this.assertName(str, isChina);
      return true;
    }catch(e){
      return false;
    }
  },
  /**
   * 检测手机号
   * @param  {[type]} phone [description]
   * @param  {[type]} type  [description]
   * @return {[type]}       [description]
   */
  assertPhone(phone, zone){
    let errorMsg = '';
    let regex = /^1[0-9]{10}$|86[0-9]{11}$/;
    var regexHKAM = /^[0-9]{8}$/;
    var regexTW = /^[0-9]{9}$/;

    if(!phone){
      errorMsg = '请输入联系电话';
    }else if((zone == '86' || !zone) && !regex.test(phone)){
      errorMsg = '请输入11位中国大陆手机号';
    }else if(zone == '852' && !regexHKAM.test(phone)){
      errorMsg = '请输入8位中国香港手机号';
    }else if(zone == '853' && !regexHKAM.test(phone)){
      errorMsg = '请输入8位中国澳门手机号';
    }else if(zone == '886' && !regexTW.test(phone)){
      errorMsg = '请输入9位中国台湾手机号';
    }

    if(errorMsg){
      throw new Error(errorMsg);
    }
  },
  /**
   * 是否是合法的手机
   * @param  {[type]}  phone [description]
   * @param  {[type]}  type  [description]
   * @return {Boolean}       [description]
   */
  isPhone(phone, type){
    try{
      this.assertPhone(phone, type);
      return true;
    }catch(e){
      return false;
    }
  },
  /**
   * 判断是否是合法的入离日期。
   * - 入住日期必须大于当前日期
   * - 离店日期必须大于入住日期
   * - @todo 最大日期跨度不允许超过90天
   * @param  {[type]} checkInDate  [description]
   * @param  {[type]} checkOutDate [description]
   * @return {[type]}           [description]
   */
  assertDates(checkInDate, checkOutDate){
    // 检测有效性
    let errorMsg;
    let rDate = /^((((1[6-9]|[2-9]\d)\d{2})-(0?[13578]|1[02])-(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})-(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29-))$/
    let checkInDateDiff = new Date().getHours() < 6 ? -1.25 : 0;
    if (typeof checkInDate != 'string' || typeof checkOutDate != 'string') {
      errorMsg = '时间格式不正确';
    } else if (!rDate.test(checkInDate) || !rDate.test(checkOutDate)) {
      errorMsg = '时间格式不正确';
    } else if ((datetime.diff(new Date(), checkInDate, checkInDateDiff < 0) < checkInDateDiff || datetime.diff(checkInDate, checkOutDate) <= 0)) {
      errorMsg = '时间不合法';
    }
    if(errorMsg){
      throw new Error(errorMsg);
    }
  },
  isDates(checkInDate, checkOutDate){
    try{
      this.assertDates(checkInDate, checkOutDate);
      return true;
    }catch(e){
      return false;
    }
  }
}

/**
 * 文本中是否带有敏感词
 * @param  {String}  str 匹配文字
 * @return {Boolean}     含有敏感词则返回true。
 */
function isInSensitiveList(str) {
  for (let i = 0; i < sensitiveList.length; i++) {
    if (str.indexOf(sensitiveList[i]) > -1) return sensitiveList[i];
  }
  return false;
}
