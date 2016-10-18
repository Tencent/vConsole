/**
 * vConsole Default Tab
 *
 * @author WechatFE
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

    this.mockAjax();
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
      let $group = this.parentNode;
      if ($.hasClass($group, 'vc-actived')) {
        $.removeClass($group, 'vc-actived');
      } else {
        $.addClass($group, 'vc-actived');
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
      this._open = undefined;
      this._send = undefined;
    }
  }

  onShow() {
    this.isShow = true;
    if (this.isInBottom == true) {
      this.scrollToBottom();
    }
  }

  onHide() {
    this.isShow = false;
  }

  onShowConsole() {
    if (this.isInBottom == true) {
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
      this.domList[id].remove();
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
      url: item.url,
      status: item.status || '-',
      type: '-',
      costTime: item.costTime>0 ? item.costTime+'ms' : '-',
      header: item.header,
      response: tool.htmlEncode(item.response)
    };
    if (item.readyState <= 1) {
      domData.status = 'Pending';
    } else if (item.readyState < 4) {
      domData.status = 'Loading';
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
    if (this.isInBottom) {
      this.scrollToBottom();
    }
  }

  /**
   * mock ajax request
   * @private
   */
  mockAjax() {
    let _XMLHttpRequest = window.XMLHttpRequest;
    if (!_XMLHttpRequest) { return; }

    let that = this;
    let _open = window.XMLHttpRequest.prototype.open,
        _send = window.XMLHttpRequest.prototype.send;
    that._open = _open;
    that._send = _send;

    // mock open()
    window.XMLHttpRequest.prototype.open = function() {
      let XMLReq = this;
      let args = [].slice.call(arguments),
          url = args[1],
          id = that.getUniqueID();

      // may be used by other methods
      XMLReq._requestID = id;

      // mock onreadystatechange
      let _onreadystatechange = XMLReq.onreadystatechange || function() {};
      XMLReq.onreadystatechange = function() {

        let item = that.reqList[id] || {};

        // update status
        item.url = url;
        item.readyState = XMLReq.readyState;

        if (XMLReq.readyState == 0) {
          // UNSENT
          item.startTime = (+new Date());
        } else if (XMLReq.readyState == 1) {
          // OPENED
          item.startTime = (+new Date());
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
          item.status = XMLReq.status;
          item.endTime = +new Date(),
          item.costTime = item.endTime - (item.startTime || item.endTime);
          item.response = XMLReq.response;
        }

        if (!XMLReq._noVConsole) {
          that.updateRequest(id, item);
        }
        return _onreadystatechange.apply(XMLReq, arguments);
      };

      return _open.apply(XMLReq, args);
    };

  };

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