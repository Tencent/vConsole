/*
Tencent is pleased to support the open source community by making vConsole available.

Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.

Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://opensource.org/licenses/MIT

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * vConsole core class
 */

import pkg from '../../package.json';
import * as tool from '../lib/tool';
import $ from '../lib/query';

import './core.less';
import tpl from './core.html';
import tplTabbar from './tabbar.html';
import tplTabbox from './tabbox.html';
import tplTopBarItem from './topbar_item.html';
import tplToolItem from './tool_item.html';

// built-in plugins
import VConsolePlugin from '../lib/plugin';
import VConsoleLogPlugin from '../log/log';
import VConsoleDefaultPlugin from '../log/default';
import VConsoleSystemPlugin from '../log/system';
import VConsoleNetworkPlugin from '../network/network';
import VConsoleElementPlugin from '../element/element';
import VConsoleStoragePlugin from '../storage/storage';

declare interface VConsoleOptions {
  defaultPlugins?: string[];
  maxLogNumber?: number;
  theme?: '' | 'dark' | 'light';
  disableLogScrolling?: boolean;
  onReady?: Function;
  onClearLog?: Function;
}

const VCONSOLE_ID = '#__vconsole';

class VConsole {
  version: string;
  $dom: HTMLElement;
  isInited: boolean;
  option: VConsoleOptions = {};
  activedTab: string;
  tabList: any[];
  pluginList: {};
  switchPos: {
    hasMoved: boolean; // exclude click event
    x: number; // right
    y: number; // bottom
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };

  // export helper functions to public
  tool = tool;
  $ = $;

  // export static class
  static VConsolePlugin = VConsolePlugin;
  static VConsoleLogPlugin = VConsoleLogPlugin;
  static VConsoleDefaultPlugin = VConsoleDefaultPlugin;
  static VConsoleSystemPlugin = VConsoleSystemPlugin;
  static VConsoleNetworkPlugin = VConsoleNetworkPlugin;
  static VConsoleElementPlugin = VConsoleElementPlugin;
  static VConsoleStoragePlugin = VConsoleStoragePlugin;

  constructor(opt) {
    if (!!$.one(VCONSOLE_ID)) {
      console.debug('vConsole is already exists.');
      return;
    }
    let that = this;

    this.version = pkg.version;
    this.$dom = null;

    this.isInited = false;
    this.option = {
      defaultPlugins: ['system', 'network', 'element', 'storage']
    };

    this.activedTab = '';
    this.tabList = [];
    this.pluginList = {};

    this.switchPos = {
      hasMoved: false, // exclude click event
      x: 0, // right
      y: 0, // bottom
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0
    };

    // export helper functions to public
    this.tool = tool;
    this.$ = $;

    // merge options
    if (tool.isObject(opt)) {
      for (let key in opt) {
        this.option[key] = opt[key];
      }
    }

    // add built-in plugins
    this._addBuiltInPlugins();

    // try to init
    let _onload = function() {
      if (that.isInited) {
        return;
      }
      that._render();
      // that._mockTap();
      that._bindEvent();
      that._autoRun();
    };
    if (document !== undefined) {
      if (document.readyState === 'loading') {
        $.bind(<any>window, 'DOMContentLoaded', _onload);
      } else {
        _onload();
      }
    } else {
      // if document does not exist, wait for it
      let _timer;
      let _pollingDocument = function() {
        if (!!document && document.readyState == 'complete') {
          _timer && clearTimeout(_timer);
          _onload();
        } else {
          _timer = setTimeout(_pollingDocument, 1);
        }
      };
      _timer = setTimeout(_pollingDocument, 1);
    }
  }

  /**
  * add built-in plugins
  */
  _addBuiltInPlugins() {
    // add default log plugin
    this.addPlugin(new VConsoleDefaultPlugin('default', 'Log'));

    // add other built-in plugins according to user's config
    const list = this.option.defaultPlugins;
    const plugins = {
      'system': {proto: VConsoleSystemPlugin, name: 'System'},
      'network': {proto: VConsoleNetworkPlugin, name: 'Network'},
      'element': {proto: VConsoleElementPlugin, name: 'Element'},
      'storage': {proto: VConsoleStoragePlugin, name: 'Storage'}
    };
    if (!!list && tool.isArray(list)) {
      for (let i=0; i<list.length; i++) {
        let tab = plugins[list[i]];
        if (!!tab) {
          this.addPlugin(new tab.proto(list[i], tab.name));
        } else {
          console.debug('Unrecognized default plugin ID:', list[i]);
        }
      }
    }
  }

  /**
  * render panel DOM
  * @private
  */
  _render() {
    if (! $.one(VCONSOLE_ID)) {
      const e = document.createElement('div');
      e.innerHTML = tpl;
      document.documentElement.insertAdjacentElement('beforeend', e.children[0]);
    }
    this.$dom = $.one(VCONSOLE_ID);

    // reposition switch button
    const switchX = <any>tool.getStorage('switch_x') * 1,
          switchY = <any>tool.getStorage('switch_y') * 1;
    this.setSwitchPosition(switchX, switchY);

    // modify font-size
    const dpr = window.devicePixelRatio || 1;
    const viewportEl = document.querySelector('[name="viewport"]');
    if (viewportEl) {
      const viewportContent = viewportEl.getAttribute('content') || '';
      const initialScale = viewportContent.match(/initial\-scale\=\d+(\.\d+)?/);
      const scale = initialScale ? parseFloat(initialScale[0].split('=')[1]) : 1;
      if (scale < 1) {
        this.$dom.style.fontSize = 13 * dpr + 'px';
      }
    }

    // remove from less to present transition effect
    $.one('.vc-mask', this.$dom).style.display = 'none';

    // set theme
    this._updateTheme();
  }

  /**
  * Update theme
  * @private 
  */
  _updateTheme() {
    let theme = this.option.theme;
    if (theme !== 'light' && theme !== 'dark') {
      theme = ''; // use system theme
    }
    this.$dom.setAttribute('data-theme', theme);
  }

  setSwitchPosition(switchX, switchY) {
    const $switch = $.one('.vc-switch', this.$dom);
    [switchX, switchY] = this._getSwitchButtonSafeAreaXY($switch, switchX, switchY);
    this.switchPos.x = switchX;
    this.switchPos.y = switchY;
    $switch.style.right = switchX + 'px';
    $switch.style.bottom = switchY + 'px';
    tool.setStorage('switch_x', switchX);
    tool.setStorage('switch_y', switchY);
  }

  /**
  * Get an safe [x, y] position for switch button
  * @private
  */
  _getSwitchButtonSafeAreaXY($switch, x, y) {
    const docWidth = Math.max(document.documentElement.offsetWidth, window.innerWidth);
    const docHeight = Math.max(document.documentElement.offsetHeight, window.innerHeight);
    // check edge
    if (x + $switch.offsetWidth > docWidth) {
      x = docWidth - $switch.offsetWidth;
    }
    if (y + $switch.offsetHeight > docHeight) {
      y = docHeight - $switch.offsetHeight;
    }
    if (x < 0) { x = 0; }
    if (y < 20) { y = 20; } // safe area for iOS Home indicator
    return [x, y];
  }

  /**
  * simulate tap event by touchstart & touchend
  * @private
  */
  _mockTap() {
    let tapTime = 700, // maximun tap interval
        tapBoundary = 10; // max tap move distance

    let lastTouchStartTime,
        touchstartX,
        touchstartY,
        touchHasMoved = false,
        targetElem = null;

    this.$dom.addEventListener('touchstart', function(e) { // todo: if double click
      if (lastTouchStartTime === undefined) {
        const touch = e.targetTouches[0];
        const target = <Element>e.target;
        touchstartX = touch.pageX;
        touchstartY = touch.pageY;
        lastTouchStartTime = e.timeStamp;
        targetElem = (target.nodeType === Node.TEXT_NODE ? target.parentNode : target);
      }
    }, false);

    this.$dom.addEventListener('touchmove', function(e) {
      const touch = e.changedTouches[0];
      if (Math.abs(touch.pageX - touchstartX) > tapBoundary || Math.abs(touch.pageY - touchstartY) > tapBoundary) {
        touchHasMoved = true;
      }
    });

    this.$dom.addEventListener('touchend', function(e) {
      // move and time within limits, manually trigger `click` event
      if (touchHasMoved === false && e.timeStamp - lastTouchStartTime < tapTime && targetElem != null) {
        let tagName = targetElem.tagName.toLowerCase(),
            needFocus = false,
            hasSelection = false;
        switch (tagName) {
          case 'textarea': // focus
            needFocus = true; break;
          case 'input':
            switch (targetElem.type) {
              case 'button':
              case 'checkbox':
              case 'file':
              case 'image':
              case 'radio':
              case 'submit':
                needFocus = false; break;
              default:
                needFocus = !targetElem.disabled && !targetElem.readOnly;
            }
          default:
            break;
        }
        if (typeof window.getSelection === 'function') {
          const selection = getSelection();
          if (selection.rangeCount && selection.type === 'range') { // type: None|Caret|Range
            hasSelection = true;
          }
        }
        if (needFocus) {
          targetElem.focus();
        } else if (!hasSelection) {
          e.preventDefault(); // prevent click 300ms later
        }

        if (!targetElem.disabled && !targetElem.readOnly) {
          const touch = e.changedTouches[0];
          const event = document.createEvent('MouseEvents');
          event.initMouseEvent('click', true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
          event.initEvent('click', true, true);
          targetElem.dispatchEvent(event);
        }
      }

      // reset values
      lastTouchStartTime = undefined;
      touchHasMoved = false;
      targetElem = null;
    }, false);
  }
  /**
  * bind DOM events
  * @private
  */
  _bindEvent() {
    const that = this;

    // drag & drop switch button
    const $switch = $.one('.vc-switch', that.$dom);
    $.bind($switch, 'touchstart', function(e) {
      that.switchPos.startX = e.touches[0].pageX;
      that.switchPos.startY = e.touches[0].pageY;
      that.switchPos.hasMoved = false;
    });
    $.bind($switch, 'touchend', function(e) {
      if (!that.switchPos.hasMoved) {
        return;
      }
      that.switchPos.startX = 0;
      that.switchPos.startY = 0;
      that.switchPos.hasMoved = false;
      that.setSwitchPosition(that.switchPos.endX, that.switchPos.endY);
    });
    $.bind($switch, 'touchmove', function(e) {
      if (e.touches.length <= 0) {
        return;
      }
      const offsetX = e.touches[0].pageX - that.switchPos.startX,
            offsetY = e.touches[0].pageY - that.switchPos.startY;
      let x = Math.floor(that.switchPos.x - offsetX),
          y = Math.floor(that.switchPos.y - offsetY);
      [x, y] = that._getSwitchButtonSafeAreaXY($switch, x, y);
      $switch.style.right = x + 'px';
      $switch.style.bottom = y + 'px';
      that.switchPos.endX = x;
      that.switchPos.endY = y;
      that.switchPos.hasMoved = true;
      e.preventDefault();
    });

    // show console panel
    $.bind($.one('.vc-switch', that.$dom), 'click', function() {
      that.show();
    });

    // hide console panel
    $.bind($.one('.vc-hide', that.$dom), 'click', function() {
      that.hide();
    });

    // hide console panel when tap background mask
    $.bind($.one('.vc-mask', that.$dom), 'click', function(e) {
      if (e.target != $.one('.vc-mask')) {
        return false;
      }
      that.hide();
    });

    // show tab box
    $.delegate($.one('.vc-tabbar', that.$dom), 'click', '.vc-tab', function(e) {
      let tabName = this.dataset.tab;
      if (tabName == that.activedTab) {
        return;
      }
      that.showTab(tabName);
    });

    // disable background scrolling
    let $content = $.one('.vc-content', that.$dom);
    let preventMove = false;
    $.bind($content, 'touchstart', function (e) {
      let top = $content.scrollTop,
          totalScroll = $content.scrollHeight,
          currentScroll = top + $content.offsetHeight;
      if (top === 0) {
        // when content is on the top,
        // reset scrollTop to lower position to prevent iOS apply scroll action to background
        $content.scrollTop = 1;
        // however, when content's height is less than its container's height,
        // scrollTop always equals to 0 (it is always on the top),
        // so we need to prevent scroll event manually
        if ($content.scrollTop === 0) {
          if (!$.hasClass(e.target, 'vc-cmd-input')) { // skip input
            preventMove = true;
          }
        }
      } else if (currentScroll === totalScroll) {
        // when content is on the bottom,
        // do similar processing
        $content.scrollTop = top - 1;
        if ($content.scrollTop === top) {
          if (!$.hasClass(e.target, 'vc-cmd-input')) {
            preventMove = true;
          }
        }
      }
    });

    $.bind($content, 'touchmove', function (e) {
      if (preventMove) {
        e.preventDefault();
      }
    });

    $.bind($content, 'touchend', function (e) {
      preventMove = false;
    });
  };

  /**
  * auto run after initialization
  * @private
  */
  _autoRun() {
    this.isInited = true;

    // init plugins
    for (let id in this.pluginList) {
      this._initPlugin(this.pluginList[id]);
    }

    // show first tab
    if (this.tabList.length > 0) {
      this.showTab(this.tabList[0]);
    }

    this.triggerEvent('ready');
  }

  /**
  * trigger a vConsole.option event
  * @protect
  */
  triggerEvent(eventName: string, param?: any) {
    eventName = 'on' + eventName.charAt(0).toUpperCase() + eventName.slice(1);
    if (tool.isFunction(this.option[eventName])) {
      this.option[eventName].apply(this, param);
    }
  }

  /**
  * init a plugin
  * @private
  */
  _initPlugin(plugin) {
    let that = this;
    plugin.vConsole = this;
    // start init
    plugin.trigger('init');
    // render tab (if it is a tab plugin then it should has tab-related events)
    plugin.trigger('renderTab', function(tabboxHTML) {
      // add to tabList
      that.tabList.push(plugin.id);
      // render tabbar
      let $tabbar = $.render(tplTabbar, {id: plugin.id, name: plugin.name});
      $.one('.vc-tabbar', that.$dom).insertAdjacentElement('beforeend', $tabbar);
      // render tabbox
      let $tabbox = $.render(tplTabbox, {id: plugin.id});
      if (!!tabboxHTML) {
        if (tool.isString(tabboxHTML)) {
          $tabbox.innerHTML += tabboxHTML;
        } else if (tool.isFunction(tabboxHTML.appendTo)) {
          tabboxHTML.appendTo($tabbox);
        } else if (tool.isElement(tabboxHTML)) {
          $tabbox.insertAdjacentElement('beforeend', tabboxHTML);
        }
      }
      $.one('.vc-content', that.$dom).insertAdjacentElement('beforeend', $tabbox);
    });
    // render top bar
    plugin.trigger('addTopBar', function(btnList) {
      if (!btnList) {
        return;
      }
      let $topbar = $.one('.vc-topbar', that.$dom);
      for (let i=0; i<btnList.length; i++) {
        let item = btnList[i];
        let $item = <HTMLElement>$.render(tplTopBarItem, {
          name: item.name || 'Undefined',
          className: item.className || '',
          pluginID: plugin.id
        });
        if (item.data) {
          for (let k in item.data) {
            $item.dataset[k] = item.data[k];
          }
        }
        if (tool.isFunction(item.onClick)) {
          $.bind($item, 'click', function(e) {
            let enable = item.onClick.call($item);
            if (enable === false) {
              // do nothing
            } else {
              $.removeClass($.all('.vc-topbar-' + plugin.id), 'vc-actived');
              $.addClass($item, 'vc-actived');
            }
          });
        }
        $topbar.insertAdjacentElement('beforeend', $item);
      }
    });
    // render tool bar
    plugin.trigger('addTool', function(toolList) {
      if (!toolList) {
        return;
      }
      let $defaultBtn = $.one('.vc-tool-last', that.$dom);
      for (let i=0; i<toolList.length; i++) {
        let item = toolList[i];
        let $item = $.render(tplToolItem, {
          name: item.name || 'Undefined',
          pluginID: plugin.id
        });
        if (item.global == true) {
          $.addClass($item, 'vc-global-tool');
        }
        if (tool.isFunction(item.onClick)) {
          $.bind($item, 'click', function(e) {
            item.onClick.call($item);
          });
        }
        $defaultBtn.parentNode.insertBefore($item, $defaultBtn);
      }
    });
    // end init
    plugin.isReady = true;
    plugin.trigger('ready');
  }

  /**
  * trigger an event for each plugin
  * @private
  */
  _triggerPluginsEvent(eventName) {
    for (let id in this.pluginList) {
      if (this.pluginList[id].isReady) {
        this.pluginList[id].trigger(eventName);
      }
    }
  }

  /**
  * trigger an event by plugin's name
  * @private
  */
  _triggerPluginEvent(pluginName, eventName) {
    let plugin = this.pluginList[pluginName];
    if (!!plugin && plugin.isReady) {
      plugin.trigger(eventName);
    }
  }

  /**
  * add a new plugin
  * @public
  * @param object VConsolePlugin object
  * @return boolean
  */
  addPlugin(plugin) {
    // ignore this plugin if it has already been installed
    if (this.pluginList[plugin.id] !== undefined) {
      console.debug('Plugin ' + plugin.id + ' has already been added.');
      return false;
    }
    this.pluginList[plugin.id] = plugin;
    // init plugin only if vConsole is ready
    if (this.isInited) {
      this._initPlugin(plugin);
      // if it's the first plugin, show it by default
      if (this.tabList.length == 1) {
        this.showTab(this.tabList[0]);
      }
    }
    return true;
  }

  /**
  * remove a plugin
  * @public
  * @param string pluginID
  * @return boolean
  */
  removePlugin(pluginID) {
    pluginID = (pluginID + '').toLowerCase();
    let plugin = this.pluginList[pluginID];
    // skip if is has not been installed
    if (plugin === undefined) {
      console.debug('Plugin ' + pluginID + ' does not exist.');
      return false;
    }
    // trigger `remove` event before uninstall
    plugin.trigger('remove');
    // the plugin will not be initialized before vConsole is ready,
    // so the plugin does not need to handle DOM-related actions in this case
    if (this.isInited) {
      let $tabbar = $.one('#__vc_tab_' + pluginID);
      $tabbar && $tabbar.parentNode.removeChild($tabbar);
      // remove topbar
      let $topbar = $.all('.vc-topbar-' + pluginID, this.$dom);
      for (let i=0; i<$topbar.length; i++) {
        $topbar[i].parentNode.removeChild($topbar[i]);
      }
      // remove content
      let $content = $.one('#__vc_log_' + pluginID);
      $content && $content.parentNode.removeChild($content);
      // remove tool bar
      let $toolbar = $.all('.vc-tool-' + pluginID, this.$dom);
      for (let i=0; i<$toolbar.length; i++) {
        $toolbar[i].parentNode.removeChild($toolbar[i]);
      }
    }
    // remove plugin from list
    let index = this.tabList.indexOf(pluginID);
    if (index > -1) {
      this.tabList.splice(index, 1);
    }
    try {
      delete this.pluginList[pluginID];
    } catch (e) {
      this.pluginList[pluginID] = undefined;
    }
    // show the first plugin by default
    if (this.activedTab == pluginID) {
      if (this.tabList.length > 0) {
        this.showTab(this.tabList[0]);
      }
    }
    return true;
  }

  /**
  * show console panel
  * @public
  */
  show() {
    if (!this.isInited) {
      return;
    }
    let that = this;
    // before show console panel,
    // trigger a transitionstart event to make panel's property 'display' change from 'none' to 'block'
    let $panel = $.one('.vc-panel', this.$dom);
    $panel.style.display = 'block';

    // set 10ms delay to fix confict between display and transition
    setTimeout(function() {
      $.addClass(that.$dom, 'vc-toggle');
      that._triggerPluginsEvent('showConsole');
      let $mask = $.one('.vc-mask', that.$dom);
      $mask.style.display = 'block';
    }, 10);
  }

  /**
  * hide console panel
  * @public
  */
  hide() {
    if (!this.isInited) {
      return;
    }
    $.removeClass(this.$dom, 'vc-toggle');
    setTimeout(() => {
      // panel will be hidden by CSS transition in 0.3s
      $.one('.vc-mask', this.$dom).style.display = 'none';
      $.one('.vc-panel', this.$dom).style.display = 'none';
    }, 330);
    this._triggerPluginsEvent('hideConsole');
  }

  /**
  * show switch button
  * @public
  */
  showSwitch() {
    if (!this.isInited) {
      return;
    }
    let $switch = $.one('.vc-switch', this.$dom);
    $switch.style.display = 'block';
  }

  /**
  * hide switch button
  */
  hideSwitch() {
    if (!this.isInited) {
      return;
    }
    let $switch = $.one('.vc-switch', this.$dom);
    $switch.style.display = 'none';
  }

  /**
  * show a tab
  * @public
  */
  showTab(tabID) {
    if (!this.isInited) {
      return;
    }
    let $logbox = $.one('#__vc_log_' + tabID);
    // set actived status
    $.removeClass($.all('.vc-tab', this.$dom), 'vc-actived');
    $.addClass($.one('#__vc_tab_' + tabID), 'vc-actived');
    $.removeClass($.all('.vc-logbox', this.$dom), 'vc-actived');
    $.addClass($logbox, 'vc-actived');
    // show topbar
    let $curTopbar = $.all('.vc-topbar-' + tabID, this.$dom);
    $.removeClass($.all('.vc-toptab', this.$dom), 'vc-toggle');
    $.addClass($curTopbar, 'vc-toggle');
    if ($curTopbar.length > 0) {
      $.addClass($.one('.vc-content', this.$dom), 'vc-has-topbar');
    } else {
      $.removeClass($.one('.vc-content', this.$dom), 'vc-has-topbar');
    }
    // show toolbar
    $.removeClass($.all('.vc-tool', this.$dom), 'vc-toggle');
    $.addClass($.all('.vc-tool-' + tabID, this.$dom), 'vc-toggle');
    // trigger plugin event
    this.activedTab && this._triggerPluginEvent(this.activedTab, 'hide');
    this.activedTab = tabID;
    this._triggerPluginEvent(this.activedTab, 'show');
  }

  /**
  * update option(s)
  * @public
  */
  setOption(keyOrObj, value) {
    if (tool.isString(keyOrObj)) {
      this.option[keyOrObj] = value;
      this._triggerPluginsEvent('updateOption');
      this._updateTheme();
    } else if (tool.isObject(keyOrObj)) {
      for (let k in keyOrObj) {
        this.option[k] = keyOrObj[k];
      }
      this._triggerPluginsEvent('updateOption');
      this._updateTheme();
    } else {
      console.debug('The first parameter of vConsole.setOption() must be a string or an object.');
    }
  }

  /**
  * uninstall vConsole
  * @public
  */
  destroy() {
    if (!this.isInited) {
      return;
    }
    // remove plugins
    let IDs = Object.keys(this.pluginList);
    for (let i = IDs.length - 1; i >= 0; i--) {
      this.removePlugin(IDs[i]);
    }
    // remove DOM
    this.$dom.parentNode.removeChild(this.$dom);

    // reverse isInited when destroyed
    this.isInited = false;
  }

} // END class

export default VConsole;
