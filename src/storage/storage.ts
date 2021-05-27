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

import VConsolePlugin from '../lib/plugin';
import tplTabbox from './tabbox.html';
import tplList from './list.html';
import tplItem from './item.html';

import VConsoleItemCopy from '../component/item_copy';
import * as tool from '../lib/tool';
import $ from '../lib/query';

declare type VConsoleStorageType = 'cookies' | 'localstorage' | 'sessionstorage';

declare interface VConsoleStorageRawItem {
  name: string;
  value: string;
}

declare interface VConsoleStorageItem extends VConsoleStorageRawItem {
  id: string;
  previewValue: string;
  showPreview: boolean;
  bytes: number;
  bytesText: string;
}

class VConsoleStorageTab extends VConsolePlugin {
  protected list: VConsoleStorageItem[] = [];
  protected $domList: { [id: string]: Element } = {};
  private $tabbox: Element = $.render(tplTabbox, {});
  private currentType: '' | VConsoleStorageType = '';
  private typeNameMap = {
    'cookies': 'Cookies',
    'localstorage': 'LocalStorage',
    'sessionstorage': 'SessionStorage'
  };


  onRenderTab(callback) {
    callback(this.$tabbox);
  }

  onAddTopBar(callback) {
    const that = this;
    const types = Object.values(this.typeNameMap); // ['Cookies', 'LocalStorage', 'SessionStorage'];
    const btnList: Array<{name: string, data: {}, className: string, onClick: Function}> = [];
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
    const that = this;
    const toolList = [{
      name: 'Refresh',
      global: false,
      onClick: function(e) {
        that.renderStorage();
      }
    }, {
      name: 'ClearAll',
      global: false,
      onClick: function(e) {
        that.clearLog();
      }
    }];
    callback(toolList);
  }

  onReady() {
    // copy
    VConsoleItemCopy.delegate(this.$tabbox, (id: string) => {
      let text = null;
      for (let i = 0; i < this.list.length; i++) {
        if (this.list[i].id === id) {
          text = this.list[i].name + '=' + this.list[i].value;
          break;
        }
      }
      return text;
    });

    // delete
    $.delegate(this.$tabbox, 'click', '.vc-item-delete', (e) => {
      const { id } = (<Element>e.target).closest('.vc-item-id');
      const item = this.getListItem(id);
      if (!item || !window.confirm) { return; }
      if (!window.confirm(`Delete this record?`)) { return; }

      const result = this.deleteItem(item.name);
      if (!result) { return; }

      const $dom = this.$domList[id];
      $dom.parentElement.removeChild($dom);
      delete this.$domList[id];

      for (let i = 0; i < this.list.length; i++) {
        if (this.list[i].id === id) {
          this.list.splice(i, 1);
          break;
        }
      }
    });

    // show more
    $.delegate(this.$tabbox, 'click', '.vc-item-showmore', (e) => {
      const { id } = (<Element>e.target).closest('.vc-item-id');
      let item: VConsoleStorageItem;
      for (let i = 0; i < this.list.length; i++) {
        if (this.list[i].id === id) {
          item = this.list[i];
          break;
        }
      }
      if (!item) { return; }

      item.showPreview = false;
      item.value = this.getItemValue(item.name);

      const $dom = $.render(tplItem, {
        item: item,
        btnCopy: VConsoleItemCopy.html,
      });
      this.$domList[id].replaceWith($dom);
      this.$domList[id] = $dom;
    });
  }

  onShow() {
    // show default panel
    if (this.currentType === '') {
      this.currentType = 'cookies';
      this.renderStorage();
    }
  }

  clearLog() {
    if (this.currentType && window.confirm) {
      const result = window.confirm(`Delete all ${this.typeNameMap[this.currentType]}?`);
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
      case 'sessionstorage':
        this.clearSessionStorageList();
        break;
      default:
        return false;
    }
    this.renderStorage();
  }

  renderStorage() {
    const PREVIEW_LIMIT = 1024 * 1; // KB
    let list: VConsoleStorageRawItem[] = [];

    const $log = $.one('.vc-log', this.$tabbox);
    $.removeChildren($log);
    this.list = [];
    this.$domList = {};

    switch (this.currentType) {
      case 'cookies':
        list = this.getCookieList();
        break;
      case 'localstorage':
        list = this.getLocalStorageList();
        break;
      case 'sessionstorage':
        list = this.getSessionStorageList();
        break;
      default:
        return false;
    }

    if (list.length > 0) {
      const $table = $.render(tplList, {});
      const $list = $.one('.vc-storage-list', $table);

      for (let i = 0; i < list.length; i++) {
        const bytes = tool.getStringBytes(list[i].value);
        const id = this.getUniqueID();
        const item: VConsoleStorageItem = {
          id: id,
          name: list[i].name,
          value: '', // do not keep raw value to save memory
          previewValue: '',
          showPreview: false,
          bytes: bytes,
          bytesText: tool.getBytesText(bytes),
        };
        if (item.bytes > PREVIEW_LIMIT) {
          item.previewValue = tool.subString(list[i].value, PREVIEW_LIMIT);
          item.showPreview = true;
        } else {
          item.value = list[i].value;
        }
        this.list.push(item);

        const $dom = $.render(tplItem, {
          item: item,
          btnCopy: VConsoleItemCopy.html,
        });
        this.$domList[id] = $dom;
        $list.appendChild($dom);
      }
      
      $log.appendChild($table);
    }
  }

  getItemValue(key: string) {
    switch (this.currentType) {
      case 'cookies':
        return this.getCookieValue(key);
        break;
      case 'localstorage':
        return this.getLocalStorageValue(key);
        break;
      case 'sessionstorage':
        return this.getSessionStorageValue(key);
        break;
      default:
        return '';
    }
  }

  private deleteItem(key: string) {
    switch (this.currentType) {
      case 'cookies':
        return this.deleteCookie(key);
      case 'localstorage':
        return this.deleteLocalStorage(key);
      case 'sessionstorage':
        return this.deleteSessionStorage(key);
    }
    return false;
  }

  deleteCookie(key: string) {
    if (!document.cookie || !navigator.cookieEnabled) {
      return false;
    }
    const uris = window.location.hostname.split('.');
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    let uri = '.' + uris[uris.length - 1];
    for (let j = uris.length - 2; j >= 0; j--) {
      uri = '.' + uris[j] + uri;
      document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${uri};`;
    }
    return true;
  }

  getCookieValue(key: string) {
    if (!document.cookie || !navigator.cookieEnabled) {
      return '';
    }

    const items = document.cookie.split(';');
    for (let i=0; i<items.length; i++) {
      let item = items[i].split('=');
      let name = item.shift().replace(/^ /, ''),
          value = item.join('=');
      try {
        name = decodeURIComponent(name);
        value = decodeURIComponent(value);
      } catch(e) {
        
      }
      if (name === key) {
        return value;
      }
    }
    return '';
  }

  getCookieList() {
    if (!document.cookie || !navigator.cookieEnabled) {
      return [];
    }

    let list: VConsoleStorageRawItem[] = [];
    let items = document.cookie.split(';');
    for (let i=0; i<items.length; i++) {
      let item = items[i].split('=');
      let name = item.shift().replace(/^ /, ''),
          value = item.join('=');
      try {
        name = decodeURIComponent(name);
        value = decodeURIComponent(value);
      } catch(e) {
        // do not print external input directly to prevent forgery (issue #345)
        // console.log(e, name, value);
      }
      list.push({
        name: name,
        value: value
      });
    }
    return list;
  }

  deleteLocalStorage(key: string) {
    if (!window.localStorage) { return false; }
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  getLocalStorageValue(key: string) {
    if (!window.localStorage) {
      return '';
    }
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return '';
    }
  }

  getLocalStorageList() {
    if (!window.localStorage) {
      return [];
    }

    try {
      let list: VConsoleStorageRawItem[] = []
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

  deleteSessionStorage(key: string) {
    if (!window.sessionStorage) { return false; }
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  getSessionStorageValue(key: string) {
    if (!window.sessionStorage) {
      return '';
    }
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      return '';
    }
  }

  getSessionStorageList() {
    if (!window.sessionStorage) {
      return [];
    }

    try {
      let list: VConsoleStorageRawItem[] = []
      for (var i = 0; i < sessionStorage.length; i++) {
        let name = sessionStorage.key(i),
            value = sessionStorage.getItem(name);
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
    const uris = window.location.hostname.split('.');
    let list = this.getCookieList();
    for (var i=0; i<list.length; i++) {
      let name = list[i].name;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      let uri = '.' + uris[uris.length - 1];
      for (let j = uris.length - 2; j >= 0; j--) {
        uri = '.' + uris[j] + uri;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${uri};`;
      }
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
  clearSessionStorageList() {
    if (!!window.sessionStorage) {
      try {
        sessionStorage.clear();
        this.renderStorage();
      } catch (e) {
        alert('sessionStorage.clear() fail.');
      }
    }
  }

  private getListItem(id: string) {
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].id === id) {
        return this.list[i];
      }
    }
    return null;
  }

} // END Class

export default VConsoleStorageTab;