/**
 * vConsole Default Tab
 *
 * @author WechatFE
 */

import $ from '../lib/query.js';
import * as tool from '../lib/tool.js';
import VConsoleLogTab from './log.js';
import tplTabbox from './tabbox_default.html';
import tplItemCode from './item_code.html';

class VConsoleDefaultTab extends VConsoleLogTab {

  constructor(...args) {
    super(...args);
    this.tplTabbox = tplTabbox;
    this.windowOnError = null;
  }

  onReady() {
    let that = this;
    super.onReady();

    $.bind($.one('.vc-cmd', this.$tabbox), 'submit', function(e) {
      e.preventDefault();
      let $input = $.one('.vc-cmd-input', e.target),
        cmd = $input.value;
      $input.value = '';
      if (cmd !== '') {
        that.evalCommand(cmd);
      }
    });

    // create a global variable to save custom command's result
    let code = '';
    code += 'if (!!window) {';
    code += 'window.__vConsole_cmd_result = undefined;';
    code += 'window.__vConsole_cmd_error = false;';
    code += '}';
    let script = document.createElement('SCRIPT');
    script.innerHTML = code;
    document.documentElement.appendChild(script);
    document.documentElement.removeChild(script);
  }

  printLog(item) {
    let logs = item.logs || [];
    if (!logs.length && !item.content) {
      return;
    }

    // convert logs to a real array
    logs = [].slice.call(logs || []);
    // check `[default]` format
    let shouldBeHere = true;
    let pattern = /^\[(\w+)\] ?/i;
    let targetTabName = '';
    let targetTabID = '';
    if (tool.isString(logs[0])) {
      let match = logs[0].match(pattern);
      if (match !== null && match.length > 0) {
        targetTabName = match[1];
        targetTabID = targetTabName.toLowerCase();
      }
    }
    if (targetTabID && targetTabID !== this.id && !this.host.pluginList[targetTabID]) {
      const newTab = new this.VConsoleGeneralTab(targetTabID, targetTabName)
      newTab.host = this.host
      this.host.addPlugin(newTab)
      newTab.printLog(item)
      return
    }

    super.printLog(item);
  }

  /**
   * replace window.console & window.onerror with vConsole method
   * @private
   */
  mockConsole() {
    super.mockConsole();
    var that = this;
    if (tool.isFunction(window.onerror)) {
      this.windowOnError = window.onerror;
    }
    window.onerror = function(message, source, lineNo, colNo, error) {
      let msg = message;
      if (source) {
        msg += "\n" + source.replace(location.origin, '');
      }
      if (lineNo || colNo) {
        msg += ':' + lineNo + ':' + colNo;
      }
      that.printLog({logType:'error', logs:[msg], noOrigin:true});
      if (tool.isFunction(that.windowOnError)) {
        that.windowOnError.call(window, message, source, lineNo, colNo, error);
      }
    };
  }

  /**
   *
   * @private
   */
  evalCommand(cmd) {
    // print command to console
    this.printLog({
      logType: 'log',
      content: $.render(tplItemCode, {content: cmd, type: 'input'}),
      noMeta: true,
      style: ''
    });
    // do not use `eval` or `new Function` to avoid `unsafe-eval` CSP rule
    let code = '';
    code += 'try {\n';
    code +=   'window.__vConsole_cmd_result = (function() {\n';
    code +=     'return ' + cmd + ';\n';
    code +=   '})();\n';
    code +=   'window.__vConsole_cmd_error = false;\n';
    code += '} catch (e) {\n';
    code +=   'window.__vConsole_cmd_result = e.message;\n';
    code +=   'window.__vConsole_cmd_error = true;\n';
    code += '}';
    let script = document.createElement('SCRIPT');
    script.innerHTML = code;
    document.documentElement.appendChild(script);
    let result = window.__vConsole_cmd_result,
        error = window.__vConsole_cmd_error;
    document.documentElement.removeChild(script);
    // print result to console
    if (error == false) {
      let $content;
      if (tool.isArray(result) || tool.isObject(result)) {
        $content = this.getFoldedLine(result);
      } else {
        if (tool.isNull(result)) {
          result = 'null';
        } else if (tool.isUndefined(result)) {
          result = 'undefined';
        } else if (tool.isFunction(result)) {
          result = 'function()'
        } else if (tool.isString(result)) {
          result = '"' + result + '"';
        }
        $content = $.render(tplItemCode, {content: result, type: 'output'});
      }
      this.printLog({
        logType: 'log',
        content: $content,
        noMeta: true,
        style: ''
      });
    } else {
      this.printLog({
        logType: 'error',
        logs: [result],
        noMeta: true,
        style: ''
      });
    }
  }

} // END class

export default VConsoleDefaultTab;
