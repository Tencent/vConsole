/**
 * A Front-End Console Panel for Mobile Webpage
 *
 * @author WechatFE
 */

import './vconsole.less';
import tpl from './tpl.html';

/**
 * initial
 * @constructor
 */
function vConsole() {
  this.html = tpl;
  this.$dom = null;
  this.activedTab = 'default';
  this.console = {}; // store native console methods
  this.isReady = false;
  this.readyCallback = [];

  var that = this;
  bind(window, 'load', function() {
    that._render();
    that._bindEvent();
    that._mokeConsole();
    that._autoRun();
  });
}

/**
 * render panel DOM
 * @private
 */
vConsole.prototype._render = function() {
  var id = '#__vconsole';
  if (! $(id)) {
    var e = document.createElement('div');
    e.innerHTML = this.html;
    document.body.appendChild(e.children[0]);
  }
  this.$dom = $(id);
};

/**
 * bind DOM events
 * @private
 */
vConsole.prototype._bindEvent = function() {
  var that = this;

  // show console panel
  bind($('.vc-show'), 'click', function() {
    that.show();
  })

  // hide console panel
  bind($('.vc-hide'), 'click', function() {
    that.hide();
  });

  // hide console panel when tap background mask
  bind($('.vc-mask'), 'click', function(e) {
    if (e.target != $('.vc-mask')) {
      return false;
    }
    that.hide();
  });

  // clear a log box
  bind($('.vc-clear'), 'click', function() {
    that.clearLog(that.activedTab);
  });

  // show a log box
  bind($$('.vc-tab'), 'click', function(e) {
    var tabName = e.target.dataset.tab;
    if (tabName == that.activedTab) {
      return;
    }
    that.showTab(tabName);
  });
};

/**
 * replace window.console with vConsole method
 * @private
 */
vConsole.prototype._mokeConsole = function() {
  if (!window.console) {
    return;
  }
  var that = this;
  this.console.log = window.console.log;
  this.console.info = window.console.info;
  this.console.warn = window.console.warn;
  this.console.debug = window.console.debug;
  this.console.error = window.console.error;
  window.console.log = function() { that._printLog('default', 'log', arguments); };
  window.console.info = function() { that._printLog('default', 'info', arguments); };
  window.console.warn = function() { that._printLog('default', 'warn', arguments); };
  window.console.debug = function() { that._printLog('default', 'debug', arguments); };
  window.console.error = function() { that._printLog('default', 'error', arguments); };
};

/**
 * auto run after initialization
 * @private
 */
vConsole.prototype._autoRun = function() {
  // print system info
  var ua = navigator.userAgent,
    logMsg = [];
  
  // current time
  var d = getDate();
  this._printLog('system', 'info', ['日志时间:', d.year+'-'+d.month+'-'+d.day+' '+d.hour+':'+d.minute+':'+d.second+' '+d.millisecond]);

  // device & system
  logMsg = ['系统版本:', '不明'];
  var ipod = ua.match(/(ipod).*\s([\d_]+)/i),
    ipad = ua.match(/(ipad).*\s([\d_]+)/i),
    iphone = ua.match(/(iphone)\sos\s([\d_]+)/i),
    android = ua.match(/(android)\s([\d\.]+)/i);
  if (android) {
    logMsg[1] = 'Android ' + android[2];
  } else if (iphone) {
    logMsg[1] = 'iPhone, iOS ' + iphone[2].replace(/_/g,'.');
  } else if (ipad) {
    logMsg[1] = 'iPad, iOS ' + ipad[2].replace(/_/g, '.');
  } else if (ipod) {
    logMsg[1] = 'iPod, iOS ' + ipod[2].replace(/_/g, '.');
  }
  this._printLog('system', 'info', logMsg);

  // wechat app version
  var version = ua.match(/MicroMessenger\/([\d\.]+)/i);
  logMsg = ['微信版本:', '不明'];
  if (version && version[1]) {
    logMsg[1] = version[1];
    this._printLog('system', 'info', logMsg);
  }

  // network type
  var network = ua.toLowerCase().match(/ nettype\/([^ ]+)/g);
  logMsg = ['网络类型:', '不明'];
  if (network && network[0]) {
    network = network[0].split('/');
    logMsg[1] = network[1];
    this._printLog('system', 'info', logMsg);
  }

  // HTTP protocol
  logMsg = ['网址协议:', '不明'];
  if (location.protocol == 'https:') {
    logMsg[1] = 'HTTPS';
  } else if (location.protocol == 'http:') {
    logMsg[1] = 'HTTP';
  } else {
    logMsg[1] = location.protocol.replace(':', '');
  }
  this._printLog('system', 'info', logMsg);

  // performance related
  window.addEventListener('load', function(e) {
    var performance = window.performance || window.msPerformance || window.webkitPerformance;

    // timing
    if (performance && performance.timing) {
      var t = performance.timing,
        start = t.navigationStart;
      // this._printLog('system', 'debug', ['domainLookupEnd:', (t.domainLookupEnd - start)+'ms']);
      this._printLog('system', 'info', ['连接结束点:', (t.connectEnd - start)+'ms']);
      this._printLog('system', 'info', ['回包结束点:', (t.responseEnd - start)+'ms']);
      // this._printLog('system', 'debug', ['domComplete:', (t.domComplete - start)+'ms']);
      // this._printLog('system', 'info', ['beforeReqTime:', (t.requestStart - start)+'ms']);
      if (t.secureConnectionStart > 0) {
        this._printLog('system', 'info', ['ssl耗时:', (t.connectEnd - t.secureConnectionStart)+'ms']);
      }
      // this._printLog('system', 'info', ['req&RespTime:', (t.responseEnd - t.requestStart)+'ms']);
      this._printLog('system', 'info', ['dom渲染耗时:', (t.domComplete - t.domLoading)+'ms']);
    }
  });

  while (this.readyCallback.length > 0) {
    var callback = this.readyCallback.shift();
    callback && callback.call(this);
  }
  this.isReady = true;
};

/**
 * print a log to log box
 * @private
 * @param  string  tabName
 * @param  string  logType    log|info|debug|error|warn
 * @param  array  logs
 */
vConsole.prototype._printLog = function(tabName, logType, logs) {
  if (!logs.length) {
    return;
  }

  // generate plain text for a line
  var line = '';
  for (var i=0; i<logs.length; i++) {
    try {
      if (typeof logs[i] == 'function') {
        line += ' ' + logs[i].toString();
      } else if (typeof logs[i] == 'object') {
        line += ' ' + JSON.stringify(logs[i]);
      } else {
        line += ' ' + htmlEncode(logs[i]);
      }
    } catch (e) {
      line += ' [' + (typeof logs[i]) + ']';
    }
  }

  var $logbox = $('#__vc_log_' + tabName);
  var p = document.createElement('p');
  p.className = 'vc-item vc-item-' + logType;
  p.innerHTML = line;
  $('.vc-log', $logbox).appendChild(p);
  $('.vc-content').scrollTop = $('.vc-content').scrollHeight;

  // print to traditional console
  this.console[logType].apply(window.console, logs);
};

/**
 * show a log box by tab name
 * @public
 */
vConsole.prototype.showTab = function(tabName) {
  var $logbox = $('#__vc_log_' + tabName);
  // set actived status
  removeClass($$('.vc-tab', this.$dom), 'vc-actived');
  addClass($('#__vc_tab_' + tabName), 'vc-actived');
  removeClass($$('.vc-logbox'), 'vc-actived');
  addClass($logbox, 'vc-actived');
  // scroll to bottom
  $('.vc-content').scrollTop = $('.vc-content').scrollHeight;
  this.activedTab = tabName;
};

/**
 * clear a log box by tab name
 * @public
 */
vConsole.prototype.clearLog = function(tabName) {
  var $logbox = $('#__vc_log_' + tabName);
  $('.vc-log', $logbox).innerHTML = '';
};

/**
 * show console panel
 * @public
 */
vConsole.prototype.show = function() {
  addClass(this.$dom, 'vc-toggle');
};

/**
 * hide console panel
 * @public
 */
vConsole.prototype.hide = function() {
  removeClass(this.$dom, 'vc-toggle');
};

/**
 * when vConsole is ready, callback() will be called
 * @public
 * @param	function	callback
 */
vConsole.prototype.ready = function(callback) {
  if (!this.isReady) {
    this.readyCallback.push(callback);
  } else {
    callback.call(this);
  }
};


/****************************************************************
 Utility Functions
****************************************************************/

/**
 * get single element
 * @private
 */
function $(selector, contextElement) {
  if (contextElement) {
    return contextElement.querySelector(selector);
  }
  return document.querySelector(selector);
}

/**
 * get multiple elements
 * @private
 */
function $$(selector, contextElement) {
  var nodeList,
    list = [];
  if (contextElement) {
    nodeList = contextElement.querySelectorAll(selector);
  } else {
    nodeList = document.querySelectorAll(selector);
  }
  if (nodeList && nodeList.length > 0) {
    list = Array.prototype.slice.call(nodeList);
  }
  return list;
}

/**
 * add className to an element
 * @private
 */
function addClass($el, className) {
  if (!$el) {
    return;
  }
  if (Object.prototype.toString.call($el) != '[object Array]') {
    $el = [$el];
  }
  for (var i=0; i<$el.length; i++) {
    $el[i].className += ' ' + className;
  }
}

/**
 * remove className from an element
 * @private
 */
function removeClass($el, className) {
  if (!$el) {
    return;
  }
  if (Object.prototype.toString.call($el) != '[object Array]') {
    $el = [$el];
  }
  for (var i=0; i<$el.length; i++) {
    var arr = $el[i].className.split(' ');
    for (var j=0; j<arr.length; j++) {
      if (arr[j] == className) {
        arr[j] = '';
      }
    }
    $el[i].className = arr.join(' ');
  }
}

/**
 * bind an event to element(s)
 * @private
 * @param  array    $el      element object or array
 * @param  string    eventType  name of the event
 * @param  function  fn
 * @param  boolean    useCapture
 */
function bind($el, eventType, fn, useCapture) {
  if (!$el) {
    return;
  }
  if (useCapture === undefined) {
    useCapture = false;
  }
  if (Object.prototype.toString.call($el) != '[object Array]') {
    $el = [$el];
  }
  for (var i=0; i<$el.length; i++) {
    $el[i].addEventListener(eventType, fn, useCapture);
  }
}

/**
 * get formatted date by timestamp
 * @param  int    time
 * @return  object
 */
function getDate(time) {
  var d = time>0 ? new Date(time) : new Date();
  var day = d.getDay()<10 ? '0'+d.getDay() : d.getDay(),
    month = d.getMonth()<9 ? '0'+(d.getMonth()+1) : (d.getMonth()+1),
    year = d.getFullYear(),
    hour = d.getHours()<10 ? '0'+d.getHours() : d.getHours(),
    minute = d.getMinutes()<10 ? '0'+d.getMinutes() : d.getMinutes(),
    second = d.getSeconds()<10 ? '0'+d.getSeconds() : d.getSeconds(),
    millisecond = d.getMilliseconds()<10 ? '0'+d.getMilliseconds() : d.getMilliseconds();
  if (millisecond<100) { millisecond = '0' + millisecond; }
  return {
    time: (+d),
    year: year,
    month: month,
    day: day,
    hour: hour,
    minute: minute,
    second: second,
    millisecond: millisecond
  };
}

/**
 * HTML encode a string
 * @param string text
 * @return string
 */
function htmlEncode(text) {
  return document.createElement('a').appendChild( document.createTextNode(text) ).parentNode.innerHTML;
};

/**
 * export
 */
export default new vConsole();
