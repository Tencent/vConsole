/**
 * vConsole Basic Log Tab
 *
 * @author WechatFE
 */

import * as tool from '../lib/tool.js';
import $ from '../lib/query.js';
import VConsolePlugin from '../lib/plugin.js';
import tplItem from './item.html';
import tplFold from './item_fold.html';
import tplFoldCode from './item_fold_code.html';

class VConsoleLogTab extends VConsolePlugin {

  constructor(...args) {
    super(...args);
    
    this.tplTabbox = ''; // MUST be overwrite in child class
    this.allowUnformattedLog = true; // `[xxx]` format log

    this.isReady = false;
    this.$tabbox = null;
    this.console = {};
    this.logList = [];

    this.mockConsole();
  }

  /**
   * when vConsole is ready, 
   * this event will be triggered (after 'add' event)
   * @public
   */
  onInit() {
    this.isReady = true;
    this.$tabbox = $.render(this.tplTabbox, {});
    for (let i=0; i<this.logList.length; i++) {
      this.printLog(this.logList[i]);
    }
    this.logList = [];
  }

  /**
   * this event will make this plugin be registered as a tab
   * @public
   */
  onRenderTab(callback) {
    callback(this.$tabbox);
  }

  onAddTool(callback) {
    var that = this;
    var toolList = [{
      name: 'Clear',
      global: false,
      onClick: function(e) {
        that.clearLog();
      }
    }];
    callback(toolList);
  }

  /**
   * after init
   * @public
   */
  onReady() {

    $.bind($.one('.vc-log', this.$tabbox), 'click', function(e) {
      var target = e.target;
      // expand a line
      if ($.hasClass(target, 'vc-fold-outer')) {
        if ($.hasClass(target.parentElement, 'vc-toggle')) {
          $.removeClass(target.parentElement, 'vc-toggle');
        } else {
          $.addClass(target.parentElement, 'vc-toggle');
        }
        e.preventDefault();
      }
    });

  }

  /**
   * replace window.console with vConsole method
   * @private
   */
  mockConsole() {
    let that = this;
    if (!window.console) {
      window.console = {};
    } else {
      this.console.log = window.console.log;
      this.console.info = window.console.info;
      this.console.warn = window.console.warn;
      this.console.debug = window.console.debug;
      this.console.error = window.console.error;
    }
    window.console.log = function() { that.printLog({logType:'log', logs:arguments}); };
    window.console.info = function() { that.printLog({logType:'info', logs:arguments}); };
    window.console.warn = function() { that.printLog({logType:'warn', logs:arguments}); };
    window.console.debug = function() { that.printLog({logType:'debug', logs:arguments}); };
    window.console.error = function() { that.printLog({logType:'error', logs:arguments}); };
  }

  clearLog() {
    $.one('.vc-log', this.$tabbox).innerHTML = '';
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
   * @param  string  tabName    auto|default|system
   * @param  string  logType    log|info|debug|error|warn
   * @param  array  logs
   */
  printLog(item) {
    let logs = item.logs;
    if (!logs.length) {
      return;
    }

    // convert logs to an array
    logs = [].slice.call(logs);

    // check `[default]` format
    let shouldBeHere = true;
    let pattern = /^\[(\w+)\] ?/i;
    let targetTabName = '';
    if (tool.isString(logs[0])) {
      let match = logs[0].match(pattern);
      if (match !== null && match.length > 0) {
        targetTabName = match[1].toLowerCase();
      }
    }
    if (targetTabName) {
      shouldBeHere = (targetTabName == this.id);
    } else if (this.allowUnformattedLog == false) {
      shouldBeHere = false;
    }

    if (!shouldBeHere) {
      // ignore this log and throw it to origin console
      if (!item.noOrigin) {
        this.printOriginLog(item);
      }
      return;
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
    if (tool.isString(logs[0])) {
      logs[0] = logs[0].replace(pattern, '');
      if (logs[0] === '') {
        logs.shift();
      }
    }

    // generate plain text for a line
    let line = '';
    for (let i=0; i<logs.length; i++) {
      try {
        if (logs[i] === '') {
          // ignore empty string
          continue;
        } else if (tool.isFunction(logs[i])) {
          // convert function to string
          line += ' ' + logs[i].toString();
        } else if (tool.isObject(logs[i]) || tool.isArray(logs[i])) {
          // object or array
          line += ' ' + this.getFoldedLine(logs[i]);
        } else {
          // default
          line += ' ' + tool.htmlEncode(logs[i]).replace(/\n/g, '<br/>');
        }
      } catch (e) {
        line += ' [' + (typeof logs[i]) + ']';
      }
    }

    // render
    let date = tool.getDate(item.date);
    this.renderLog({
      logType: item.logType,
      content: line,
      meta: date.hour + ':' + date.minute + ':' + date.second,
      style: ''
    });

    // print log to origin console
    if (!item.noOrigin) {
      this.printOriginLog(item);
    }
  }

  /**
   * render a log
   * @protected
   */
  renderLog(item) {
    let $item = $.render(tplItem, item);
    $.one('.vc-log', this.$tabbox).appendChild($item);
    $.one('.vc-content').scrollTop = $.one('.vc-content').scrollHeight;
  }

  /**
   * generate the HTML of a folded line
   * @protected
   */
  getFoldedLine(obj) {
    let json = tool.JSONStringify(obj);
    let outer = '',
        inner = '',
        preview = '';
    let lv = 0,
        p = '  ';

    preview = json.substr(0, 26);
    if (json.length > 26) {
      preview += '...';
    }

    outer = Object.prototype.toString.call(obj).replace('[object ', '').replace(']', '');
    outer += ' ' + preview;

    // use a map to track parent relationship
    let objMap = [];
    function _hasSameParentAsChild(child) {
      // find upper item which child is equal to this child
      for (let i = objMap.length - 1; i >= 0; i--) {
        if (objMap[i].child == child) {
          return true;
        }
      }
      return false;
    }
    
    function _iterateObj(val, parent) {

      if (tool.isObject(val)) {
        // object
        if (_hasSameParentAsChild(val)) {
          // this object is circular, skip it
          inner += "{Circular Object}";
          return;
        }
        objMap.push({parent: parent, child: val});

        let keys = Object.keys(val);
        inner += "{\n";
        lv++;
        for (let i=0; i<keys.length; i++) {
          let k = keys[i];
          if (!val.hasOwnProperty(k)) { continue; }
          inner += Array(lv + 1).join(p) + $.render(tplFoldCode, {type:'key', code:k}, true) + ': ';
          _iterateObj(val[k], val);
          if (i < keys.length - 1) {
            inner += ",\n";
          }
        }
        lv--;
        inner += "\n" + Array(lv + 1).join(p) + "}";

        objMap.pop();
      } else if (tool.isArray(val)) {
        // array
        if (_hasSameParentAsChild(val)) {
          // this array is circular, skip it
          inner += "[Circular Array]";
          return;
        }
        objMap.push({parent: parent, child: val});

        inner += "[\n";
        lv++;
        for (let i=0; i<val.length; i++) {
          inner += Array(lv + 1).join(p) + $.render(tplFoldCode, {type:'key', code:i}, true) + ': ';
          _iterateObj(val[i], val);
          if (i < val.length - 1) {
            inner += ",\n";
          }
        }
        lv--;
        inner += "\n" + Array(lv + 1).join(p) + "]";

        objMap.pop();
      } else if (tool.isString(val)) {
        inner += $.render(tplFoldCode, {type:'string', code:'"'+tool.htmlEncode(val)+'"'}, true);
      } else if (tool.isNumber(val)) {
        inner += $.render(tplFoldCode, {type:'number', code:val}, true);
      } else if (tool.isBoolean(val)) {
        inner += $.render(tplFoldCode, {type:'boolean', code:val}, true);
      } else if (tool.isNull(val)) {
        inner += $.render(tplFoldCode, {type:'null', code:'null'}, true);
      } else if (tool.isUndefined(val)) {
        inner += $.render(tplFoldCode, {type:'undefined', code:'undefined'}, true);
      } else if (tool.isFunction(val)) {
        inner += $.render(tplFoldCode, {type:'function', code:'function()'}, true);
      } else {
        inner += JSON.stringify(val);
      }
    }
    _iterateObj(obj, null);

    let line = $.render(tplFold, {outer: outer, inner: inner}, true);
    return line;
  }

} // END class


export default VConsoleLogTab;