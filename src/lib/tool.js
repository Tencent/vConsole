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
  let day = d.getDate()<10 ? '0'+d.getDate() : d.getDate(),
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
  return (
    Object.prototype.toString.call(value) == '[object Object]'
    ||
    // if it isn't a primitive value, then it is a common object
    (
      !isNumber(value) &&
      !isString(value) &&
      !isBoolean(value) &&
      !isArray(value) &&
      !isNull(value) &&
      !isFunction(value) &&
      !isUndefined(value) &&
      !isSymbol(value)
    )
  );
}
export function isFunction(value) {
  return Object.prototype.toString.call(value) == '[object Function]';
}
export function isElement(value) {
  return (
    typeof HTMLElement === 'object' ? value instanceof HTMLElement : //DOM2
      value && typeof value === "object" && value !== null && value.nodeType === 1 && typeof value.nodeName==="string"
  );
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

  // use a map to track parent relationship
  let objMap = [];
  function _hasSameParentAsChild(child) {
    // find upper item which child is equal to this child
    for (let i = objMap.length - 1; i >= 0; i--) {
      if (objMap[i].child == child) {
        return true;
      }
    }
    return false;
  }

  function _iterateObj(val) {
    if (isObject(val)) {
      // object
      if (_hasSameParentAsChild(val)) {
        // this object is circular, skip it
        json += "CircularObject";
        return;
      }
      objMap.push({parent: parent, child: val});

      let keys = Object.keys(val);
      json += "{";
      lv++;
      for (let i=0; i<keys.length; i++) {
        let k = keys[i];
        if (val.hasOwnProperty && !val.hasOwnProperty(k)) { continue; }
        json += k + ': ';
        _iterateObj(val[k], val);
        if (i < keys.length - 1) {
          json += ', ';
        }
      }
      lv--;
      json += '}';

      objMap.pop();
    } else if (isArray(val)) {
      // array
      if (_hasSameParentAsChild(val)) {
        // this array is circular, skip it
        json += "CircularArray";
        return;
      }
      objMap.push({parent: parent, child: val});

      json += '[';
      lv++;
      for (let i=0; i<val.length; i++) {
        _iterateObj(val[i], val);
        if (i < val.length - 1) {
          json += ', ';
        }
      }
      lv--;
      json += ']';

      objMap.pop();
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
  _iterateObj(obj, null);

  return json;
}

/**
 * get an object's all keys ignore whether they are not enumerable
 */
export function getObjAllKeys(obj) {
  if (!isObject(obj) && !isArray(obj)) {
    return [];
  }
  let dontEnums = [
    'toString',
    'toLocaleString',
    'valueOf',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'constructor'
  ];
  let keys = [];
  for (let key in obj) {
    if (dontEnums.indexOf(key) < 0) {
      keys.push(key);
    }
  }
  keys = keys.sort();
  return keys;
}

/**
 * get an object's prototype name
 */
export function getObjName(obj) {
  return Object.prototype.toString.call(obj).replace('[object ', '').replace(']', '');
}

/**
 * localStorage methods
 */
export function setStorage(key, value) {
  if (!window.localStorage) {
    return;
  }
  key = 'vConsole_' + key;
  localStorage.setItem(key, value);
}
export function getStorage(key) {
  if (!window.localStorage) {
    return;
  }
  key = 'vConsole_' + key;
  return localStorage.getItem(key);
}
