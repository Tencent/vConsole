import * as tool from '../lib/tool';

export type VConsoleRequestMethod = '' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';

export class VConsoleNetworkRequestItem {
  id: string                 = '';
  name?: string              = '';
  method: VConsoleRequestMethod = '';
  url: string                = '';
  status: number | string    = 0; // HTTP status codes
  statusText?: string        = ''; // for display
  cancelState?: 0 | 1 | 2 | 3 = 0; // 0=no cancel; 1=abort (for XHR); 2=cancel (for Fetch); 3=timeout;
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
  noVConsole?: boolean       = false;

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
    let ret = '';
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
            ret = tool.getStringWithinLength(String(response), 500000);
          }
        } else if (tool.isObject(response) || tool.isArray(response)) {
          ret = tool.safeJSONStringify(response, { maxDepth: 10, keyMaxLen: 500000, pretty: true });
        } else if (typeof response !== 'undefined') {
          ret = Object.prototype.toString.call(response);
          ret = tool.getStringWithinLength(ret, 500000);
        }
        break;
  
      case 'blob':
      case 'document':
      case 'arraybuffer':
      case 'formdata':
      default:
        if (typeof response !== 'undefined') {
          ret = Object.prototype.toString.call(response);
          ret = tool.getStringWithinLength(ret, 500000);
        }
        break;
    }
    return ret;
  },

  /**
   * Update item's properties according to readyState.
   */
  updateItemByReadyState(item: VConsoleNetworkRequestItem, XMLReq: XMLHttpRequest) {
    switch (XMLReq.readyState) {
      case 0: // UNSENT
        item.status = 0;
        item.statusText = 'Pending';
        if (!item.startTime) {
          item.startTime = (+new Date());
        }
        break;

      case 1: // OPENED
        item.status = 0;
        item.statusText = 'Pending';
        if (!item.startTime) {
          item.startTime = (+new Date());
        }
        break;

      case 2: // HEADERS_RECEIVED
        item.status = XMLReq.status;
        item.statusText = 'Loading';
        item.header = {};
        const header = XMLReq.getAllResponseHeaders() || '',
              headerArr = header.split('\n');
        // extract plain text to key-value format
        for (let i = 0; i < headerArr.length; i++) {
          const line = headerArr[i];
          if (!line) { continue; }
          const arr = line.split(': ');
          const key = arr[0],
                value = arr.slice(1).join(': ');
          item.header[key] = value;
        }
        break;

      case 3: // LOADING
        item.status = XMLReq.status;
        item.statusText = 'Loading';
        break;

      case 4: // DONE
        // clearInterval(timer);
        // `XMLReq.abort()` will change `status` from 200 to 0, so use previous value in this case
        item.status = XMLReq.status || item.status || 0;
        item.statusText = String(item.status); // show status code when request completed
        item.endTime = Date.now(),
        item.costTime = item.endTime - (item.startTime || item.endTime);
        item.response = XMLReq.response;
        break;

      default:
        // clearInterval(timer);
        item.status = XMLReq.status;
        item.statusText = 'Unknown';
        break;
    }
  },

  /**
   * Generate formatted response body by XMLHttpRequestBodyInit.
   */
  genFormattedBody(body?: BodyInit) {
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
  },

  getURL(urlString: string = '') {
    if (urlString.startsWith('//')) {
      const baseUrl = new URL(window.location.href);
      urlString = `${baseUrl.protocol}${urlString}`;
    }
    if (urlString.startsWith('http')) {
      return new URL(urlString);
    } else {
      return new URL(urlString, window.location.href);
    }
  },
};
