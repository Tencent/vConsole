/**
 * vConsole core class
 *
 * @author WechatFE
 */

import * as tool from '../lib/tool.js';
import $ from '../lib/query.js';
import './core.less';
import tpl from './core.html';
import tplTabbar from './tabbar.html';
import tplTabbox from './tabbox.html';
import tplToolItem from './tool_item.html';

class VConsole {

  constructor() {
    var that = this;

    this.html = tpl;
    this.$dom = null;
    this.activedTab = '';
    this.tabList = [];
    this.pluginList = {};
    this.console = {}; // store native console methods
    this.logList = []; // store logs when vConsole is not ready
    this.isReady = false;
    this.switchPos = {
      x: 10, // right
      y: 10, // bottom
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0
    };
    this.bodyOverflowCSS = '';

    // export helper functions to public
    this.tool = tool;
    this.$ = $;

    var _onload = function() {
      that._render();
      that._bindEvent();
      that._autoRun();
    };
    if (document.readyState == 'complete') {
      _onload();
    } else {
      $.bind(window, 'load', _onload);
    }
  }

  /**
   * render panel DOM
   * @private
   */
  _render() {
    var id = '#__vconsole';
    if (! $.one(id)) {
      var e = document.createElement('div');
      e.innerHTML = this.html;
      document.body.appendChild(e.children[0]);
    }
    this.$dom = $.one(id);

    // reposition switch button
    var switchX = tool.getStorage('switch_x'),
        switchY = tool.getStorage('switch_y');
    if (switchX && switchY) {
      this.switchPos.x = switchX;
      this.switchPos.y = switchY;
      $.one('.vc-switch').style.right = switchX + 'px';
      $.one('.vc-switch').style.bottom = switchY + 'px';
    }
  };

  /**
   * bind DOM events
   * @private
   */
  _bindEvent() {
    var that = this;

    // drag & drop switch button
    var $switch = $.one('.vc-switch', that.$dom);
    $.bind($switch, 'touchstart', function(e) {
      that.switchPos.startX = e.touches[0].pageX;
      that.switchPos.startY = e.touches[0].pageY;
    });
    $.bind($switch, 'touchend', function(e) {
      if (that.switchPos.endX != 0 || that.switchPos.endY != 0) {
        that.switchPos.x = that.switchPos.endX;
        that.switchPos.y = that.switchPos.endY;
        that.switchPos.startX = 0;
        that.switchPos.startY = 0;
        that.switchPos.endX = 0;
        that.switchPos.endY = 0;
        tool.setStorage('switch_x', that.switchPos.x);
        tool.setStorage('switch_y', that.switchPos.y);
      }
    });
    $.bind($switch, 'touchmove', function(e) {
      if (e.touches.length > 0) {
        var offsetX = e.touches[0].pageX - that.switchPos.startX,
            offsetY = e.touches[0].pageY - that.switchPos.startY;
        var x = that.switchPos.x - offsetX,
            y = that.switchPos.y - offsetY;
        if (x < 0) { x = 0; }
        if (y < 0) { y = 0; }
        if (x + $switch.offsetWidth > document.body.offsetWidth) {
          x = document.body.offsetWidth - $switch.offsetWidth;
        }
        if (y + $switch.offsetHeight > document.body.offsetHeight) {
          y = document.body.offsetHeight - $switch.offsetHeight;
        }
        $switch.style.right = x + 'px';
        $switch.style.bottom = y + 'px';
        that.switchPos.endX = x;
        that.switchPos.endY = y;
        e.preventDefault();
      }
    });

    // show console panel
    $.bind($.one('.vc-switch', that.$dom), 'click', function() {
      that.show();
    })

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
      var tabName = this.dataset.tab;
      if (tabName == that.activedTab) {
        return;
      }
      that.showTab(tabName);
    });

  };

  /**
   * auto run after initialization
   * @private
   */
  _autoRun() {
    this.isReady = true;

    // init plugins
    for (let id in this.pluginList) {
      this._initPlugin(this.pluginList[id]);
    }

    // show first tab
    this.showTab(this.tabList[0]);
  }

  /**
   * init a plugin
   * @private
   */
  _initPlugin(plugin) {
    var that = this;
    // start init
    plugin.trigger('init');
    // render tab (if it is a tab plugin then it should has tab-related events)
    plugin.trigger('renderTab', function(tabboxHTML) {
      // add to tabList
      that.tabList.push(plugin.id);
      // render tabbar
      let $tabbar = $.render(tplTabbar, {id: plugin.id, name: plugin.name});
      $.one('.vc-tabbar', that.$dom).appendChild($tabbar);
      // render tabbox
      let $tabbox = $.render(tplTabbox, {id: plugin.id});
      if (!!tabboxHTML) {
        if (tool.isString(tabboxHTML)) {
          $tabbox.innerHTML += tabboxHTML;
        } else if (tool.isFunction(tabboxHTML.appendTo)) {
          tabboxHTML.appendTo($tabbox);
        } else if (tool.isElement(tabboxHTML)) {
          $tabbox.appendChild(tabboxHTML);
        }
      }
      $.one('.vc-content', that.$dom).appendChild($tabbox);
    });
    // render tool bar
    plugin.trigger('addTool', function(toolList) {
      if (!toolList) {
        return;
      }
      let $defaultBtn = $.one('.vc-tool-last');
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
          $.bind($item, 'click', item.onClick);
        }
        $defaultBtn.parentNode.insertBefore($item, $defaultBtn);
      }
    });
    // end init
    plugin.trigger('ready');
  }

  /**
   * trigger an event for each plugin
   * @private
   */
  _triggerPluginsEvent(eventName) {
    for (let id in this.pluginList) {
      this.pluginList[id].trigger(eventName);
    }
  }

  /**
   * trigger an event by plugin's name
   * @private
   */
  _triggerPluginEvent(pluginName, eventName) {
    let plugin = this.pluginList[pluginName];
    if (plugin) {
      plugin.trigger(eventName);
    }
  }

  /**
   * add a new plugin
   * @public
   * @param object VConsolePlugin object
   */
  addPlugin(plugin) {
    // ignore this plugin if it has already been installed
    if (this.pluginList[plugin.id] !== undefined) {
      console.warn('Plugin ' + plugin.id + ' has already been added.');
      return false;
    }
    this.pluginList[plugin.id] = plugin;
    // init plugin only if vConsole is ready
    if (this.isReady) {
      this._initPlugin(plugin);
    }
    return true;
  }

  /**
   * show console panel
   * @public
   */
  show() {
    $.addClass(this.$dom, 'vc-toggle');
    this._triggerPluginsEvent('showConsole');
    // set overflow:hidden to prevent scrolling
    this.bodyOverflowCSS = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  /**
   * hide console panel
   * @public
   */
  hide() {
    // recover body style
    document.body.style.overflow = this.bodyOverflowCSS;
    $.removeClass(this.$dom, 'vc-toggle');
    this._triggerPluginsEvent('hideConsole');
  }

  /**
   * show a tab
   * @public
   */
  showTab(tabID) {
    var $logbox = $.one('#__vc_log_' + tabID);
    // set actived status
    $.removeClass($.all('.vc-tab', this.$dom), 'vc-actived');
    $.addClass($.one('#__vc_tab_' + tabID), 'vc-actived');
    $.removeClass($.all('.vc-logbox', this.$dom), 'vc-actived');
    $.addClass($logbox, 'vc-actived');
    // scroll to bottom
    $.one('.vc-content', this.$dom).scrollTop = $.one('.vc-content', this.$dom).scrollHeight;
    // show toolbar
    $.removeClass($.all('.vc-tool', this.$dom), 'vc-actived');
    $.addClass($.all('.vc-tool-' + tabID, this.$dom), 'vc-actived');
    // trigger plugin event
    this._triggerPluginEvent(this.activedTab, 'hide');
    this.activedTab = tabID;
    this._triggerPluginEvent(this.activedTab, 'show');
  }

} // END class

export default VConsole;