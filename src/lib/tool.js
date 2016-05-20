/**
 * Utility Functions
 *
 * @author WechatFE
 */

/**
 * get formatted date by timestamp
 * @param  int    time
 * @return  object
 */
export function getDate(time) {
  var d = time>0 ? new Date(time) : new Date();
  var day = d.getDay()<10 ? '0'+d.getDay() : d.getDay(),
    month = d.getMonth()<9 ? '0'+(d.getMonth()+1) : (d.getMonth()+1),
    year = d.getFullYear(),
    hour = d.getHours()<10 ? '0'+d.getHours() : d.getHours(),
    minute = d.getMinutes()<10 ? '0'+d.getMinutes() : d.getMinutes(),
    second = d.getSeconds()<10 ? '0'+d.getSeconds() : d.getSeconds(),
    millisecond = d.getMilliseconds()<10 ? '0'+d.getMilliseconds() : d.getMilliseconds();
  if (millisecond<100) { millisecond = '0' + millisecond; }
  return {
    time: (+d),
    year: year,
    month: month,
    day: day,
    hour: hour,
    minute: minute,
    second: second,
    millisecond: millisecond
  };
}

/**
 * determines whether the passed value is a specific type
 * @param mixed value
 * @return boolean
 */
export function isNumber(value) {
  return Object.prototype.toString.call(value) == '[object Number]';
}
export function isString(value) {
  return Object.prototype.toString.call(value) == '[object String]';
}
export function isArray(value) {
  return Object.prototype.toString.call(value) == '[object Array]';
}
export function isObject(value) {
  return Object.prototype.toString.call(value) == '[object Object]';
}
export function isFunction(value) {
  return Object.prototype.toString.call(value) == '[object Function]';
}

/**
 * HTML encode a string
 * @param string text
 * @return string
 */
export function htmlEncode(text) {
  return document.createElement('a').appendChild( document.createTextNode(text) ).parentNode.innerHTML;
}

/**
 * localStorage methods
 */
export function setStorage(key, value) {
  key = 'vConsole_' + key;
  localStorage.setItem(key, value);
}
export function getStorage(key) {
  key = 'vConsole_' + key;
  return localStorage.getItem(key);
}
