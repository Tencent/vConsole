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

class VConsoleLogTab extends VConsolePlugin {

  constructor(...args) {
    super(...args);
    
    this.tplTabbox = ''; // MUST be overwrite in child class
    this.allowUnformattedLog = true; // `[xxx]` format log

    this.isReady = false;
    this.$tabbox = null;
    this.console = {};
    this.logList = [];
  }

  onAdd() {
    this.mokeConsole();
  }

  onInit() {
    this.isReady = true;
    this.$tabbox = $.render(this.tplTabbox, {});
    for (let item of this.logList) {
      this.printLog(item);
    }
    this.logList = [];
  }

  onRenderTab(callback) {
    callback(this.$tabbox);
  }

  onFinishInit() {

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
   * replace window.console & window.onerror with vConsole method
   * @private
   */
  mokeConsole() {
    if (!window.console) {
      return;
    }
    let that = this;
    this.console.log = window.console.log;
    this.console.info = window.console.info;
    this.console.warn = window.console.warn;
    this.console.debug = window.console.debug;
    this.console.error = window.console.error;
    window.console.log = function() { that.printLog({logType:'log', logs:arguments}); };
    window.console.info = function() { that.printLog({logType:'info', logs:arguments}); };
    window.console.warn = function() { that.printLog({logType:'warn', logs:arguments}); };
    window.console.debug = function() { that.printLog({logType:'debug', logs:arguments}); };
    window.console.error = function() { that.printLog({logType:'error', logs:arguments}); };

    window.onerror = function(message, source, lineNo, colNo, error) {
      let stack = error.stack.split('at');
      stack = stack[0] + ' ' + stack[1];
      stack = stack.replace(location.origin, '');
      console.error(stack);
    };
  }

  /**
   * print log to origin console
   * @private
   */
  printOriginLog(item) {
    this.console[item.logType].apply(window.console, item.logs);
  }

  /**
   * print a log to log box
   * @private
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
    if (tool.isString(logs[0])) {
      let match = logs[0].match(pattern);
      if (match !== null && match.length > 0) {
        let tabName = match[1].toLowerCase();
        shouldBeHere = (tabName == this.id);
      } else if (this.allowUnformattedLog == false) {
        shouldBeHere = false;
      }
    }

    if (!shouldBeHere) {
      // ignore this log and throw it to origin console
      this.printOriginLog(item);
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
        if (logs[i] == '') {
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
    let $item = $.render(tplItem, {
      logType: item.logType, 
      content: line, 
      date: date.hour + ':' + date.minute + ':' + date.second
    });
    $.one('.vc-log', this.$tabbox).appendChild($item);
    $.one('.vc-content').scrollTop = $.one('.vc-content').scrollHeight;

    // print log to origin console
    this.printOriginLog(item);
  }

  /**
   * generate the HTML of a folded line
   * @private
   */
  getFoldedLine(obj, outerText) {
    var json = JSON.stringify(obj);
    var outer = '',
        inner = '',
        preview = '';
    var lv = 0,
        p = '  ';

    preview = json.substr(0, 30);
    if (json.length > 30) {
      preview += '...';
    }

    outer = Object.prototype.toString.call(obj).replace('[object ', '').replace(']', '');
    outer += ' ' + preview;
    
    function _iterateObj(val) {
      if (tool.isObject(val)) {
        var keys = Object.keys(val);
        inner += "{\n";
        lv++;
        for (var i=0; i<keys.length; i++) {
          var k = keys[i];
          if (!val.hasOwnProperty(k)) { continue; }
          inner += Array(lv + 1).join(p) + '<i class="vc-code-key">' + k + "</i>: ";
          _iterateObj(val[k]);
          if (i < keys.length - 1) {
            inner += ",\n";
          }
        }
        lv--;
        inner += "\n" + Array(lv + 1).join(p) + "}";
      } else if (tool.isArray(val)) {
        inner += "[\n";
        lv++;
        for (var i=0; i<val.length; i++) {
          inner += Array(lv + 1).join(p) + '<i class="vc-code-key">' + i + "</i>: ";
          _iterateObj(val[i]);
          if (i < val.length - 1) {
            inner += ",\n";
          }
        }
        lv--;
        inner += "\n" + Array(lv + 1).join(p) + "]";
      } else {
        if (tool.isString(val)) {
          inner += '<i class="vc-code-string">"' + val + '"</i>';
        } else if (tool.isNumber(val)) {
          inner += '<i class="vc-code-number">' + val + "</i>";
        } else {
          inner += JSON.stringify(val);
        }
      }
    }
    _iterateObj(obj);

    var line = $.render(tplFold, {outer: outer, inner: inner}, true);
    return line;
  }

} // END class


export default VConsoleLogTab;