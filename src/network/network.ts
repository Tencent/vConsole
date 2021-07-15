/*
Tencent is pleased to support the open source community by making vConsole available.

Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.

Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://opensource.org/licenses/MIT

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * vConsole Network Tab
 */

import $ from '../lib/query';
import * as tool from '../lib/tool';
import VConsolePlugin from '../lib/plugin';
import tplTabbox from './tabbox.html';
import tplHeader from './header.html';
import tplItem from './item.html';

class VConsoleNetworkRequestItem {
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
  actived: boolean = false;

  constructor(id: string) {
    this.id = id;
  }
}

class VConsoleNetworkTab extends VConsolePlugin {
  private $tabbox: Element = $.render(tplTabbox, {});
  private $header: Element = null;
  private reqList: { [id: string]: VConsoleNetworkRequestItem } = {};
  private domList: { [id: string]: Element } = {};
  private isShow: boolean = false;
  private isInBottom: boolean = true; // whether the panel is in the bottom
  private _xhrOpen: XMLHttpRequest['open'] = undefined; // the origin function
  private _xhrSend: XMLHttpRequest['send'] = undefined;
  private _xhrSetRequestHeader: XMLHttpRequest['setRequestHeader'] = undefined;
  private _fetch: WindowOrWorkerGlobalScope['fetch'] = undefined;
  private _sendBeacon: Navigator['sendBeacon'] = undefined;

  constructor(...args) {
    super(...args);

    this.mockXHR();
    this.mockFetch();
    this.mockSendBeacon();
  }

  onRenderTab(callback) {
    callback(this.$tabbox);
  }

  onAddTool(callback) {
    const toolList = [{
      name: 'Clear',
      global: false,
      onClick: (e) => {
        this.clearLog();
      }
    }];
    callback(toolList);
  }

  onReady() {
    this.isReady = true;

    // header
    this.renderHeader();

    // expend group item
    $.delegate($.one('.vc-log', this.$tabbox), 'click', '.vc-group-preview', (e, $target) => {
      const reqID = $target.dataset.reqid;
      const $group = $target.parentElement;
      if ($.hasClass($group, 'vc-actived')) {
        $.removeClass($group, 'vc-actived');
        this.updateRequest(reqID, {actived: false});
      } else {
        $.addClass($group, 'vc-actived');
        this.updateRequest(reqID, {actived: true});
      }
      e.preventDefault();
    });

    const $content = $.one('.vc-content');
    $.bind($content, 'scroll', (e) => {
      if (!this.isShow) {
        return;
      }
      if ($content.scrollTop + $content.offsetHeight >= $content.scrollHeight) {
        this.isInBottom = true;
      } else {
        this.isInBottom = false;
      }
    });

    for (let k in this.reqList) {
      this.updateRequest(k, {});
    }
  }

  onRemove() {
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

  onShow() {
    this.isShow = true;
    if (this.isInBottom == true) {
      this.autoScrollToBottom();
    }
  }

  onHide() {
    this.isShow = false;
  }

  onShowConsole() {
    if (this.isInBottom == true) {
      this.autoScrollToBottom();
    }
  }

  autoScrollToBottom() {
    if (!this.vConsole.option.disableLogScrolling) {
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    let $box = $.one('.vc-content');
    $box.scrollTop = $box.scrollHeight - $box.offsetHeight;
  }

  clearLog() {
    // remove list
    this.reqList = {};

    // remove dom
    for (let id in this.domList) {
      this.domList[id].parentNode.removeChild(this.domList[id]);
      this.domList[id] = undefined;
    }
    this.domList = {};

    // update header
    this.renderHeader();
  }

  private renderHeader() {
    const count = Object.keys(this.reqList).length,
        $header = $.render(tplHeader, {count: count}),
        $logbox = $.one('.vc-log', this.$tabbox);
    if (this.$header) {
      // update
      this.$header.parentNode.replaceChild($header, this.$header);
    } else {
      // add
      $logbox.parentNode.insertBefore($header, $logbox);
    }
    this.$header = $header;
  }

  /**
   * add or update a request item by request ID
   * @private
   */
  private updateRequest(id: string, data: VConsoleNetworkRequestItem | Object) {
    // see whether add new item into list
    const preCount = Object.keys(this.reqList).length;

    // update item
    const item = this.reqList[id] || new VConsoleNetworkRequestItem(id);
    for (let key in data) {
      item[key] = data[key];
    }
    this.reqList[id] = item;
    // console.log(item);

    if (!this.isReady) {
      return;
    }
    const $new = $.render(tplItem, item),
          $old = this.domList[id];
    if (item.status >= 400) {
      $.addClass($.one('.vc-group-preview', $new), 'vc-table-row-error');
    }
    if ($old) {
      $old.parentNode.replaceChild($new, $old);
    } else {
      $.one('.vc-log', this.$tabbox).insertAdjacentElement('beforeend', $new);
    }
    this.domList[id] = $new;

    // update header
    const curCount = Object.keys(this.reqList).length;
    if (curCount !== preCount) {
      this.renderHeader();
    }

    // scroll to bottom
    if (this.isInBottom && this.isShow) {
      this.autoScrollToBottom();
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
            url = args[1],
            id = that.getUniqueID();
      let timer = null;

      // may be used by other functions
      (<any>XMLReq)._requestID = id;
      (<any>XMLReq)._method = method;
      (<any>XMLReq)._url = url;

      // mock onreadystatechange
      const _onreadystatechange = XMLReq.onreadystatechange || function() {};
      const onreadystatechange = function() {

        const item = that.reqList[id] || new VConsoleNetworkRequestItem(id);

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
                item.response = tool.JSONStringify(item.response, null, 1);
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
              item.response = tool.JSONStringify(XMLReq.response, null, 1);
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

      const item = that.reqList[XMLReq._requestID];
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
      const { _requestID = that.getUniqueID(), _url, _method } = <any>XMLReq;

      const item = that.reqList[_requestID] || new VConsoleNetworkRequestItem(_requestID);
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
          item.getData[ q[0] ] = decodeURIComponent(q[1]);
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

    window.fetch = (input: RequestInfo, init?: RequestInit) => {
      const id = that.getUniqueID();
      const item = new VConsoleNetworkRequestItem(id);
      that.reqList[id] = item;
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
        (<Headers>requestHeader).forEach((value, key) => {
          item.requestHeader[key] = value;
        });
      } else {
        item.requestHeader = requestHeader;
      }

      // save GET data
      if (url.search) {
        item.getData = {};
        url.searchParams.forEach((value, key) => {
          item.getData[key] = value;
        });
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

      return _fetch(request, init).then((response) => {
        _fetchReponse = response;

        item.endTime = +new Date();
        item.costTime = item.endTime - (item.startTime || item.endTime);
        item.status = response.status;
        item.statusText = String(response.status);

        item.header = {};
        response.headers.forEach((value, key) => {
          item.header[key] = value;
        });
        item.readyState = 4;

        // parse response body by Content-Type
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          item.responseType = 'json';
          return response.clone().text();
        } else if (contentType && contentType.includes('text/html')) {
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
              item.response = tool.JSONStringify(item.response, null, 1);
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

        return _fetchReponse;
      }).finally(() => {
        _fetchReponse = undefined;
        that.updateRequest(id, item);
      });
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
      const id = that.getUniqueID();
      const item = new VConsoleNetworkRequestItem(id);
      that.reqList[id] = item;

      const url = that.getURL(urlString);
      item.id = id;
      item.method = 'POST';
      item.url = urlString;
      item.name = (url.pathname.split('/').pop() || '') + url.search;
      item.requestType = 'ping';
      item.requestHeader = { 'Content-Type': getContentType(data) };
      item.status = 0;
      item.statusText = 'Pending';
      
      if (url.search) {
        item.getData = {};
        url.searchParams.forEach((value, key) => {
          item.getData[key] = value;
        });
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
        (<URLSearchParams>body).forEach((value, key) => {
          ret[key] = value;
        });
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

  /**
   * generate an unique id string (32)
   */
  // protected getUniqueID() {
  //   const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
  //     const r = Math.random() * 16 | 0;
  //     const v = c == 'x' ? r : (r & 0x3 | 0x8);
  //     return v.toString(16);
  //   });
  //   return id;
  // }

} // END class

export default VConsoleNetworkTab;
