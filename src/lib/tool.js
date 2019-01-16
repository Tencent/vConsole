/*
Tencent is pleased to support the open source community by making vConsole available.

Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.

Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://opensource.org/licenses/MIT

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * Utility Functions
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
  return value === undefined;
}
export function isNull(value) {
  return value === null;
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
export function isWindow(value) {
  var toString = Object.prototype.toString.call(value);
  return toString == '[object global]' || toString == '[object Window]' || toString == '[object DOMWindow]';
}

/**
 * check whether an object is plain (using {})
 * @param object obj
 * @return boolean
 */
export function isPlainObject(obj) {
  let hasOwn = Object.prototype.hasOwnProperty;
  // Must be an Object.
  if (!obj || typeof obj !== 'object' || obj.nodeType || isWindow(obj)) {
    return false;
  }
  try {
    if (obj.constructor && !hasOwn.call(obj, 'constructor') && !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
      return false;
    }
  } catch (e) {
    return false;
  }
  let key;
  for (key in obj) {}
  return key === undefined || hasOwn.call(obj, key);
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
 * Simple JSON stringify, stringify top level key-value
 */
export function JSONStringify(stringObject) {
  if (!isObject(stringObject) && !isArray(stringObject)) {
    return JSON.stringify(stringObject);
  }

  let prefix = '{', suffix = '}';
  if (isArray(stringObject)) {
    prefix = '[';
    suffix = ']'
  }
  let str = prefix;
  const keys = getObjAllKeys(stringObject);
  for (let i = 0; i < keys.length; i ++) {
    const key = keys[i];
    const value = stringObject[key];
    try {
      // key
      if (!isArray(stringObject)) {
        if (isObject(key) || isArray(key) || isSymbol(key)) {
          str += Object.prototype.toString.call(key);
        } else {
          str += key;
        }
        str += ': ';
      }

      // value
      if (isArray(value)) {
        str += 'Array[' + value.length + ']';
      } else if (isObject(value) || isSymbol(value) || isFunction(value)) {
        str += Object.prototype.toString.call(value);
      } else {
        str += JSON.stringify(value);
      }
      if (i < keys.length - 1) {
        str += ', ';
      }
    } catch (e) {
      continue;
    }
  }
  str += suffix;
  return str;
}

/**
 * get an object's all keys ignore whether they are not enumerable
 */
export function getObjAllKeys(obj) {
  if (!isObject(obj) && !isArray(obj)) {
    return [];
  }
  if (isArray(obj)) {
    const m = [];
    obj.forEach((_, index) => {
      m.push(index)
    });
    return m;
  }
  return Object.getOwnPropertyNames(obj).sort();
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
