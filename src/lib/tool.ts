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
 * Determine whether a value is of a specific type.
 */
export function isNumber(value) {
  return Object.prototype.toString.call(value) === '[object Number]';
}
export function isBigInt(value) {
  return typeof value === 'bigint';
}
export function isString(value) {
  return typeof value === 'string';
}
export function isArray(value) {
  return Object.prototype.toString.call(value) === '[object Array]';
}
export function isBoolean(value) {
  return typeof value === 'boolean';
}
export function isUndefined(value) {
  return value === undefined;
}
export function isNull(value) {
  return value === null;
}
export function isSymbol(value) {
  return typeof value === 'symbol';
}
export function isObject(value) {
  return (
    Object.prototype.toString.call(value) === '[object Object]'
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
  return typeof value === 'function';
}
export function isElement(value) {
  return (
    typeof HTMLElement === 'object' ? value instanceof HTMLElement : //DOM2
      value && typeof value === 'object' && value !== null && value.nodeType === 1 && typeof value.nodeName === 'string'
  );
}
export function isWindow(value) {
  const name = Object.prototype.toString.call(value);
  return name === '[object Window]' || name === '[object DOMWindow]' || name === '[object global]';
}
export function isIterable(value) {
  if (
    value === null
    || value === undefined 
    || typeof value === 'string'
    || typeof value === 'boolean'
    || typeof value === 'number'
    || typeof value === 'function'
    || typeof value === 'symbol'
    || typeof value === 'bigint'
  ) { return false; }
  return typeof Symbol !== 'undefined' && typeof value[Symbol.iterator] === 'function';
}

/**
 * Get the prototype name of an object
 */
export function getPrototypeName(value) {
  return <string>Object.prototype.toString.call(value).replace(/\[object (.*)\]/, '$1');
}

const _getObjNamePattern = /(function|class) ([^ \{\()}]{1,})[\(| ]/;
/**
 * Get an object's constructor name.
 */
export function getObjName(obj) {
  // const constructorName = obj?.constructor?.name;
  // return constructorName || <string>Object.prototype.toString.call(obj).replace('[object ', '').replace(']', '');
  if (obj === null || obj === undefined) { return ''; }
  const results = _getObjNamePattern.exec(obj?.constructor?.toString() || '');
  return (results && results.length > 1) ? results[2] : '';
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


type ISafeJSONStringifyOption = {
  ret: string,
  maxDepth: number,
  keyMaxLen: number,
  pretty: boolean,
  standardJSON: boolean,
  circularFinder: (val: any) => any,
};
const _safeJSONStringifyCircularFinder = () => {
  const seen = new WeakSet();
  return (value: any) => {
    if (typeof(value) === 'object' && value !== null) {
      if (seen.has(value)) {
        return true;
      }
      seen.add(value);
    }
    return false;
  };
};
const _safeJSONStringifyFlatValue = (value: any, maxLen = 0) => {
  let str = '';
  if (isString(value)) {
    if (maxLen > 0) {
      value = getStringWithinLength(value, maxLen);
    }
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
  return str;
};
// use depth first traversal
const _safeJSONStringify = (obj, opt: ISafeJSONStringifyOption, _curDepth = 0) => {
  if (!isObject(obj) && !isArray(obj)) {
    opt.ret += _safeJSONStringifyFlatValue(obj, opt.keyMaxLen);
    return;
  }

  const isCircular = opt.circularFinder(obj);
  if (isCircular) {
    let circularText = '';
    if (isArray(obj)) {
      circularText = '(Circular Array)';
    } else if (isObject(obj)) {
      circularText = `(Circular ${obj.constructor?.name || 'Object'})`;
    }
    opt.ret += opt.standardJSON ? `"${circularText}"` : circularText;
    return;
  }

  let prettySpace = '', prettyWrap = '';
  if (opt.pretty) {
    for (let i = 0; i <= _curDepth; i++) {
      prettySpace += '  ';
    }
    prettyWrap = '\n';
  }

  let prefix = '{', suffix = '}';
  if (isArray(obj)) {
    prefix = '[';
    suffix = ']';
  }
  opt.ret += prefix + prettyWrap;

  const keys = getEnumerableKeys(obj);
  for (let i = 0; i < keys.length; i ++) {
    const key = keys[i];
    // (window as any)._console.log('for key:', key, _curDepth);
    opt.ret += prettySpace;

    // handle key
    try {
      if (!isArray(obj)) {
        if (isObject(key) || isArray(key) || isSymbol(key)) {
          opt.ret += Object.prototype.toString.call(key);
        } else if (isString(key) && opt.standardJSON) {
          opt.ret += '"' + key + '"';
        } else {
          opt.ret += key;
        }
        opt.ret += ': ';
      }
    } catch (e) {
      // cannot stringify `key`, skip this key-value pair
      continue;
    }

    // handle value
    try {
      const value = obj[key];
      if (isArray(value)) {
        if (opt.maxDepth > -1 && _curDepth >= opt.maxDepth) {
          opt.ret += 'Array(' + value.length + ')';
        } else {
          _safeJSONStringify(value, opt, _curDepth + 1);
        }
      } else if (isObject(value)) {
        if (opt.maxDepth > -1 && _curDepth >= opt.maxDepth) {
          // opt.ret += Object.prototype.toString.call(value);
          opt.ret += (value.constructor?.name || 'Object') + ' {}';
        } else {
          _safeJSONStringify(value, opt, _curDepth + 1);
        }
      } else {
        // opt.ret += JSONStringify(value);
        opt.ret += _safeJSONStringifyFlatValue(value, opt.keyMaxLen);
      }

    } catch (e) {
      // cannot stringify `value`, use a default text
      opt.ret += opt.standardJSON ? '"(PARSE_ERROR)"' : '(PARSE_ERROR)';
    }

    if (opt.keyMaxLen > 0 && opt.ret.length >= opt.keyMaxLen * 10) {
      opt.ret += ', (...)';
      break;
    }
    if (i < keys.length - 1) {
      opt.ret += ', ';
    }
    opt.ret += prettyWrap;
  }
  opt.ret += prettySpace.substring(0, prettySpace.length - 2) + suffix;
};
/**
 * A safe `JSON.stringify` method. 
 */
export function safeJSONStringify(obj, opt: {
  maxDepth?: number,
  keyMaxLen?: number,
  pretty?: boolean,
  standardJSON?: boolean,
} = {
  maxDepth: -1,
  keyMaxLen: -1,
  pretty: false,
  standardJSON: false,
}) {
  const option: ISafeJSONStringifyOption = Object.assign({
    ret: '',
    maxDepth: -1,
    keyMaxLen: -1,
    pretty: false,
    standardJSON: false,
    circularFinder: _safeJSONStringifyCircularFinder(),
  }, opt);
  _safeJSONStringify(obj, option);
  return option.ret;
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

/**
 * Get the bytes of a string.
 * @example 'a' = 1
 * @example '好' = 3
 */
export function getStringBytes(str: string) {
  try {
    return encodeURI(str).split(/%(?:u[0-9A-F]{2})?[0-9A-F]{2}|./).length - 1;
  } catch (e) {
    return 0;
  }
}

/**
 * Convert bytes number to 'MB' or 'KB' string.
 */
export function getBytesText(bytes: number) {
  if (bytes <= 0) {
    return '';
  }
  if (bytes >= 1000 * 1000) {
    return (bytes / 1000 / 1000).toFixed(1) + ' MB';
  }
  if (bytes >= 1000 * 1) {
    return (bytes / 1000).toFixed(1) + ' KB';
  }
  return bytes + ' B';
}

/**
 * Get a string within a limited max length.
 * The byte size of the string will be appended to the string when reached the limit.
 * @return 'some string...(3.1 MB)'
 */
export function getStringWithinLength(str: string, maxLen: number) {
  if (str.length > maxLen) {
    str = str.substring(0, maxLen) + `...(${getBytesText(getStringBytes(str))})`;
  }
  return str;
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

/**
 * Determine whether it is inside a WeChat Miniprogram.
 */
export function isWxEnv() {
  return typeof window !== 'undefined' && !!(<any>window).__wxConfig && !!(<any>window).wx && !!(<any>window).__virtualDOM__;
}

/**
 * Call a WeChat Miniprogram method. E.g: `wx.getStorageSync()`.
 */
export function callWx(method: string, ...args) {
  if (isWxEnv() && typeof (<any>window).wx[method] === 'function') {
    try {
      const ret = (<any>window).wx[method].call((<any>window).wx, ...args);
      return ret;
    } catch (e) {
      console.debug(`[vConsole] Fail to call wx.${method}():`, e);
      return undefined;
    }
  }
  return undefined;
}
