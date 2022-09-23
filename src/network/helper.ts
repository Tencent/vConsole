import * as tool from '../lib/tool';
import type { VConsoleNetworkRequestItem } from './requestItem';

export type IOnUpdateCallback = (item: VConsoleNetworkRequestItem) => void;

/**
 * Generate `getData` by url. 
 */
export const genGetDataByUrl = (url: string, getData = {}) => {
  if (!tool.isObject(getData)) {
    getData = {};
  }
  let query: string[] = url ? url.split('?') : []; // a.php?b=c&d=?e => ['a.php', 'b=c&d=', 'e']
  query.shift(); // => ['b=c&d=', 'e']
  if (query.length > 0) {
    query = query.join('?').split('&'); // => 'b=c&d=?e' => ['b=c', 'd=?e']
    for (const q of query) {
      const kv = q.split('=');
      try {
        getData[ kv[0] ] = decodeURIComponent(kv[1]);
      } catch (e) {
        // "URIError: URI malformed" will be thrown when `kv[1]` contains "%", so just use raw data
        // @issue #470
        // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Malformed_URI
        getData[ kv[0] ] = kv[1];
      }
    }
  }
  return getData;
};

/**
 * Generate formatted response data by responseType.
 */
export const genResonseByResponseType = (responseType: string, response: any) => {
  let ret = '';
  switch (responseType) {
    case '':
    case 'text':
    case 'json':
      // try to parse JSON
      if (tool.isString(response)) {
        try {
          ret = JSON.parse(response);
          ret = tool.safeJSONStringify(ret, { maxDepth: 10, keyMaxLen: 10000, pretty: true, standardJSON: true });
        } catch (e) {
          // not a JSON string
          ret = tool.getStringWithinLength(String(response), 10000);
        }
      } else if (tool.isObject(response) || tool.isArray(response)) {
        ret = tool.safeJSONStringify(response, { maxDepth: 10, keyMaxLen: 10000, pretty: true, standardJSON: true });
      } else if (typeof response !== 'undefined') {
        ret = Object.prototype.toString.call(response);
      }
      break;

    case 'blob':
    case 'document':
    case 'arraybuffer':
    case 'formdata':
    default:
      if (typeof response !== 'undefined') {
        ret = Object.prototype.toString.call(response);
      }
      break;
  }
  return ret;
};

/**
 * Generate formatted response body by XMLHttpRequestBodyInit.
 */
export const genFormattedBody = (body?: BodyInit) => {
  if (!body) { return null; }
  let ret: string | { [key: string]: string } = null;

  if (typeof body === 'string') {
    try { // '{a:1}' => try to parse as json
      ret = JSON.parse(body);
    } catch (e) { // 'a=1&b=2' => try to parse as query
      const arr = body.split('&');
      if (arr.length === 1) { // not a query, parse as original string
        ret = body;
      } else { // 'a=1&b=2&c' => parse as query
        ret = {};
        for (let q of arr) {
          const kv = q.split('=');
          ret[ kv[0] ] = kv[1] === undefined ? 'undefined' : kv[1];
        }
      }
    }
  } else if (tool.isIterable(body)) {
    // FormData or URLSearchParams or Array
    ret = {};
    for (const [key, value] of <FormData | URLSearchParams>body) {
      ret[key] = typeof value === 'string' ? value : '[object Object]';
    }
  } else if (tool.isPlainObject(body)) {
    ret = <any>body;
  } else {
    const type = tool.getPrototypeName(body);
    ret = `[object ${type}]`;
  }
  return ret;
};

/**
 * Get formatted URL object by string.
 */
export const getURL = (urlString: string = '') => {
  if (urlString.startsWith('//')) {
    const baseUrl = new URL(window.location.href);
    urlString = `${baseUrl.protocol}${urlString}`;
  }
  if (urlString.startsWith('http')) {
    return new URL(urlString);
  } else {
    return new URL(urlString, window.location.href);
  }
};
