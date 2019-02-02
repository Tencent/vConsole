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
  }

  onReady() {
    const that = this;
    super.onReady();

    window.winKeys = Object.getOwnPropertyNames(window).sort();
    window.keyTypes = {};
    for (let i = 0; i < winKeys.length; i++) {
      keyTypes[winKeys[i]] = typeof window[winKeys[i]];
    }

    const cacheObj = {};
    const ID_REGEX = /[a-zA-Z_0-9\$\-\u00A2-\uFFFF]/;
    const retrievePrecedingIdentifier = (text, pos, regex) => {
      regex = regex || ID_REGEX;
      const buf = [];
      for (let i = pos - 1; i >= 0; i--) {
        if (regex.test(text[i])) {
          buf.push(text[i]);
        } else {
          break;
        }
      }
      if (buf.length == 0) {
        regex = /\./;
        for (let i = pos - 1; i >= 0; i--) {
          if (regex.test(text[i])) {
            buf.push(text[i]);
          } else {
            break;
          }
        }
      }
      if (buf.length === 0) {
        const arr = (text.match(/[\(\)\[\]\{\}]/gi) || []);
        return arr[arr.length - 1];
      }
      return buf.reverse().join('');
    };

    $.bind($.one('.vc-cmd-input'), 'keyup', function (e) {
      const isDeleteKeyCode = e.keyCode === 8 || e.keyCode === 46;
      const $prompted = $.one('.vc-cmd-prompted');
      $prompted.style.display = 'none';
      $prompted.innerHTML = '';
      const tempValue = this.value;
      const value = retrievePrecedingIdentifier(this.value, this.value.length);
      if (value && value.length > 0) {
        if (/\(/.test(value) && !isDeleteKeyCode) {
          $.one('.vc-cmd-input').value += ')';
          return;
        }
        if (/\[/.test(value) && !isDeleteKeyCode) {
          $.one('.vc-cmd-input').value += ']';
          return;
        }
        if (/\{/.test(value) && !isDeleteKeyCode) {
          $.one('.vc-cmd-input').value += '}';
          return;
        }
        if ('.' === value) {
          const key = retrievePrecedingIdentifier(tempValue, tempValue.length - 1);
          if (!cacheObj[key]) {
            try {
              cacheObj[key] = Object.getOwnPropertyNames(eval('(' + key + ')')).sort();
            } catch (e) {
              ;
            }
          }
          try {
            for (let i = 0; i < cacheObj[key].length; i++) {
              const $li = document.createElement('li');
              const _key = cacheObj[key][i];
              $li.innerHTML = _key;
              $li.onclick = function () {
                $.one('.vc-cmd-input').value = '';
                $.one('.vc-cmd-input').value = tempValue + this.innerHTML;
                $prompted.style.display = 'none';
              };
              $prompted.appendChild($li);
            }
          } catch (e) {
            ;
          }
        } else if ('.' !== value.substring(value.length - 1) && value.indexOf('.') < 0) {
          for (let i = 0; i < winKeys.length; i++) {
            if (winKeys[i].toLowerCase().indexOf(value.toLowerCase()) >= 0) {
              const $li = document.createElement('li');
              $li.innerHTML = winKeys[i];
              $li.onclick = function () {
                $.one('.vc-cmd-input').value = '';
                $.one('.vc-cmd-input').value = this.innerHTML;
                if (keyTypes[this.innerHTML] == 'function') {
                  $.one('.vc-cmd-input').value += '()';
                }
                $prompted.style.display = 'none';
              };
              $prompted.appendChild($li);
            }
          }
        } else {
          const arr = value.split('.');
          if (cacheObj[arr[0]]) {
            cacheObj[arr[0]].sort();
            for (let i = 0; i < cacheObj[arr[0]].length; i++) {
              const $li = document.createElement('li');
              const _key = cacheObj[arr[0]][i];
              if (_key.indexOf(arr[1]) >= 0) {
                $li.innerHTML = _key;
                $li.onclick = function () {
                  $.one('.vc-cmd-input').value = '';
                  $.one('.vc-cmd-input').value = tempValue + this.innerHTML;
                  $prompted.style.display = 'none';
                };
                $prompted.appendChild($li);
              }
            }
          }
        }
        if ($prompted.children.length > 0) {
          const m = Math.min(200, $prompted.children.length * 31);
          $prompted.style.display = 'block';
          $prompted.style.height = m + 'px';
          $prompted.style.marginTop = -m + 'px';
        }
      } else {
        $prompted.style.display = 'none';
      }
    });

    $.bind($.one('.vc-cmd', this.$tabbox), 'submit', function (e) {
      e.preventDefault();
      let $input = $.one('.vc-cmd-input', e.target),
        cmd = $input.value;
      $input.value = '';
      if (cmd !== '') {
        that.evalCommand(cmd);
      }
      const $prompted = $.one('.vc-cmd-prompted');
      if ($prompted) {
        $prompted.style.display = 'none';
      }
    });

    // create a global letiable to save custom command's result
    let code = '';
    code += 'if (!!window) {';
    code += 'window.__vConsole_cmd_result = undefined;';
    code += 'window.__vConsole_cmd_error = false;';
    code += '}';
    let scriptList = document.getElementsByTagName('script');
    let nonce = '';
    if (scriptList.length > 0) {
      nonce = scriptList[0].nonce || ''; // get nonce to avoid `unsafe-inline`
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
    let that = this;
    if (tool.isFunction(window.onerror)) {
      this.windowOnError = window.onerror;
    }
    window.onerror = function (message, source, lineNo, colNo, error) {
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
      that.printLog({
        logType: 'error',
        logs: [msg, statckInfo],
        noOrigin: true
      });
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
      style: ''
    });
    // do not use `eval` or `new Function` to avoid `unsafe-eval` CSP rule
    /*  let code = '';
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
      document.documentElement.removeChild(script);*/
    /*    let code = '  try {';
        code += cmd;
        code += '  } catch (e) {';
        code += 'window.__vConsole_cmd_error = true;window.__vConsole_cmd_result = e.message;}';
        eval(code.replace(new RegExp('\n', 'gi'), ''));*/
    let result = void 0;

    try {
      result = eval.call(window, '(' + cmd + ')');
    } catch (e) {
      try {
        result = eval.call(window, cmd);
      } catch (e) {
        ;
      }
    }
    /*    debugger
        let result = window.__vConsole_cmd_result,
          error = window.__vConsole_cmd_error;*/

    // print result to console
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
      style: ''
    });
    window.winKeys = Object.getOwnPropertyNames(window).sort();
  }

} // END class

export default VConsoleDefaultTab;
