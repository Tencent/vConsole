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
  let d = time>0 ? new Date(time) : new Date();
  let day = d.getDay()<10 ? '0'+d.getDay() : d.getDay(),
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
export function isBoolean(value) {
  return Object.prototype.toString.call(value) == '[object Boolean]';
}
export function isUndefined(value) {
  return Object.prototype.toString.call(value) == '[object Undefined]';
}
export function isNull(value) {
  return Object.prototype.toString.call(value) == '[object Null]';
}
export function isSymbol(value) {
  return Object.prototype.toString.call(value) == '[object Symbol]';
}
export function isObject(value) {
  let is = (
    Object.prototype.toString.call(value) == '[object Object]'
    ||
    (value !== null && typeof value == 'object')
  );
  return is;
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
 * JSON stringify, support circular structure
 */
export function JSONStringify(obj) {
  let json = '',
      lv = 0;

  // use a map to track whether a value has been iterated in previous level
  let objMap = [];
  function _isIteratedInPreLevel(val, curLV) {
    let is = false;
    for (let item of objMap) {
      if (item.obj == val && item.lv < curLV) {
        is = true;
        break;
      }
    }
    return is;
  }

  function _iterateObj(val) {
    if (isObject(val)) {
      // object
      if (_isIteratedInPreLevel(val, lv)) {
        // this object is circular, skip it
        json += "{Circular Object}";
        return;
      }
      objMap.push({obj: val, lv: lv});

      let keys = Object.keys(val);
      json += "{";
      lv++;
      for (let i=0; i<keys.length; i++) {
        let k = keys[i];
        if (!val.hasOwnProperty(k)) { continue; }
        json += k + ': ';
        _iterateObj(val[k]);
        if (i < keys.length - 1) {
          json += ', ';
        }
      }
      lv--;
      json += '}';
    } else if (isArray(val)) {
      // array
      json += '[';
      lv++;
      for (let i=0; i<val.length; i++) {
        _iterateObj(val[i]);
        if (i < val.length - 1) {
          json += ', ';
        }
      }
      lv--;
      json += ']';
    } else if (isString(val)) {
      json += '"'+val+'"';
    } else if (isNumber(val)) {
      json += val;
    } else if (isBoolean(val)) {
      json += val;
    } else if (isNull(val)) {
      json += 'null';
    } else if (isUndefined(val)) {
      json += 'undefined';
    } else if (isFunction(val)) {
      json += 'function()';
    } else if (isSymbol(val)) {
      json += 'symbol';
    } else {
      json += 'unknown';
    }
  }
  _iterateObj(obj);

  return json;
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
