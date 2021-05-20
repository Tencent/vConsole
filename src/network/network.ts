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
  private _open: any = undefined; // the origin function
  private _send: any = undefined;
  private _setRequestHeader: any = undefined;

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
      window.XMLHttpRequest.prototype.open = this._open;
      window.XMLHttpRequest.prototype.send = this._send;
      window.XMLHttpRequest.prototype.setRequestHeader = this._setRequestHeader;
      this._open = undefined;
      this._send = undefined;
      this._setRequestHeader = undefined
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

    // update dom
    // let domData = {
    //   id: id,
    //   name: item.name,
    //   url: item.url,
    //   status: item.status,
    //   method: item.method || '-',
    //   costTime: item.costTime>0 ? item.costTime+'ms' : '-',
    //   header: item.header || null,
    //   requestHeader: item.requestHeader || null,
    //   getData: item.getData || null,
    //   postData: item.postData || null,
    //   response: null,
    //   actived: !!item.actived
    // };
    // switch (item.responseType) {
    //   case '':
    //   case 'text':
    //     // try to parse JSON
    //     if (tool.isString(item.response)) {
    //       try {
    //         domData.response = JSON.parse(item.response);
    //         domData.response = JSON.stringify(domData.response, null, 1);
    //         domData.response = domData.response;
    //       } catch (e) {
    //         // not a JSON string
    //         domData.response = item.response;
    //       }
    //     } else if (typeof item.response != 'undefined') {
    //       domData.response = Object.prototype.toString.call(item.response);
    //     }
    //     break;
    //   case 'json':
    //     if (typeof item.response != 'undefined') {
    //       domData.response = JSON.stringify(item.response, null, 1);
    //       domData.response = domData.response;
    //     }
    //     break;
    //   case 'blob':
    //   case 'document':
    //   case 'arraybuffer':
    //   default:
    //     if (typeof item.response != 'undefined') {
    //       domData.response = Object.prototype.toString.call(item.response);
    //     }
    //     break;
    // }
    // if (item.readyState == 0 || item.readyState == 1) {
    //   domData.status = 'Pending';
    // } else if (item.readyState == 2 || item.readyState == 3) {
    //   domData.status = 'Loading';
    // } else if (item.readyState == 4) {
    //   // do nothing
    // } else {
    //   domData.status = 'Unknown';
    // }
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
    that._open = _open;
    that._send = _send;
    that._setRequestHeader = _setRequestHeader;

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
                item.response = JSON.stringify(item.response, null, 1);
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
              item.response = JSON.stringify(XMLReq.response, null, 1);
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
          const arr = data.split('&');
          item.postData = {};
          for (let q of arr) {
            q = q.split('=');
            item.postData[ q[0] ] = q[1];
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

    const prevFetch = (input: RequestInfo, init?: RequestInit) => {
      const id = that.getUniqueID();
      const item = new VConsoleNetworkRequestItem(id);
      that.reqList[id] = item;
      let url: URL,
          method = 'GET',
          requestHeader: HeadersInit = null;

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

      if (Object.prototype.toString.call(requestHeader) === '[object Headers]') {
        item.requestHeader = {};
        // @ts-ignore
        for (let pair of requestHeader.entries()) {
          item.requestHeader[pair[0]] = pair[1];
        }
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

      // UNSENT
      if (!item.startTime) {
        item.startTime = (+new Date());
      }
      return _fetch(url.toString(), init).then((response) => {
        response
          .clone()
          .text()
          .then((text) => {
            const contentType = response.headers.get('content-type');
            console.log('response:::', contentType);
            // use 'text' as default type in case of contentType is json but response is not real JSON
            let itemResponse = text;
            // use XHR's responseType as fetch's responseType
            let itemResponseType: XMLHttpRequest['responseType'] = '';
            if (contentType.includes('application/json')) {
              try {
                itemResponse = JSON.parse(text);
                itemResponse = JSON.stringify(itemResponse, null, 1);
                itemResponseType = 'json';
              } catch (e) {}
            } else if (contentType.includes('text/html')) {
              itemResponseType = 'text';
            }
            item.response = itemResponse;
            item.responseType = itemResponseType;

            item.endTime = +new Date();
            item.costTime = item.endTime - (item.startTime || item.endTime);
            
            item.status = response.status;
            item.statusText = String(response.status);

            item.header = {};
            // @ts-ignore
            for (let pair of response.headers.entries()) {
              item.header[pair[0]] = pair[1];
            }
            item.readyState = 4;

            return itemResponse;
          }).finally(() => {
            that.updateRequest(id, item);
          });
        return response;
      })
    }
    window.fetch = prevFetch;
  }

  /**
   * mock navigator.sendBeacon
   * @private
   */
  private mockSendBeacon() {
    // https://fetch.spec.whatwg.org/#concept-bodyinit-extract
    const getContentType = (data?: BodyInit) => {
      if (data instanceof Blob) { return data.type; }
      if (data instanceof FormData) { return 'multipart/form-data'; }
      if (data instanceof URLSearchParams) { return 'application/x-www-form-urlencoded;charset=UTF-8'; }
      return 'text/plain;charset=UTF-8';
    }

    const _sendBeacon = window.navigator.sendBeacon;
    if (!_sendBeacon) { return; }
    const that = this;

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
    }
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

  private getURL(urlString: string) {
    return new URL(urlString, urlString.includes('http') ? '' : window.location.href);
  }

  /**
   * generate an unique id string (32)
   * @private
   * @return string
   */
  private getUniqueID() {
    const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    return id;
  }

} // END class

export default VConsoleNetworkTab;