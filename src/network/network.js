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

import $ from '../lib/query.js';
import * as tool from '../lib/tool.js';
import VConsolePlugin from '../lib/plugin.js';
import tplTabbox from './tabbox.html';
import tplHeader from './header.html';
import tplItem from './item.html';

class VConsoleNetworkTab extends VConsolePlugin {

  constructor(...args) {
    super(...args);

    this.$tabbox = $.render(tplTabbox, {});
    this.$header = null;
    this.reqList = {}; // URL as key, request item as value
    this.domList = {}; // URL as key, dom item as value
    this.isReady = false;
    this.isShow = false;
    this.isInBottom = true; // whether the panel is in the bottom
    this._open = undefined; // the origin function
    this._send = undefined;
    this._setRequestHeader = undefined;

    this.mockAjax();
    this.mockFetch();
  }

  onRenderTab(callback) {
    callback(this.$tabbox);
  }

  onAddTool(callback) {
    let that = this;
    let toolList = [{
      name: 'Clear',
      global: false,
      onClick: function(e) {
        that.clearLog();
      }
    }];
    callback(toolList);
  }

  onReady() {
    var that = this;
    that.isReady = true;

    // header
    this.renderHeader();

    // expend group item
    $.delegate($.one('.vc-log', this.$tabbox), 'click', '.vc-group-preview', function(e) {
      let reqID = this.dataset.reqid;
      let $group = this.parentNode;
      if ($.hasClass($group, 'vc-actived')) {
        $.removeClass($group, 'vc-actived');
        that.updateRequest(reqID, {actived: false});
      } else {
        $.addClass($group, 'vc-actived');
        that.updateRequest(reqID, {actived: true});
      }
      e.preventDefault();
    });

    let $content = $.one('.vc-content');
    $.bind($content, 'scroll', function(e) {
      if (!that.isShow) {
        return;
      }
      if ($content.scrollTop + $content.offsetHeight >= $content.scrollHeight) {
        that.isInBottom = true;
      } else {
        that.isInBottom = false;
      }
    });

    for (let k in that.reqList) {
      that.updateRequest(k, {});
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

  renderHeader() {
    let count = Object.keys(this.reqList).length,
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
   * @param string id
   * @param object data
   */
  updateRequest(id, data) {
    // see whether add new item into list
    let preCount = Object.keys(this.reqList).length;

    // update item
    let item = this.reqList[id] || {};
    for (let key in data) {
      item[key] = data[key];
    }
    this.reqList[id] = item;
    // console.log(item);

    if (!this.isReady) {
      return;
    }

    // update dom
    let domData = {
      id: id,
      name: item.name,
      url: item.url,
      status: item.status,
      method: item.method || '-',
      costTime: item.costTime>0 ? item.costTime+'ms' : '-',
      header: item.header || null,
      requestHeader: item.requestHeader || null,
      getData: item.getData || null,
      postData: item.postData || null,
      response: null,
      actived: !!item.actived
    };
    switch (item.responseType) {
      case '':
      case 'text':
        // try to parse JSON
        if (tool.isString(item.response)) {
          try {
            domData.response = JSON.parse(item.response);
            domData.response = JSON.stringify(domData.response, null, 1);
            domData.response = domData.response;
          } catch (e) {
            // not a JSON string
            domData.response = item.response;
          }
        } else if (typeof item.response != 'undefined') {
          domData.response = Object.prototype.toString.call(item.response);
        }
        break;
      case 'json':
        if (typeof item.response != 'undefined') {
          domData.response = JSON.stringify(item.response, null, 1);
          domData.response = domData.response;
        }
        break;
      case 'blob':
      case 'document':
      case 'arraybuffer':
      default:
        if (typeof item.response != 'undefined') {
          domData.response = Object.prototype.toString.call(item.response);
        }
        break;
    }
    if (item.readyState == 0 || item.readyState == 1) {
      domData.status = 'Pending';
    } else if (item.readyState == 2 || item.readyState == 3) {
      domData.status = 'Loading';
    } else if (item.readyState == 4) {
      // do nothing
    } else {
      domData.status = 'Unknown';
    }
    let $new = $.render(tplItem, domData),
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
    let curCount = Object.keys(this.reqList).length;
    if (curCount != preCount) {
      this.renderHeader();
    }

    // scroll to bottom
    if (this.isInBottom && this.isShow) {
      this.autoScrollToBottom();
    }
  }

  /**
   * mock ajax request
   * @private
   */
  mockAjax() {
    let _XMLHttpRequest = window.XMLHttpRequest;
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
      let XMLReq = this;
      let args = [].slice.call(arguments),
          method = args[0],
          url = args[1],
          id = that.getUniqueID();
      let timer = null;

      // may be used by other functions
      XMLReq._requestID = id;
      XMLReq._method = method;
      XMLReq._url = url;

      // mock onreadystatechange
      let _onreadystatechange = XMLReq.onreadystatechange || function() {};
      let onreadystatechange = function() {

        let item = that.reqList[id] || {};

        // update status
        item.readyState = XMLReq.readyState;
        item.status = 0;
        if (XMLReq.readyState > 1) {
          item.status = XMLReq.status;
        }
        item.responseType = XMLReq.responseType;

        if (XMLReq.readyState == 0) {
          // UNSENT
          if (!item.startTime) {
            item.startTime = (+new Date());
          }
        } else if (XMLReq.readyState == 1) {
          // OPENED
          if (!item.startTime) {
            item.startTime = (+new Date());
          }
        } else if (XMLReq.readyState == 2) {
          // HEADERS_RECEIVED
          item.header = {};
          let header = XMLReq.getAllResponseHeaders() || '',
              headerArr = header.split("\n");
          // extract plain text to key-value format
          for (let i=0; i<headerArr.length; i++) {
            let line = headerArr[i];
            if (!line) { continue; }
            let arr = line.split(': ');
            let key = arr[0],
                value = arr.slice(1).join(': ');
            item.header[key] = value;
          }
        } else if (XMLReq.readyState == 3) {
          // LOADING
        } else if (XMLReq.readyState == 4) {
          // DONE
          clearInterval(timer);
          item.endTime = +new Date(),
          item.costTime = item.endTime - (item.startTime || item.endTime);
          item.response = XMLReq.response;
        } else {
          clearInterval(timer);
        }

        if (!XMLReq._noVConsole) {
          that.updateRequest(id, item);
        }
        return _onreadystatechange.apply(XMLReq, arguments);
      };
      XMLReq.onreadystatechange = onreadystatechange;

      // some 3rd libraries will change XHR's default function
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
      let XMLReq = this;
      let args = [].slice.call(arguments),
          data = args[0];

      let item = that.reqList[XMLReq._requestID] || {};
      item.method = XMLReq._method ? XMLReq._method.toUpperCase() : 'GET';

      let query = XMLReq._url ? XMLReq._url.split('?') : []; // a.php?b=c&d=?e => ['a.php', 'b=c&d=', 'e']
      item.url = XMLReq._url || '';
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
          let arr = data.split('&');
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

      if (!XMLReq._noVConsole) {
        that.updateRequest(XMLReq._requestID, item);
      }

      return _send.apply(XMLReq, args);
    };

  };
  
  /**
   * mock fetch request
   * @private
   */
  mockFetch() {
    const _fetch = window.fetch;
    if (!_fetch) { return; }
    const that = this;

    const prevFetch = (input, init) => {
      let id = that.getUniqueID();
      that.reqList[id] = {};
      let item = that.reqList[id] || {};
      let query = [],
          url = '',
          method = 'GET',
          requestHeader = null;
      
      // handle `input` content
      if (tool.isString(input)) { // when `input` is a string
        method = init?.method || 'GET';
        url = input;
        requestHeader = init?.headers || null;
      } else { // when `input` is a `Request` object
        method = input.method || 'GET';
        url = input.url;
        requestHeader = input.headers;
      }
      query = url.split('?');

      item.id = id;
      item.method = method;
      item.requestHeader = requestHeader;
      item.url = url;
      item.name = query.shift() || '';
      item.name = item.name.replace(new RegExp('[/]*$'), '').split('/').pop() || '';

      if (Object.prototype.toString.call(requestHeader) === '[object Headers]') {
        item.requestHeader = {};
        for (let pair of requestHeader.entries()) {
          item.requestHeader[pair[0]] = pair[1];
        }
      } else {
        item.requestHeader = requestHeader;
      }

      if (query.length > 0) {
        item.name += '?' + query;
        item.getData = {};
        query = query.join('?'); // => 'b=c&d=?e'
        query = query.split('&'); // => ['b=c', 'd=?e']
        for (let q of query) {
          q = q.split('=');
          item.getData[ q[0] ] = q[1];
        }
      }

      if (item.method === 'POST') { // save POST data
        if (tool.isString(input)) { // when `input` is a string
          if (tool.isString(init?.body)) {
            let arr = init.body.split('&');
            item.postData = {};
            for (let q of arr) {
              q = q.split('=');
              item.postData[ q[0] ] = q[1];
            }
          } else if (tool.isPlainObject(init?.body)) {
            item.postData = init?.body;
          } else {
            item.postData = '[object Object]';
          }
        } else { // when `input` is a `Request` object
          // cannot get real type of request's body, so just display "[object Object]"
          item.postData = '[object Object]';
        }
      }

      // UNSENT
      if (!item.startTime) {
        item.startTime = (+new Date());
      }
      return _fetch(url, init).then((response) => {
        response
          .clone()
          .text()
          .then((text) => {
            const contentType = response.headers.get('content-type');
            // use 'text' as default type in case of contentType is json but response is not real JSON
            let itemResponse = text;
            let itemResponseType = '';
            if (contentType.includes('application/json')) {
              try {
                itemResponse = JSON.parse(text);
                itemResponseType = 'json';
              } catch (e) {}
            } else if (contentType.includes('text/html')) {
              itemResponseType = 'text';
            }
            item.endTime = +new Date();
            item.costTime = item.endTime - (item.startTime || item.endTime);
            item.status = response.status;
            item.header = {};
            for (let pair of response.headers.entries()) {
              item.header[pair[0]] = pair[1];
            }
            item.response = itemResponse;
            item.readyState = 4;

            item.responseType = itemResponseType;
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
   * generate an unique id string (32)
   * @private
   * @return string
   */
  getUniqueID() {
    let id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
    return id;
  }

} // END class

export default VConsoleNetworkTab;