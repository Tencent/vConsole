/**
 * vConsole core class
 *
 * @author WechatFE
 */

import * as tool from '../lib/tool.js';
import $ from '../lib/query.js';
import './core.less';
import tpl from './core.html';

class vConsole {

  constructor() {
    var that = this;

    this.html = tpl;
    this.$dom = null;
    this.activedTab = '';
    this.tabList = [];
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
    var $switch = $.one('.vc-switch');
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
        $switch.style.right = x + 'px';
        $switch.style.bottom = y + 'px';
        that.switchPos.endX = x;
        that.switchPos.endY = y;
        e.preventDefault();
      }
    });

    // show console panel
    $.bind($.one('.vc-switch'), 'click', function() {
      that.show();
    })

    // hide console panel
    $.bind($.one('.vc-hide'), 'click', function() {
      that.hide();
    });

    // hide console panel when tap background mask
    $.bind($.one('.vc-mask'), 'click', function(e) {
      if (e.target != $.one('.vc-mask')) {
        return false;
      }
      that.hide();
    });

    // clear a log box
    $.bind($.one('.vc-clear'), 'click', function() {
      that.clearLog(that.activedTab);
    });

    // show a log box
    $.bind($.all('.vc-tab'), 'click', function(e) {
      var tabName = e.target.dataset.tab;
      if (tabName == that.activedTab) {
        return;
      }
      that.showTab(tabName);
    });

    // log-related actions
    $.bind($.all('.vc-log'), 'click', function(e) {
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
  };

  /**
   * auto run after initialization
   * @private
   */
  _autoRun() {
    this.isReady = true;

  }

  /**
   * register a new tab
   */
  addTab(opt) {

  }

  /**
   * show console panel
   * @public
   */
  show() {
    $.addClass(this.$dom, 'vc-toggle');
  }

  /**
   * hide console panel
   * @public
   */
  hide() {
    $.removeClass(this.$dom, 'vc-toggle');
  }

} // END class

export default vConsole;