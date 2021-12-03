import { writable, get } from 'svelte/store';
import * as tool from '../lib/tool';
import { VConsoleModel } from '../lib/model';
 
export class VConsoleNetworkRequestItem {
  id: string                = '';
  name: string              = '';
  method: string            = '';
  url: string               = '';
  status: number | string   = 0;
  statusText: string        = '';
  readyState: XMLHttpRequest['readyState'] = 0;
  header: { [key: string]: string } = null; // response header
  responseType: XMLHttpRequest['responseType'];
  requestType: 'xhr' | 'fetch' | 'ping';
  requestHeader: HeadersInit = null;
  response: any;
  startTime: number         = 0;
  endTime: number           = 0;
  costTime: number          = 0;
  getData: { [key: string]: string } = null;
  postData: { [key: string]: string } | string = null;
  actived: boolean          = false;

  constructor(id: string) {
    this.id = id;
  }
}

/**
 * Network Store
 */
export const requestList = writable<{ [id: string]: VConsoleNetworkRequestItem }>({});


/**
 * Network Model
 */
export class VConsoleNetworkModel extends VConsoleModel {
  private _xhrOpen: XMLHttpRequest['open'] = undefined; // the origin function
  private _xhrSend: XMLHttpRequest['send'] = undefined;
  private _xhrSetRequestHeader: XMLHttpRequest['setRequestHeader'] = undefined;
  private _fetch: WindowOrWorkerGlobalScope['fetch'] = undefined;
  private _sendBeacon: Navigator['sendBeacon'] = undefined;

 
  constructor() {
    super();
    this.mockXHR();
    this.mockFetch();
    this.mockSendBeacon();
  }

  unMock() {
    // recover original functions
    if (window.XMLHttpRequest) {
      window.XMLHttpRequest.prototype.open = this._xhrOpen;
      window.XMLHttpRequest.prototype.send = this._xhrSend;
      window.XMLHttpRequest.prototype.setRequestHeader = this._xhrSetRequestHeader;
      this._xhrOpen = undefined;
      this._xhrSend = undefined;
      this._xhrSetRequestHeader = undefined;
    }
    if (window.fetch) {
      window.fetch = this._fetch;
      this._fetch = undefined;
    }
    if (window.navigator.sendBeacon) {
      window.navigator.sendBeacon = this._sendBeacon;
      this._sendBeacon = undefined;
    }
  }

  clearLog() {
    // remove list
    requestList.set({});
  }

  /**
    * add or update a request item by request ID
    * @private
    */
  private updateRequest(id: string, data: VConsoleNetworkRequestItem | Object) {
    // update item
    const reqList = get(requestList);
    const item = reqList[id] || new VConsoleNetworkRequestItem(id);
    for (let key in data) {
      item[key] = data[key];
    }
    requestList.update((reqList) => {
      reqList[id] = item;
      return reqList;
    });
    // console.log(item);
  }

  /**
    * mock XMLHttpRequest
    * @private
    */
  private mockXHR() {
    const _XMLHttpRequest = window.XMLHttpRequest;
    if (!_XMLHttpRequest) { return; }

    const that = this;
    const _open = window.XMLHttpRequest.prototype.open,
          _send = window.XMLHttpRequest.prototype.send,
          _setRequestHeader = window.XMLHttpRequest.prototype.setRequestHeader;
    that._xhrOpen = _open;
    that._xhrSend = _send;
    that._xhrSetRequestHeader = _setRequestHeader;

    // mock open()
    window.XMLHttpRequest.prototype.open = function() {
      const XMLReq: XMLHttpRequest = this;
      const args = [].slice.call(arguments),
            method = args[0],
            url = args[1],
            id = tool.getUniqueID();
      let timer = null;

      // may be used by other functions
      (<any>XMLReq)._requestID = id;
      (<any>XMLReq)._method = method;
      (<any>XMLReq)._url = url;

      // mock onreadystatechange
      const _onreadystatechange = XMLReq.onreadystatechange || function() {};
      const onreadystatechange = function() {

        const reqList = get(requestList);
        const item = reqList[id] || new VConsoleNetworkRequestItem(id);

        // update status
        item.readyState = XMLReq.readyState;
        item.responseType = XMLReq.responseType;
        item.requestType = 'xhr';

        // update data by readyState
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
            clearInterval(timer);
            item.status = XMLReq.status;
            item.statusText = String(XMLReq.status); // show status code when request completed
            item.endTime = +new Date(),
            item.costTime = item.endTime - (item.startTime || item.endTime);
            item.response = XMLReq.response;
            break;

          default:
            clearInterval(timer);
            item.status = XMLReq.status;
            item.statusText = 'Unknown';
            break;
        }

        // update response by responseType
        switch (XMLReq.responseType) {
          case '':
          case 'text':
            // try to parse JSON
            if (tool.isString(XMLReq.response)) {
              try {
                item.response = JSON.parse(XMLReq.response);
                item.response = tool.safeJSONStringify(item.response, 10, 500000);
              } catch (e) {
                // not a JSON string
                item.response = XMLReq.response;
              }
            } else if (typeof XMLReq.response !== 'undefined') {
              item.response = Object.prototype.toString.call(XMLReq.response);
            }
            break;

          case 'json':
            if (typeof XMLReq.response !== 'undefined') {
              item.response = tool.safeJSONStringify(XMLReq.response, 10, 500000);
            }
            break;

          case 'blob':
          case 'document':
          case 'arraybuffer':
          default:
            if (typeof XMLReq.response !== 'undefined') {
              item.response = Object.prototype.toString.call(XMLReq.response);
            }
            break;
        }

        if (!(<any>XMLReq)._noVConsole) {
          that.updateRequest(id, item);
        }
        return _onreadystatechange.apply(XMLReq, arguments);
      };
      XMLReq.onreadystatechange = onreadystatechange;

      // some 3rd-libraries will change XHR's default function
      // so we use a timer to avoid lost tracking of readyState
      let preState = -1;
      timer = setInterval(function() {
        if (preState != XMLReq.readyState) {
          preState = XMLReq.readyState;
          onreadystatechange.call(XMLReq);
        }
      }, 10);

      return _open.apply(XMLReq, args);
    };

    // mock setRequestHeader()
    window.XMLHttpRequest.prototype.setRequestHeader = function() {
      const XMLReq = this;
      const args = [].slice.call(arguments);

      const reqList = get(requestList);
      const item = reqList[XMLReq._requestID];
      if (item) {
        if (!item.requestHeader) { item.requestHeader = {}; }
        item.requestHeader[args[0]] = args[1];
      }
      return _setRequestHeader.apply(XMLReq, args);
    };

    // mock send()
    window.XMLHttpRequest.prototype.send = function() {
      const XMLReq: XMLHttpRequest = this;
      const args = [].slice.call(arguments),
            data = args[0];
      const { _requestID = tool.getUniqueID(), _url, _method } = <any>XMLReq;

      const reqList = get(requestList);
      const item = reqList[_requestID] || new VConsoleNetworkRequestItem(_requestID);
      item.method = _method ? _method.toUpperCase() : 'GET';

      let query = _url ? _url.split('?') : []; // a.php?b=c&d=?e => ['a.php', 'b=c&d=', 'e']
      item.url = _url || '';
      item.name = query.shift() || ''; // => ['b=c&d=', 'e']
      item.name = item.name.replace(new RegExp('[/]*$'), '').split('/').pop() || '';

      if (query.length > 0) {
        item.name += '?' + query;
        item.getData = {};
        query = query.join('?'); // => 'b=c&d=?e'
        query = query.split('&'); // => ['b=c', 'd=?e']
        for (let q of query) {
          q = q.split('=');
          try {
            item.getData[ q[0] ] = decodeURIComponent(q[1]);
          } catch (e) {
            // "URIError: URI malformed" will be thrown when `q[1]` contains "%", so just use raw data
            // @issue #470
            // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Malformed_URI
            item.getData[ q[0] ] = q[1];
          }
        }
      }

      if (item.method == 'POST') {

        // save POST data
        if (tool.isString(data)) {
          try { // '{a:1}' => try to parse as json
            item.postData = JSON.parse(data);
          } catch (e) { // 'a=1&b=2' => try to parse as query
            const arr = data.split('&');
            item.postData = {};
            for (let q of arr) {
              q = q.split('=');
              item.postData[ q[0] ] = q[1];
            }
          }
        } else if (tool.isPlainObject(data)) {
          item.postData = data;
        } else {
          item.postData = '[object Object]';
        }

      }

      if (!(<any>XMLReq)._noVConsole) {
        that.updateRequest(_requestID, item);
      }

      return _send.apply(XMLReq, args);
    };

  };

  /**
    * mock fetch request
    * @private
    */
  private mockFetch() {
    const _fetch = window.fetch;
    if (!_fetch) { return; }
    const that = this;
    this._fetch = _fetch;

    (<any>window).fetch = (input: RequestInfo, init?: RequestInit) => {
      const id = tool.getUniqueID();
      const item = new VConsoleNetworkRequestItem(id);
      requestList.update((reqList) => {
        reqList[id] = item;
        return reqList;
      });
      let url: URL,
          method = 'GET',
          requestHeader: HeadersInit = null;
      let _fetchReponse: Response;

      // handle `input` content
      if (tool.isString(input)) { // when `input` is a string
        method = init?.method || 'GET';
        url = that.getURL(<string>input);
        requestHeader = init?.headers || null;
      } else { // when `input` is a `Request` object
        method = (<Request>input).method || 'GET';
        url = that.getURL((<Request>input).url);
        requestHeader = (<Request>input).headers;
      }

      item.id = id;
      item.method = method;
      item.requestType = 'fetch';
      item.requestHeader = requestHeader;
      item.url = url.toString();
      item.name = (url.pathname.split('/').pop() || '') + url.search;
      item.status = 0;
      item.statusText = 'Pending';
      if (!item.startTime) { // UNSENT
        item.startTime = (+new Date());
      }

      if (Object.prototype.toString.call(requestHeader) === '[object Headers]') {
        item.requestHeader = {};
        for (const [key, value] of <Headers>requestHeader) {
          item.requestHeader[key] = value;
        }
      } else {
        item.requestHeader = requestHeader;
      }

      // save GET data
      if (url.search && url.searchParams) {
        item.getData = {};
        for (const [key, value] of url.searchParams) {
          item.getData[key] = value;
        }
      }

      // save POST data
      if (item.method === 'POST') {
        if (tool.isString(input)) { // when `input` is a string
          item.postData = that.getFormattedBody(init.body);
        } else { // when `input` is a `Request` object
          // cannot get real type of request's body, so just display "[object Object]"
          item.postData = '[object Object]';
        }
      }

      const request = tool.isString(input) ? url.toString() : input;

      return _fetch(request, init).then((res) => {
        // fix ios<11 https://github.com/github/fetch/issues/504
        const response = res.clone();
        _fetchReponse = response.clone();

        item.endTime = +new Date();
        item.costTime = item.endTime - (item.startTime || item.endTime);
        item.status = response.status;
        item.statusText = String(response.status);

        item.header = {};
        for (const [key, value] of response.headers) {
          item.header[key] = value;
        }
        item.readyState = 4;

        // parse response body by Content-Type
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          item.responseType = 'json';
          return response.clone().text();
        } else if (contentType && (contentType.includes('text/html') || contentType.includes('text/plain'))) {
          item.responseType = 'text';
          return response.clone().text();
        } else {
          item.responseType = '';
          return '[object Object]';
        }

      }).then((responseBody) => {
        // save response body
        switch (item.responseType) {
          case 'json':
            try {
              // try to parse response as JSON
              item.response = JSON.parse(responseBody);
              item.response = tool.safeJSONStringify(item.response, 10, 500000);
            } catch (e) {
              // not real JSON, use 'text' as default type
              item.response = responseBody;
              item.responseType = 'text';
            }
            break;

          case 'text':
          default:
            item.response = responseBody;
            break;
        }

        // mock finally
        that.updateRequest(id, item);

        return _fetchReponse;
      }).catch(() => {
        // mock finally
        that.updateRequest(id, item);
      });
      // ios<11 finally undefined
      // .finally(() => {
      //   _fetchReponse = undefined;
      //   that.updateRequest(id, item);
      // });
    };
  }

  /**
    * mock navigator.sendBeacon
    * @private
    */
  private mockSendBeacon() {
    const _sendBeacon = window.navigator.sendBeacon;
    if (!_sendBeacon) { return; }
    const that = this;
    this._sendBeacon = _sendBeacon;

    // https://fetch.spec.whatwg.org/#concept-bodyinit-extract
    const getContentType = (data?: BodyInit) => {
      if (data instanceof Blob) { return data.type; }
      if (data instanceof FormData) { return 'multipart/form-data'; }
      if (data instanceof URLSearchParams) { return 'application/x-www-form-urlencoded;charset=UTF-8'; }
      return 'text/plain;charset=UTF-8';
    };

    window.navigator.sendBeacon = (urlString: string, data?: BodyInit) => {
      const id = tool.getUniqueID();
      const item = new VConsoleNetworkRequestItem(id);
      requestList.update((reqList) => {
        reqList[id] = item;
        return reqList;
      });

      const url = that.getURL(urlString);
      item.id = id;
      item.method = 'POST';
      item.url = urlString;
      item.name = (url.pathname.split('/').pop() || '') + url.search;
      item.requestType = 'ping';
      item.requestHeader = { 'Content-Type': getContentType(data) };
      item.status = 0;
      item.statusText = 'Pending';
      
      if (url.search && url.searchParams) {
        item.getData = {};
        for (const [key, value] of url.searchParams) {
          item.getData[key] = value;
        }
      }
      item.postData = that.getFormattedBody(data);

      if (!item.startTime) {
        item.startTime = (+new Date());
      }

      const isSuccess = _sendBeacon.call(window.navigator, urlString, data);
      if (isSuccess) {
        item.endTime = +new Date();
        item.costTime = item.endTime - (item.startTime || item.endTime);
        item.status = 0;
        item.statusText = 'Sent';
        item.readyState = 4;
      } else {
        item.status = 500;
        item.statusText = 'Unknown';
      }
      that.updateRequest(id, item);
      return isSuccess;
    };
  }

  private getFormattedBody(body?: BodyInit) {
    if (!body) { return null; }
    let ret: string | { [key: string]: string } = null;
    const type = tool.getPrototypeName(body);
    switch (type) {
      case 'String':
        try {
          // try to parse as JSON
          ret = JSON.parse(<string>body);
        } catch (e) {
          // not a json, return original string
          ret = <string>body;
        }
        break;

      case 'URLSearchParams':
        ret = {};
        for (const [key, value] of <URLSearchParams>body) {
          ret[key] = value;
        }
        break;

      default:
        ret = `[object ${type}]`;
        break;
    }
    return ret;
  }

  private getURL(urlString: string = '') {
    if (urlString.startsWith('//')) {
      const baseUrl = new URL(window.location.href);
      urlString = `${baseUrl.protocol}${urlString}`;
    }
    if (urlString.startsWith('http')) {
      return new URL(urlString);
    } else {
      return new URL(urlString, window.location.href);
    }
  }

} // END class

export default VConsoleNetworkModel;
