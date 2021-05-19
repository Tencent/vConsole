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

import $ from '../lib/query.ts';
import * as tool from '../lib/tool.ts';
import VConsoleLogTab from './log.js';
import tplTabbox from './tabbox_default.html';
import tplItemCode from './item_code.html';
let filterText = "";
const checkFilterInLine = (dom) =>{
  return dom.innerHTML.toUpperCase().indexOf(filterText.toUpperCase()) === -1
};
class VConsoleDefaultTab extends VConsoleLogTab {

  constructor(...args) {
    super(...args);
    this.tplTabbox = tplTabbox;
  }
  formatLine ($line){
    checkFilterInLine($line) ? $.addClass($line,'hide'):$.removeClass($line,'hide')
    return $line
  }

  onReady() {
    const that = this;
    super.onReady();

    // do not traverse these keys to prevent "Deprecation" warning
    const keyBlackList = ['webkitStorageInfo'];

    window.winKeys = Object.getOwnPropertyNames(window).sort();
    window.keyTypes = {};
    for (let i = 0; i < winKeys.length; i++) {
      if (keyBlackList.indexOf(winKeys[i]) > -1) {
        continue;
      }
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
    const moveCursorToPos = ($dom, pos) => {
      if ($dom.setSelectionRange) {
        $dom.setSelectionRange(pos, pos);
      }
    };

    const $input = $.one('.vc-cmd-input');

    $.bind($input, 'keyup', function (e) {
      const isDeleteKeyCode = e.keyCode === 8 || e.keyCode === 46;
      const $prompted = $.one('.vc-cmd-prompted');
      $prompted.style.display = 'none';
      $prompted.innerHTML = '';
      const tempValue = this.value;
      const value = retrievePrecedingIdentifier(this.value, this.value.length);
      if (value && value.length > 0) {
        if (/\(/.test(value) && !isDeleteKeyCode) {
          $input.value += ')';
          moveCursorToPos($input, $input.value.length - 1);
          return;
        }
        if (/\[/.test(value) && !isDeleteKeyCode) {
          $input.value += ']';
          moveCursorToPos($input, $input.value.length - 1);
          return;
        }
        if (/\{/.test(value) && !isDeleteKeyCode) {
          $input.value += '}';
          moveCursorToPos($input, $input.value.length - 1);
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
                $input.value = '';
                $input.value = tempValue + this.innerHTML;
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
                $input.value = '';
                $input.value = this.innerHTML;
                if (keyTypes[this.innerHTML] == 'function') {
                  $input.value += '()';
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
                  $input.value = '';
                  $input.value = tempValue + this.innerHTML;
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
      let $cmdInput = $.one('.vc-cmd-input', e.target),
        cmd = $cmdInput.value;
      $cmdInput.value = '';
      if (cmd !== '') {
        that.evalCommand(cmd);
      }
      const $prompted = $.one('.vc-cmd-prompted');
      if ($prompted) {
        $prompted.style.display = 'none';
      }
    });
    $.bind($.one('.vc-cmd.vc-filter', this.$tabbox), 'submit', function (e) {
      e.preventDefault();
      let $cmdInput = $.one('.vc-cmd.vc-filter .vc-cmd-input', e.target);
      filterText = $cmdInput.value;
      $.all(".vc-log>.vc-item").forEach(el=>{
        if(checkFilterInLine(el)){
          $.addClass(el,'hide')
        }else{
          $.removeClass(el,'hide')
        }
      })
    });

    // create a global letiable to save custom command's result
    let code = '';
    code += 'if (!!window) {';
    code += 'window.__vConsole_cmd_result = undefined;';
    code += 'window.__vConsole_cmd_error = false;';
    code += '}';
    let scriptList = document.getElementsByTagName('script');
    let nonce = '';
    // find the first script with nonce
    for (let script of scriptList) {
      if (script.nonce) {
        nonce = script.nonce
        break
      }
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
    this.cacheWindowOnError();
    this.catchUnhandledRejection();
  }


  /**
   * Cache window.onerror
   * @private
   */
  cacheWindowOnError() {
    const that = this;
    window.addEventListener('error', function(event) {
      let msg = event.message;
      if (event.filename) {
        msg += "\n" + event.filename.replace(location.origin, '');
      }
      if (event.lineno || event.colno) {
        msg += ':' + event.lineno + ':' + event.colno;
      }
      // print error stack info
      const hasStack = !!event.error && !!event.error.stack;
      const statckInfo = (hasStack && event.error.stack.toString()) || '';
      that.printLog({
        logType: 'error',
        logs: [msg, statckInfo],
        noOrigin: true
      });
    });
  }

  /**
   * Promise.reject has no rejection handler
   * about https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event
   * @private
   */
  catchUnhandledRejection() {
    if ( !(tool.isWindow(window) && tool.isFunction(window.addEventListener)) ) {
      return;
    }
    const that = this;
    window.addEventListener('unhandledrejection', function (e) {
      let error = e && e.reason;
      const errorName = 'Uncaught (in promise) ';
      let args = [errorName, error];
      if(error instanceof Error){
        args = [
          errorName, 
          {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        ]
      }
      that.printLog({
        logType: 'error',
        logs: args,
        noOrigin: true
      });
    });
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
