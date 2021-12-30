import * as tool from '../lib/tool';

export type VConsoleRequestMethod = '' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';

export class VConsoleNetworkRequestItem {
  id: string                 = '';
  name?: string              = '';
  method: VConsoleRequestMethod = '';
  url: string                = '';
  status: number | string    = 0;
  statusText?: string        = '';
  readyState?: XMLHttpRequest['readyState'] = 0;
  header: { [key: string]: string } = null; // response header
  responseType: XMLHttpRequest['responseType'] = '';
  requestType: 'xhr' | 'fetch' | 'ping' | 'custom';
  requestHeader: HeadersInit = null;
  response: any;
  startTime: number         = 0;
  endTime: number           = 0;
  costTime?: number         = 0;
  getData: { [key: string]: string } = null;
  postData: { [key: string]: string } | string = null;
  actived: boolean          = false;

  constructor() {
    this.id = tool.getUniqueID();
  }
}

export class VConsoleNetworkRequestItemProxy extends VConsoleNetworkRequestItem {
  static Handler = {
    get(item: VConsoleNetworkRequestItemProxy, prop: string) {
      switch (prop) {
        case 'response':
          return item._response;
        default:
          return Reflect.get(item, prop);
      }
    },
    set(item: VConsoleNetworkRequestItemProxy, prop: string, value: any) {
      switch (prop) {
        case 'response':
          // NOTICE: Once the `response` is set, 
          //         modifying its internal properties will not take effect,
          //         unless a new `response` is re-assigned.
          item._response = RequestItemHelper.genResonseByResponseType(item.responseType, value);
          return true;
          
        case 'url':
          value = String(value);
          const name = value?.replace(new RegExp('[/]*$'), '').split('/').pop() || 'Unknown';
          Reflect.set(item, 'name', name);

          const getData = RequestItemHelper.genGetDataByUrl(value, item.getData);
          Reflect.set(item, 'getData', getData);
          break;
        case 'status':
          const statusText = String(value) || 'Unknown';
          Reflect.set(item, 'statusText', statusText);
          break;
        case 'startTime':
          if (value && item.endTime) {
            const costTime = item.endTime - value;
            Reflect.set(item, 'costTime', costTime);
          }
          break;
        case 'endTime':
          if (value && item.startTime) {
            const costTime = value - item.startTime;
            Reflect.set(item, 'costTime', costTime);
          }
          break;
        default:
          // do nothing
      }
      return Reflect.set(item, prop, value);
    }
  };

  protected _response?: any;

  constructor(item: VConsoleNetworkRequestItem) {
    super();
    return new Proxy(item, VConsoleNetworkRequestItemProxy.Handler);
  }
}

export const RequestItemHelper = {
  /**
   * Generate `getData` by url. 
   */
  genGetDataByUrl(url: string, getData = {}) {
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
  },

  /**
   * Generate formatted response data by responseType.
   */
  genResonseByResponseType(responseType: string, response) {
    let ret;
    switch (responseType) {
      case '':
      case 'text':
      case 'json':
        // try to parse JSON
        if (tool.isString(response)) {
          try {
            ret = JSON.parse(response);
            ret = tool.safeJSONStringify(ret, { maxDepth: 10, keyMaxLen: 500000, pretty: true });
          } catch (e) {
            // not a JSON string
            ret = response;
          }
        } else if (tool.isObject(response) || tool.isArray(response)) {
          ret = tool.safeJSONStringify(response, { maxDepth: 10, keyMaxLen: 500000, pretty: true });
        } else if (typeof response !== 'undefined') {
          ret = Object.prototype.toString.call(response);
        }
        break;
  
      case 'blob':
      case 'document':
      case 'arraybuffer':
      default:
        if (typeof response !== 'undefined') {
          ret = Object.prototype.toString.call(response);
        }
        break;
    }
    return ret;
  },
};
