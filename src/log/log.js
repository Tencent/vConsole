/*
Tencent is pleased to support the open source community by making vConsole available.

Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.

Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://opensource.org/licenses/MIT

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * vConsole Basic Log Tab
 */

import * as tool from '../lib/tool.js';
import $ from '../lib/query.js';
import VConsolePlugin from '../lib/plugin.js';
import tplItem from './item.html';
import tplFold from './item_fold.html';
import tplFoldCode from './item_fold_code.html';

const DEFAULT_MAX_LOG_NUMBER = 1000;
const ADDED_LOG_TAB_ID = [];
let preLog = {
  // _id: string
  // logType: string
  // logText: string
};

class VConsoleLogTab extends VConsolePlugin {
  static AddedLogID = [];

  constructor(...args) {
    super(...args);
    ADDED_LOG_TAB_ID.push(this.id);

    this.tplTabbox = ''; // MUST be overwrite in child class
    this.allowUnformattedLog = true; // `[xxx]` format log

    this.isReady = false;
    this.isShow = false;
    this.$tabbox = null;
    this.console = {};
    this.logList = []; // save logs before ready
    this.isInBottom = true; // whether the panel is in the bottom
    this.maxLogNumber = DEFAULT_MAX_LOG_NUMBER;
    this.logNumber = 0;

    this.mockConsole();
  }

  /**
   * when vConsole is ready,
   * this event will be triggered (after 'add' event)
   * @public
   */
  onInit() {
    this.$tabbox = $.render(this.tplTabbox, {});
    this.updateMaxLogNumber();
  }

  /**
   * this event will make this plugin be registered as a tab
   * @public
   */
  onRenderTab(callback) {
    callback(this.$tabbox);
  }

  onAddTopBar(callback) {
    let that = this;
    let types = ['All', 'Log', 'Info', 'Warn', 'Error'];
    let btnList = [];
    for (let i = 0; i < types.length; i++) {
      btnList.push({
        name: types[i],
        data: {
          type: types[i].toLowerCase()
        },
        className: '',
        onClick: function () {
          if (!$.hasClass(this, 'vc-actived')) {
            that.showLogType(this.dataset.type || 'all');
          } else {
            return false;
          }
        }
      });
    }
    btnList[0].className = 'vc-actived';
    callback(btnList);
  }

  onAddTool(callback) {
    let that = this;
    let toolList = [{
      name: 'Clear',
      global: false,
      onClick: function () {
        that.clearLog();
        that.vConsole.triggerEvent('clearLog');
      }
    }];
    callback(toolList);
  }

  /**
   * after init
   * @public
   */
  onReady() {
    let that = this;
    that.isReady = true;

    // log type filter
    let $subTabs = $.all('.vc-subtab', that.$tabbox);
    $.bind($subTabs, 'click', function (e) {
      e.preventDefault();
      if ($.hasClass(this, 'vc-actived')) {
        return false;
      }
      $.removeClass($subTabs, 'vc-actived');
      $.addClass(this, 'vc-actived');

      let logType = this.dataset.type,
        $log = $.one('.vc-log', that.$tabbox);
      $.removeClass($log, 'vc-log-partly-log');
      $.removeClass($log, 'vc-log-partly-info');
      $.removeClass($log, 'vc-log-partly-warn');
      $.removeClass($log, 'vc-log-partly-error');
      if (logType == 'all') {
        $.removeClass($log, 'vc-log-partly');
      } else {
        $.addClass($log, 'vc-log-partly');
        $.addClass($log, 'vc-log-partly-' + logType);
      }
    });

    let $content = $.one('.vc-content');
    $.bind($content, 'scroll', function (e) {
      if (!that.isShow) {
        return;
      }
      if ($content.scrollTop + $content.offsetHeight >= $content.scrollHeight) {
        that.isInBottom = true;
      } else {
        that.isInBottom = false;
      }
    });

    for (let i = 0; i < that.logList.length; i++) {
      that.printLog(that.logList[i]);
    }
    that.logList = [];
  }

  /**
   * before remove
   * @public
   */
  onRemove() {
    window.console.log = this.console.log;
    window.console.info = this.console.info;
    window.console.warn = this.console.warn;
    window.console.debug = this.console.debug;
    window.console.error = this.console.error;
    window.console.time = this.console.time;
    window.console.timeEnd = this.console.timeEnd;
    window.console.clear = this.console.clear;
    this.console = {};

    const idx = ADDED_LOG_TAB_ID.indexOf(this.id);
    if (idx > -1) {
      ADDED_LOG_TAB_ID.splice(idx, 1);
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

  onUpdateOption() {
    if (this.vConsole.option.maxLogNumber != this.maxLogNumber) {
      this.updateMaxLogNumber();
      this.limitMaxLogs();
    }
  }

  updateMaxLogNumber() {
    this.maxLogNumber = this.vConsole.option.maxLogNumber || DEFAULT_MAX_LOG_NUMBER;
    this.maxLogNumber = Math.max(1, this.maxLogNumber);
  }

  limitMaxLogs() {
    if (!this.isReady) {
      return;
    }
    while (this.logNumber > this.maxLogNumber) {
      let $firstItem = $.one('.vc-item', this.$tabbox);
      if (!$firstItem) {
        break;
      }
      $firstItem.parentNode.removeChild($firstItem);
      this.logNumber--;
    }
  }

  showLogType(logType) {
    let $log = $.one('.vc-log', this.$tabbox);
    $.removeClass($log, 'vc-log-partly-log');
    $.removeClass($log, 'vc-log-partly-info');
    $.removeClass($log, 'vc-log-partly-warn');
    $.removeClass($log, 'vc-log-partly-error');
    if (logType == 'all') {
      $.removeClass($log, 'vc-log-partly');
    } else {
      $.addClass($log, 'vc-log-partly');
      $.addClass($log, 'vc-log-partly-' + logType);
    }
  }

  autoScrollToBottom() {
    if (!this.vConsole.option.disableLogScrolling) {
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    let $content = $.one('.vc-content');
    if ($content) {
      $content.scrollTop = $content.scrollHeight - $content.offsetHeight;
    }
  }

  /**
   * replace window.console with vConsole method
   * @private
   */
  mockConsole() {
    const that = this;
    const methodList = ['log', 'info', 'warn', 'debug', 'error'];

    if (!window.console) {
      window.console = {};
    } else {
      methodList.map(function (method) {
        that.console[method] = window.console[method];
      });
      that.console.time = window.console.time;
      that.console.timeEnd = window.console.timeEnd;
      that.console.clear = window.console.clear;
    }

    methodList.map(method => {
      window.console[method] = (...args) => {
        this.printLog({
          logType: method,
          logs: args,
        });
      };
    });

    const timeLog = {}
    window.console.time = function (label) {
      timeLog[label] = Date.now();
    };
    window.console.timeEnd = function (label) {
      var pre = timeLog[label];
      if (pre) {
        console.log(label + ':', (Date.now() - pre) + 'ms');
        delete timeLog[label];
      } else {
        console.log(label + ': 0ms');
      }
    };

    window.console.clear = (...args) => {
      that.clearLog();
      that.console.clear.apply(window.console, args);
    };
  }

  clearLog() {
    $.one('.vc-log', this.$tabbox).innerHTML = '';
    this.logNumber = 0;
    preLog = {};
  }

  /**
   * print log to origin console
   * @protected
   */
  printOriginLog(item) {
    if (typeof this.console[item.logType] === 'function') {
      this.console[item.logType].apply(window.console, item.logs);
    }
  }

  /**
   * print a log to log box
   * @protected
   * @param  string  _id        random unique id
   * @param  string  tabName    default|system
   * @param  string  logType    log|info|debug|error|warn
   * @param  array   logs       `logs` or `content` can't be empty
   * @param  object  content    `logs` or `content` can't be empty
   * @param  boolean noOrigin
   * @param  int     date
   * @param  string  style
   */
  printLog(item) {
    let logs = item.logs || [];
    if (!logs.length && !item.content) {
      return;
    }

    // copy logs as a new array
    logs = [].slice.call(logs || []);

    // check `[default]` format
    let shouldBeHere = true;
    let pattern = /^\[(\w+)\]$/i;
    let targetTabID = '';
    let isInAddedTab = false;
    if (tool.isString(logs[0])) {
      let match = logs[0].match(pattern);
      if (match !== null && match.length > 0) {
        targetTabID = match[1].toLowerCase();
        isInAddedTab = ADDED_LOG_TAB_ID.indexOf(targetTabID) > -1;
      }
    }

    if (targetTabID === this.id) {
      // target tab is current tab
      shouldBeHere = true;
    } else if (isInAddedTab === true) {
      // target tab is not current tab, but in added tab list
      // so throw this log to other tab
      shouldBeHere = false;
    } else {
      // target tab is not in added tab list
      if (this.id === 'default') {
        // show this log in default tab
        shouldBeHere = true;
      } else {
        shouldBeHere = false;
      }
    }

    if (!shouldBeHere) {
      // ignore this log and throw it to origin console
      if (!item.noOrigin) {
        this.printOriginLog(item);
      }
      return;
    }

    // add id
    if (!item._id) {
      item._id = '__vc_' + Math.random().toString(36).substring(2, 8);
    }

    // save log date
    if (!item.date) {
      item.date = (+new Date());
    }

    // if vConsole is not ready, save current log to logList
    if (!this.isReady) {
      this.logList.push(item);
      return;
    }

    // remove `[xxx]` format
    if (tool.isString(logs[0]) && isInAddedTab) {
      logs[0] = logs[0].replace(pattern, '');
      if (logs[0] === '') {
        logs.shift();
      }
    }

    // make for previous log
    const curLog = {
      _id: item._id,
      logType: item.logType,
      logText: [],
      hasContent: !!item.content,
      count: 1,
    };
    for (let i = 0; i < logs.length; i++) {
      if (tool.isFunction(logs[i])) {
        curLog.logText.push(logs[i].toString());
      } else if (tool.isObject(logs[i]) || tool.isArray(logs[i])) {
        curLog.logText.push(tool.JSONStringify(logs[i]));
      } else {
        curLog.logText.push(logs[i]);
      }
    }
    curLog.logText = curLog.logText.join(' ');

    // check repeat
    if (!curLog.hasContent && preLog.logType === curLog.logType && preLog.logText === curLog.logText) {
      this.printRepeatLog();
    } else {
      this.printNewLog(item, logs);
      // save previous log
      preLog = curLog;
    }


    // scroll to bottom if it is in the bottom before
    if (this.isInBottom) {
      this.autoScrollToBottom();
    }

    // print log to origin console
    if (!item.noOrigin) {
      this.printOriginLog(item);
    }
  }

  /**
   * 
   * @protected
   */
  printRepeatLog() {
    const $item = $.one('#' + preLog._id);
    let $repeat = $.one('.vc-item-repeat', $item);
    if (!$repeat) {
      $repeat = document.createElement('i');
      $repeat.className = 'vc-item-repeat';
      $item.insertBefore($repeat, $item.lastChild);
    }
    if (!preLog.count) {
      // preLog.count = 1;
    }
    preLog.count++;
    $repeat.innerHTML = preLog.count;
    return;
  }

  /**
   * 
   * @protected
   */
  printNewLog(item, logs) {

    // create line
    let $line = $.render(tplItem, {
      _id: item._id,
      logType: item.logType,
      style: item.style || ''
    });

    let $content = $.one('.vc-item-content', $line);
    // generate content from item.logs
    for (let i = 0; i < logs.length; i++) {
      let log;
      try {
        if (logs[i] === '') {
          // ignore empty string
          continue;
        } else if (tool.isFunction(logs[i])) {
          // convert function to string
          log = '<span> ' + logs[i].toString() + '</span>';
        } else if (tool.isObject(logs[i]) || tool.isArray(logs[i])) {
          // object or array
          log = this.getFoldedLine(logs[i]);
        } else {
          // default
          log = '<span> ' + tool.htmlEncode(logs[i]).replace(/\n/g, '<br/>') + '</span>';
        }
      } catch (e) {
        log = '<span> [' + (typeof logs[i]) + ']</span>';
      }
      if (log) {
        if (typeof log === 'string')
          $content.insertAdjacentHTML('beforeend', log);
        else
          $content.insertAdjacentElement('beforeend', log);
      }
    }

    // generate content from item.content
    if (tool.isObject(item.content)) {
      $content.insertAdjacentElement('beforeend', item.content);
    }

    // render to panel
    $.one('.vc-log', this.$tabbox).insertAdjacentElement('beforeend', $line);

    // remove overflow logs
    this.logNumber++;
    this.limitMaxLogs();
  }

  /**
   * generate the HTML element of a folded line
   * @protected
   */
  getFoldedLine(obj, outer) {
    let that = this;
    if (!outer) {
      let json = tool.JSONStringify(obj);
      let preview = json.substr(0, 36);
      outer = tool.getObjName(obj);
      if (json.length > 36) {
        preview += '...';
      }
      outer += ' ' + preview;
    }
    let $line = $.render(tplFold, {
      outer: outer,
      lineType: 'obj'
    });
    $.bind($.one('.vc-fold-outer', $line), 'click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if ($.hasClass($line, 'vc-toggle')) {
        $.removeClass($line, 'vc-toggle');
        $.removeClass($.one('.vc-fold-inner', $line), 'vc-toggle');
        $.removeClass($.one('.vc-fold-outer', $line), 'vc-toggle');
      } else {
        $.addClass($line, 'vc-toggle');
        $.addClass($.one('.vc-fold-inner', $line), 'vc-toggle');
        $.addClass($.one('.vc-fold-outer', $line), 'vc-toggle');
      }
      let $content = $.one('.vc-fold-inner', $line);
      setTimeout(function () {
        if ($content.children.length == 0 && !!obj) {
          // render object's keys
          let keys = tool.getObjAllKeys(obj);
          for (let i = 0; i < keys.length; i++) {
            let val,
              valueType = 'undefined',
              keyType = '';
            try {
              val = obj[keys[i]];
            } catch (e) {
              continue;
            }
            // handle value
            if (tool.isString(val)) {
              valueType = 'string';
              val = '"' + val + '"';
            } else if (tool.isNumber(val)) {
              valueType = 'number';
            } else if (tool.isBoolean(val)) {
              valueType = 'boolean';
            } else if (tool.isNull(val)) {
              valueType = 'null';
              val = 'null';
            } else if (tool.isUndefined(val)) {
              valueType = 'undefined';
              val = 'undefined';
            } else if (tool.isFunction(val)) {
              valueType = 'function';
              val = 'function()';
            } else if (tool.isSymbol(val)) {
              valueType = 'symbol';
            }
            // render
            let $sub;
            if (tool.isArray(val)) {
              let name = tool.getObjName(val) + '[' + val.length + ']';
              $sub = that.getFoldedLine(val, $.render(tplFoldCode, {
                key: keys[i],
                keyType: keyType,
                value: name,
                valueType: 'array'
              }, true));
            } else if (tool.isObject(val)) {
              let name = tool.getObjName(val);
              $sub = that.getFoldedLine(val, $.render(tplFoldCode, {
                key: tool.htmlEncode(keys[i]),
                keyType: keyType,
                value: name,
                valueType: 'object'
              }, true));
            } else {
              if (obj.hasOwnProperty && !obj.hasOwnProperty(keys[i])) {
                keyType = 'private';
              }
              let renderData = {
                lineType: 'kv',
                key: tool.htmlEncode(keys[i]),
                keyType: keyType,
                value: tool.htmlEncode(val),
                valueType: valueType
              };
              $sub = $.render(tplFold, renderData);
            }
            $content.insertAdjacentElement('beforeend', $sub);
          }
          // render object's prototype
          if (tool.isObject(obj)) {
            let proto = obj.__proto__,
              $proto;
            if (tool.isObject(proto)) {
              $proto = that.getFoldedLine(proto, $.render(tplFoldCode, {
                key: '__proto__',
                keyType: 'private',
                value: tool.getObjName(proto),
                valueType: 'object'
              }, true));
            } else {
              // if proto is not an object, it should be `null`
              $proto = $.render(tplFoldCode, {
                key: '__proto__',
                keyType: 'private',
                value: 'null',
                valueType: 'null'
              });
            }
            $content.insertAdjacentElement('beforeend', $proto);
          }
        }
      })
      return false;
    });
    return $line;
  }

} // END class


export default VConsoleLogTab;
