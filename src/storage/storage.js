/*
Tencent is pleased to support the open source community by making vConsole available.

Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.

Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://opensource.org/licenses/MIT

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * vConsole Storage Plugin
 */

import VConsolePlugin from '../lib/plugin.js';
import tplTabbox from './tabbox.html';
import tplList from './list.html';

import * as tool from '../lib/tool.js';
import $ from '../lib/query.js';

class VConsoleStorageTab extends VConsolePlugin {

  constructor(...args) {
    super(...args);

    this.$tabbox = $.render(tplTabbox, {});
    this.currentType = ''; // cookies, localstorage, ...
    this.typeNameMap = {
      'cookies': 'Cookies',
      'localstorage': 'LocalStorage'
    }
  }

  onRenderTab(callback) {
    callback(this.$tabbox);
  }

  onAddTopBar(callback) {
    let that = this;
    let types = ['Cookies', 'LocalStorage'];
    let btnList = [];
    for (let i = 0; i < types.length; i++) {
      btnList.push({
        name: types[i],
        data: {
          type: types[i].toLowerCase()
        },
        className: '',
        onClick: function() {
          if (!$.hasClass(this, 'vc-actived')) {
            that.currentType = this.dataset.type;
            that.renderStorage();
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
      name: 'Refresh',
      global: false,
      onClick: function(e) {
        that.renderStorage();
      }
    }, {
      name: 'Clear',
      global: false,
      onClick: function(e) {
        that.clearLog();
      }
    }];
    callback(toolList);
  }

  onReady() {
    // do nothing
  }

  onShow() {
    // show default panel
    if (this.currentType == '') {
      this.currentType = 'cookies';
      this.renderStorage();
    }
  }

  clearLog() {
    if (this.currentType && window.confirm) {
      let result = window.confirm('Remove all ' + this.typeNameMap[this.currentType] + '?');
      if (!result) {
        return false;
      }
    }
    switch (this.currentType) {
      case 'cookies':
        this.clearCookieList();
        break;
      case 'localstorage':
        this.clearLocalStorageList();
        break;
      default:
        return false;
    }
    this.renderStorage();
  }

  renderStorage() {
    let list = [];

    switch (this.currentType) {
      case 'cookies':
        list = this.getCookieList();
        break;
      case 'localstorage':
        list = this.getLocalStorageList();
        break;
      default:
        return false;
    }

    let $log = $.one('.vc-log', this.$tabbox);
    if (list.length == 0) {
      $log.innerHTML = '';
    } else {
      // html encode for rendering
      for (let i=0; i<list.length; i++) {
        list[i].name = tool.htmlEncode(list[i].name);
        list[i].value = tool.htmlEncode(list[i].value);
      }
      $log.innerHTML = $.render(tplList, {list: list}, true);
    }
  }

  getCookieList() {
    if (!document.cookie || !navigator.cookieEnabled) {
      return [];
    }

    let list = [];
    let items = document.cookie.split(';');
    for (let i=0; i<items.length; i++) {
      let item = items[i].split('=');
      let name = item[0].replace(/^ /, ''),
          value = item[1];
      list.push({
        name: decodeURIComponent(name),
        value: decodeURIComponent(value)
      });
    }
    return list;
  }

  getLocalStorageList() {
    if (!window.localStorage) {
      return [];
    }

    try {
      let list = []
      for (var i = 0; i < localStorage.length; i++) {
        let name = localStorage.key(i),
            value = localStorage.getItem(name);
        list.push({
          name: name,
          value: value
        });
      }
      return list;
    } catch (e) {
      return [];
    }
  }

  clearCookieList() {
    if (!document.cookie || !navigator.cookieEnabled) {
      return;
    }

    let list = this.getCookieList();
    for (var i=0; i<list.length; i++) {
      document.cookie = list[i].name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    this.renderStorage();
  }

  clearLocalStorageList() {
    if (!!window.localStorage) {
      try {
        localStorage.clear();
        this.renderStorage();
      } catch (e) {
        alert('localStorage.clear() fail.');
      }
    }
  }

} // END Class

export default VConsoleStorageTab;