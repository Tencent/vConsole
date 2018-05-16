/*
Tencent is pleased to support the open source community by making vConsole available.

Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.

Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://opensource.org/licenses/MIT

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * vConsole Default Tab
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
  var winKeys = Object.getOwnPropertyNames(window).sort();

  var cache_obj = {};
  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj
  };

  function JSONStringify(stringObject, arr) {

    var formatOption = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '\t';
    var replaceString = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'CIRCULAR_DEPENDECY_OBJECT';
    var cache = [];

    var returnStringObject = JSON.stringify(stringObject, function (key, value) {
      var k = key;
      if (k != '' && isNaN(Number.parseInt(k))) {
        arr.push(key);
      }
      if ((typeof  value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value !== null) {
        if (~cache.indexOf(value)) {
          return replaceString
        }
        cache.push(value)
      }
      return value
    }, formatOption);
    cache = null;
  }
  $.one('.vc-cmd-input').onkeyup = function () {
    var prompted = $.one('.vc-cmd-prompted');
    prompted.style.display = 'none';
    prompted.innerHTML = '';
    var value = this.value;
    if (value.length > 0) {
      if ('.' == value.substring(value.length - 1)) {
        var key = value.substring(0, value.length - 1);
        if (!cache_obj[key]) {
         /* var val = [];
          cache_obj[key] = {};
          JSONStringify(eval('(' + key + ')'), val);*/
          cache_obj[key] = Object.getOwnPropertyNames(eval('(' + key + ')')).sort();
        }
        cache_obj[key].sort();
        for (var i = 0; i < cache_obj[key].length; i++) {
          var li = document.createElement('li');
          li.setAttribute('style', ' border-bottom: solid 1px');
          var _key = cache_obj[key][i];
          li.innerHTML = _key;
          li.onclick = function () {
            $.one('.vc-cmd-input').value = (value + this.innerHTML);
            prompted.style.display = 'none';
          };
          prompted.appendChild(li);
        }
      } else if ('.' != value.substring(value.length - 1) && value.indexOf('.') < 0) {
        for (var i = 0; i < winKeys.length; i++) {
          if (winKeys[i].toLowerCase().indexOf(value.toLowerCase()) >= 0) {
            var li = document.createElement('li');
            li.setAttribute('style', ' border-bottom: solid 1px');
            li.innerHTML = winKeys[i];
            li.onclick = function () {
              $.one('.vc-cmd-input').value = this.innerHTML;
              prompted.style.display = 'none';
            };
            prompted.appendChild(li);
          }
        }
      } else {
        var arr = value.split('.');
        var key = arr[0];
        if (cache_obj[arr[0]]) {
          cache_obj[arr[0]].sort();
          for (var i = 0; i < cache_obj[arr[0]].length; i++) {
            var li = document.createElement('li');
            li.setAttribute('style', ' border-bottom: solid 1px');
            var _key = cache_obj[arr[0]][i];
            if (_key.indexOf(arr[1]) >= 0) {
              li.innerHTML = _key;
              li.onclick = function () {
                $.one('.vc-cmd-input').value = (key + '.' + this.innerHTML);
                prompted.style.display = 'none';
              };
              prompted.appendChild(li);
            }
          }
        }
      }
      if (prompted.children.length > 0) {
        prompted.style.display = 'block';
        var m = prompted.children.length * 25 + 80;
        if (m > 100) {
          m = 200;
        }
        prompted.style.marginTop = -m + 'px';
      }
    } else {
      prompted.style.display = 'none';
    }
  };


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
    let scriptList = document.getElementsByTagName('script');
    let nonce = '';
    if (scriptList.length > 0) {
      nonce = scriptList[0].getAttribute('nonce') || ''; // get nonce to avoid `unsafe-inline`
    }
    let script = document.createElement('SCRIPT');
    script.innerHTML = code;
    script.setAttribute('nonce', nonce);
    document.documentElement.appendChild(script);
    document.documentElement.removeChild(script);
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
      //print error stack info
      let stack = !!error && !!error.stack;
      let statckInfo = (stack && error.stack.toString()) || '';
      that.printLog({logType:'error', logs:[msg, statckInfo], noOrigin:true});
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
    let scriptList = document.getElementsByTagName('script');
    let nonce = '';
    if (scriptList.length > 0) {
      nonce = scriptList[0].getAttribute('nonce') || ''; // get nonce to avoid `unsafe-inline`
    }
    let script = document.createElement('SCRIPT');
    script.innerHTML = code;
    script.setAttribute('nonce', nonce);
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
