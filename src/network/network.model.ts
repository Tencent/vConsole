import { writable, get } from 'svelte/store';
import * as tool from '../lib/tool';
import { VConsoleModel } from '../lib/model';
import { contentStore } from '../core/core.model';
import { VConsoleNetworkRequestItem, RequestItemHelper } from './requestItem';
import type { VConsoleRequestMethod } from './requestItem';


/**
 * Network Store
 */
export const requestList = writable<{ [id: string]: VConsoleNetworkRequestItem }>({});


/**
 * Network Model
 */
export class VConsoleNetworkModel extends VConsoleModel {
  public maxNetworkNumber: number = 1000;
  protected itemCounter: number = 0;

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

  public unMock() {
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

  public clearLog() {
    // remove list
    requestList.set({});
  }

  /**
   * Add or update a request item by request ID.
   */
  public updateRequest(id: string, data: VConsoleNetworkRequestItem) {
    const reqList = get(requestList);
    const hasItem = !!reqList[id];
    if (hasItem) {
      // force re-assign to ensure that the value is updated
      const item = reqList[id];
      for (let key in data) {
        item[key] = data[key];
      }
      data = item;
    }
    requestList.update((reqList) => {
      reqList[id] = data;
      return reqList;
    });
    if (!hasItem) {
      contentStore.updateTime();
      this.limitListLength();
    }
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
            url = args[1];
      const item = new VConsoleNetworkRequestItem();
      let timer = null;

      // may be used by other functions
      (<any>XMLReq)._requestID = item.id;
      (<any>XMLReq)._method = method;
      (<any>XMLReq)._url = url;

      // mock onReadyStateChange
      const _onreadystatechange = (<any>XMLReq)._origOnreadystatechange || XMLReq.onreadystatechange || function() {};
      const onreadystatechange = function() {

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
        item.response = RequestItemHelper.genResonseByResponseType(item.responseType, item.response);

        if (!(<any>XMLReq)._noVConsole) {
          that.updateRequest(item.id, item);
        }
        return _onreadystatechange.apply(XMLReq, arguments);
      };
      XMLReq.onreadystatechange = onreadystatechange;
      // when the XHR object is reused, we can still call the original function while it is overwrote. (issue #214)
      (<any>XMLReq)._origOnreadystatechange = _onreadystatechange;

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
            data: XMLHttpRequestBodyInit = args[0];
      const { _requestID, _url, _method } = <any>XMLReq;

      const reqList = get(requestList);
      const item = reqList[_requestID] || new VConsoleNetworkRequestItem();
      item.method = _method ? _method.toUpperCase() : 'GET';
      item.url = _url || '';
      item.name = item.url.replace(new RegExp('[/]*$'), '').split('/').pop() || '';
      item.getData = RequestItemHelper.genGetDataByUrl(item.url, {});
      item.postData = that.getFormattedBody(data);

      if (!(<any>XMLReq)._noVConsole) {
        that.updateRequest(item.id, item);
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
      const item = new VConsoleNetworkRequestItem();
      this.updateRequest(item.id, item);
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

      item.method = <VConsoleRequestMethod>method;
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
      // if (item.method === 'POST') {
      //   if (tool.isString(input)) { // when `input` is a string
      //     item.postData = that.getFormattedBody(init.body);
      //   } else { // when `input` is a `Request` object
      //     // cannot get real type of request's body, so just display "[object Object]"
      //     item.postData = '[object Object]';
      //   }
      // }
      if (init?.body) {
        item.postData = that.getFormattedBody(init.body);
      }

      const request = tool.isString(input) ? url.toString() : input;

      return _fetch(request, init).then((res) => {
        // fix ios<11 https://github.com/github/fetch/issues/504
        const response = res.clone();
        _fetchReponse = response.clone();
        // (window as any)._vcOrigConsole.log('_fetch', _fetchReponse);

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
        item.response = RequestItemHelper.genResonseByResponseType(item.responseType, responseBody);

        // mock finally
        that.updateRequest(item.id, item);

        return _fetchReponse;
      }).catch((e) => {
        // mock finally
        that.updateRequest(item.id, item);
        throw e;
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
      const item = new VConsoleNetworkRequestItem();
      this.updateRequest(item.id, item);

      const url = that.getURL(urlString);
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
        item.startTime = Date.now();
      }

      const isSuccess = _sendBeacon.call(window.navigator, urlString, data);
      if (isSuccess) {
        item.endTime = Date.now();
        item.costTime = item.endTime - (item.startTime || item.endTime);
        item.status = 0;
        item.statusText = 'Sent';
        item.readyState = 4;
      } else {
        item.status = 500;
        item.statusText = 'Unknown';
      }
      that.updateRequest(item.id, item);
      return isSuccess;
    };
  }

  private getFormattedBody(body?: BodyInit) {
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

  protected limitListLength() {
    // update list length every N rounds
    const N = 10;
    this.itemCounter++;
    if (this.itemCounter % N !== 0) {
      return;
    }
    this.itemCounter = 0;

    const list = get(requestList);
    const keys = Object.keys(list);
    if (keys.length > this.maxNetworkNumber - N) {
      requestList.update((store) => {
        // delete N more logs for performance
        const deleteKeys = keys.splice(0, keys.length - this.maxNetworkNumber + N);
        for (let i = 0; i < deleteKeys.length; i++) {
          store[deleteKeys[i]] = undefined;
          delete store[deleteKeys[i]];
        }
        return store;
      });
    }
  }

} // END class

export default VConsoleNetworkModel;
