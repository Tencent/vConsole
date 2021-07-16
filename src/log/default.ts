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

import $ from '../lib/query';
import * as tool from '../lib/tool';
import VConsoleLogTab from './log';
import tplTabbox from './tabbox_default.html';
import tplItemCode from './item_code.html';

class VConsoleDefaultTab extends VConsoleLogTab {
  private filterText = '';

  constructor(...args) {
    super(...args);
    this.tplTabbox = tplTabbox;
  }

  onReady() {
    const that = this;
    super.onReady();

    // do not traverse these keys to prevent "Deprecation" warning
    const keyBlackList = ['webkitStorageInfo'];

    (<any>window).winKeys = Object.getOwnPropertyNames(window).sort();
    (<any>window).keyTypes = {};
    const {winKeys, keyTypes} = <any>window;
    for (let i = 0; i < winKeys.length; i++) {
      if (keyBlackList.indexOf(winKeys[i]) > -1) {
        continue;
      }
      keyTypes[winKeys[i]] = typeof window[winKeys[i]];
    }


    const cacheObj = {};
    const ID_REGEX = /[a-zA-Z_0-9\$\-\u00A2-\uFFFF]/;
    const retrievePrecedingIdentifier = (text: string, pos: number, regex: RegExp = ID_REGEX) => {
      const buf: string[] = [];
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

    const $input = <HTMLInputElement>$.one('.vc-cmd-input');
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
                $input.value = tempValue + (<any>this).innerHTML;
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
                $input.value = (<any>this).innerHTML;
                if (keyTypes[(<any>this).innerHTML] == 'function') {
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
                  $input.value = tempValue + (<any>this).innerHTML;
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
      let $cmdInput = <HTMLInputElement>$.one('.vc-cmd-input', e.target),
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
      let $cmdInput = <HTMLInputElement>$.one('.vc-cmd.vc-filter .vc-cmd-input', e.target);
      that.filterText = $cmdInput.value;
      $.all(".vc-log>.vc-item").forEach(el=>{
        if(that.checkFilterInLine(el)){
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
    const $scriptList = document.getElementsByTagName('script');
    let nonce = '';
    // find the first script with nonce
    for (let i = 0; i < $scriptList.length; i++) {
      if ($scriptList[i].nonce) {
        nonce = $scriptList[i].nonce
        break
      }
    }
    const $script = document.createElement('SCRIPT');
    $script.innerHTML = code;
    $script.setAttribute('nonce', nonce);
    document.documentElement.appendChild($script);
    document.documentElement.removeChild($script);
  }

  beforeRenderLog($line: Element) {
    this.checkFilterInLine($line) ? $.addClass($line,'hide') : $.removeClass($line,'hide');
  }

  /**
   * replace window.console & window.onerror with vConsole method
   */
  protected mockConsole() {
    super.mockConsole();
    this.catchWindowOnError();
    this.catchResourceError();
    this.catchUnhandledRejection();
  }


  /**
   * Catch window.onerror
   */
  private catchWindowOnError() {
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
   */
  private catchUnhandledRejection() {
    if ( !(tool.isWindow(window) && tool.isFunction(window.addEventListener)) ) {
      return;
    }
    const that = this;
    window.addEventListener('unhandledrejection', function(e) {
      let error = e && e.reason;
      const errorName = 'Uncaught (in promise) ';
      let args = [errorName, error];
      if (error instanceof Error) {
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
   * Catch resource loading error: image, video, link, script
   */
   private catchResourceError() {
    const that = this;
    window.addEventListener('error', function(e) {
      const target = <any>e.target;
      // only catch resources error
      if (['link', 'video', 'script', 'img', 'audio'].indexOf(target.localName) > -1) {
        const src = target.href || target.src || target.currentSrc;
        that.printLog({
          logType: 'error',
          logs: [`GET <${target.localName}> error: ${src}`],
          noOrigin: true
        });
      }
    }, true);
  }

  /**
   * Run a command
   */
  private evalCommand(cmd: string) {
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
    (<any>window).winKeys = Object.getOwnPropertyNames(window).sort();
  }

  private checkFilterInLine($dom: Element) {
    return $dom.innerHTML.toUpperCase().indexOf(this.filterText.toUpperCase()) === -1;
  }

} // END class

export default VConsoleDefaultTab;
