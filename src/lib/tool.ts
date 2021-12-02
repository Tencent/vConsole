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
 */
export function getDate(time: number) {
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
 * @param any value
 * @return boolean
 */
export function isNumber(value) {
  return Object.prototype.toString.call(value) == '[object Number]';
}
export function isBigInt(value) {
  return Object.prototype.toString.call(value) == '[object BigInt]';
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
      !isBigInt(value) &&
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
 * Get the prototype name of an object
 */
export function getPrototypeName(value) {
  return <string>Object.prototype.toString.call(value).replace(/\[object (.*)\]/, '$1');
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
  return key === undefined || <boolean>hasOwn.call(obj, key);
}


const _htmlEncodePatterns = /[<>&" ]/g;
const _htmlEncodeReplacer = (c: string) => {
  return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', ' ': '&nbsp;' }[c];
};
/**
 * Escape HTML to XSS-safe text.
 */
export function htmlEncode(text: string | number) {
  // return document.createElement('a').appendChild( document.createTextNode(text) ).parentNode.innerHTML;
  if (typeof text !== 'string' && typeof text !== 'number') { return text; }
  return String(text).replace(_htmlEncodePatterns, _htmlEncodeReplacer);
}


const _visibleTextPatterns = /[\n\t]/g;
const _visibleTextReplacer = (c: string) => {
  return { '\n': '\\n', '\t': '\\t' }[c];
};
/**
 * Convert a text's invisible characters to visible characters.
 */
export function getVisibleText(text: string) {
  if (typeof text !== 'string') { return text; }
  return String(text).replace(_visibleTextPatterns, _visibleTextReplacer);
}


/**
 * A safe `JSON.stringify` method. 
 */
export function safeJSONStringify(stringObject, maxLevel = -1, curLevel = 0) {
  if (!isObject(stringObject) && !isArray(stringObject)) {
    return JSONStringify(stringObject);
  }

  let prefix = '{', suffix = '}';
  if (isArray(stringObject)) {
    prefix = '[';
    suffix = ']'
  }
  let str = prefix;
  const keys = getEnumerableKeys(stringObject);
  for (let i = 0; i < keys.length; i ++) {
    try {
      const key = keys[i];
      const value = stringObject[key];

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
        if (maxLevel > -1 && curLevel >= maxLevel) {
          str += 'Array(' + value.length + ')';
        } else {
          str += safeJSONStringify(value, maxLevel, curLevel + 1);
        }
      } else if (isObject(value)) {
        if (maxLevel > -1 && curLevel >= maxLevel) {
          // str += Object.prototype.toString.call(value);
          str += (value.constructor?.name || 'Object') + ' {}';
        } else {
          str += safeJSONStringify(value, maxLevel, curLevel + 1);
        }
      } else if (isString(value)) {
        str += '"' + getVisibleText(value) + '"';
      } else if (isSymbol(value)) {
        str += String(value).replace(/^Symbol\((.*)\)$/i, 'Symbol("$1")');
      } else if (isFunction(value)) {
        str += (value.name || 'function') + '()';
      } else if (isBigInt(value)) {
        str += String(value) + 'n';
      } else {
        // str += JSONStringify(value);
        str += String(value);
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
 * Call original `JSON.stringify` and catch unknown exceptions.
 */
export function JSONStringify(value: any, replacer?: (this: any, key: string, value: any) => any, space?: string | number) {
  let stringifyResult: string;
  try {
    stringifyResult = JSON.stringify(value, replacer, space);
  } catch (err) {
    stringifyResult = getPrototypeName(value);
  }
  return stringifyResult;
}

export function getStringBytes(str: string) {
  try {
    return encodeURI(str).split(/%(?:u[0-9A-F]{2})?[0-9A-F]{2}|./).length - 1;
  } catch (e) {
    return 0;
  }
}

export function getBytesText(bytes: number) {
  if (bytes <= 0) {
    return '';
  }
  if (bytes >= 1024 * 1024) {
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }
  if (bytes >= 1024 * 1) {
    return (bytes / 1024).toFixed(1) + ' KB';
  }
  return bytes + ' B';
}

export function subString(str: string, len: number) {    
  const r = /[^\x00-\xff]/g; 
  let m: number;  

  if (str.replace(r, '**').length > len) {
    m = Math.floor(len / 2);  

    for (let i = m, l = str.length; i < l; i++) {    
      const sub = str.substr(0, i);
      if (sub.replace(r, '**').length >= len) {    
        return sub; 
      }    
    } 
  }

  return str;
}

export function circularReplacer() {
  const seen = [];
  return (key, value) => {
    if (typeof(value) === 'object' && value !== null) {
      if (seen.indexOf(value) >= 0) {
        return '[Circular]';
      }
      seen.push(value);
    }
    return value;
  };
}

const _sortArrayCompareFn = <T extends string>(a: T, b: T) => {
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
};
/**
 * Sore an `string[]` by string.
 */
export function sortArray(arr: string[]) {
  return arr.sort(_sortArrayCompareFn);
}

/**
 * Get enumerable keys of an object or array.
 */
export function getEnumerableKeys(obj) {
  if (!isObject(obj) && !isArray(obj)) {
    return [];
  }
  return Object.keys(obj);
}


/**
 * Get enumerable and non-enumerable keys of an object or array.
 */
export function getEnumerableAndNonEnumerableKeys(obj) {
  if (!isObject(obj) && !isArray(obj)) {
    return [];
  }
  return Object.getOwnPropertyNames(obj);
}

/**
 * Get non-enumerable keys of an object or array.
 */
export function getNonEnumerableKeys(obj) {
  const enumKeys = getEnumerableKeys(obj);
  const enumAndNonEnumKeys = getEnumerableAndNonEnumerableKeys(obj);
  return enumAndNonEnumKeys.filter((key) => {
    const i = enumKeys.indexOf(key);
    return i === -1;
  });
}

export function getSymbolKeys(obj) {
  if (!isObject(obj) && !isArray(obj)) {
    return [];
  }
  return Object.getOwnPropertySymbols(obj);
}

/**
 * Get an object's constructor|prototype name.
 */
export function getObjName(obj) {
  const constructorName = obj?.constructor?.name;
  return constructorName || <string>Object.prototype.toString.call(obj).replace('[object ', '').replace(']', '');
}

/**
 * localStorage methods
 */
export function setStorage(key: string, value: string) {
  if (!window.localStorage) {
    return;
  }
  key = 'vConsole_' + key;
  localStorage.setItem(key, value);
}
export function getStorage(key: string) {
  if (!window.localStorage) {
    return;
  }
  key = 'vConsole_' + key;
  return localStorage.getItem(key);
}


/**
 * Generate a 6-digit unique string with prefix `"__vc_" + ${prefix}`
 */
export function getUniqueID(prefix: string = '') {
  return '__vc_' + prefix + Math.random().toString(36).substring(2, 8);
}
