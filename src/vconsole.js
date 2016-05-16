/**
 * A Front-End Console Panel for Mobile Webpage
 *
 * @author WechatFE
 */

import './vconsole.less';
import tpl from './tpl.html';
import tplFold from './tpl_fold.html';

/**
 * initial
 * @constructor
 */
function vConsole() {
  var that = this;

  this.html = tpl;
  this.$dom = null;
  this.activedTab = 'default';
  this.tabList = ['default', 'system', 'network'];
  this.console = {}; // store native console methods
  this.logList = []; // store logs when vConsole is not ready
  this.isReady = false;

  that._mokeConsole();
  that._mokeAjax();

  bind(window, 'load', function() {
    that._render();
    that._bindEvent();
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

  // log-related actions
  bind($$('.vc-log'), 'click', function(e) {
    var target = e.target;
    // expand a line
    if (hasClass(target, 'vc-fold-outer')) {
      if (hasClass(target.parentElement, 'vc-toggle')) {
        removeClass(target.parentElement, 'vc-toggle');
      } else {
        addClass(target.parentElement, 'vc-toggle');
      }
      e.preventDefault();
    }
  });
};

/**
 * replace window.console & window.onerror with vConsole method
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
  window.console.log = function() { that._printLog('auto', 'log', arguments); };
  window.console.info = function() { that._printLog('auto', 'info', arguments); };
  window.console.warn = function() { that._printLog('auto', 'warn', arguments); };
  window.console.debug = function() { that._printLog('auto', 'debug', arguments); };
  window.console.error = function() { that._printLog('auto', 'error', arguments); };

  window.onerror = function(message, source, lineno, colno, error) {
    var stack = error.stack.split('at');
    stack = stack[0] + ' ' + stack[1];
    stack = stack.replace(location.origin, '');
    console.error(stack);
  };
};

/**
 * moke ajax requst
 * @private
 */
vConsole.prototype._mokeAjax = function() {
  var _XMLHttpRequest = window.XMLHttpRequest;

  if (!_XMLHttpRequest) { return; }

  var _open = window.XMLHttpRequest.prototype.open;
  var _send = window.XMLHttpRequest.prototype.send;

  window.XMLHttpRequest.prototype.open = function() {
    var that = this;
    var _arguments = arguments;

    // lazy assign onreadystatechange
    setTimeout(function() {
      var _onreadystatechange = that.onreadystatechange || function(){};
      that.onreadystatechange = function() {
        if (that.readyState == 4) {
          that._endTime = +new Date();
          var url = _arguments[1] || 'unknow URL',
              costTime = that._endTime - (that._startTime || that._endTime);
          var log = '[network][' + that.status + '] [' + costTime + 'ms] ' + url;
          if (that.status >= 200 && that.status < 400) {
            console.log(log);
          } else {
            console.error(log);
          } 
        }

        return _onreadystatechange.apply(that, arguments);
      };
    }, 0);

    return _open.apply(that, _arguments);
  };
  window.XMLHttpRequest.prototype.send = function() {
    var that = this;
    var _arguments = arguments;
    that._startTime = +new Date();
    setTimeout(function() {
      _send.apply(that, _arguments);
    }, 1);
  };

};

/**
 * auto run after initialization
 * @private
 */
vConsole.prototype._autoRun = function() {
  this.isReady = true;

  // print logList
  while (this.logList.length > 0) {
    var log = this.logList.shift();
    this._printLog(log.tabName, log.logType, log.logs);
  }

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
};

/**
 * print a log to log box
 * @private
 * @param  string  tabName    auto|default|system
 * @param  string  logType    log|info|debug|error|warn
 * @param  array  logs
 */
vConsole.prototype._printLog = function(tabName, logType, logs) {
  if (!logs.length) {
    return;
  }

  // if vConsole is not ready, save current log to logList
  if (!this.isReady) {
    this.logList.push({
      tabName: tabName,
      logType: logType,
      logs: logs
    });
    return;
  }

  // generate plain text for a line
  var line = '';
  for (var i=0; i<logs.length; i++) {
    try {
      if (isFunction(logs[i])) {
        line += ' ' + logs[i].toString();
      } else if (isObject(logs[i]) || isArray(logs[i])) {
        line += ' ' + this._getFoldedLine(logs[i]);
      } else {
        line += ' ' + htmlEncode(logs[i]).replace(/\n/g, '<br/>');
      }
    } catch (e) {
      line += ' [' + (typeof logs[i]) + ']';
    }
  }

  // auto select tab
  if (tabName == 'auto') {
    var pattern = /^ \[(\w+)\]/i;
    var match = line.match(pattern);
    if (match !== null && match.length > 0 && this.tabList.indexOf(match[1]) > -1) {
      tabName = match[1];
      line = line.replace(pattern, '');
    }
  }
  if (tabName == 'auto') {
    tabName = 'default';
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
 * generate the HTML of a folded line
 * @private
 */
vConsole.prototype._getFoldedLine = function(obj, outerText) {
  var json = JSON.stringify(obj);
  var outer = '',
      inner = '',
      preview = '';
  var lv = 0,
      p = '  ';

  preview = json.substr(0, 30);
  if (json.length > 30) {
    preview += '...';
  }

  outer = Object.prototype.toString.call(obj).replace('[object ', '').replace(']', '');
  outer += ' ' + preview;
  
  function _iterateObj(val) {
    if (isObject(val)) {
      var keys = Object.keys(val);
      inner += "{\n";
      lv++;
      for (var i=0; i<keys.length; i++) {
        var k = keys[i];
        if (!val.hasOwnProperty(k)) { continue; }
        inner += Array(lv+1).join(p) + '<i class="vc-code-key">' + k + "</i>: ";
        _iterateObj(val[k]);
        if (i < keys.length - 1) {
          inner += ",\n";
        }
      }
      lv--;
      inner += "\n" + Array(lv+1).join(p) + "}";
    } else if (isArray(val)) {
      inner += "[\n";
      lv++;
      for (var i=0; i<val.length; i++) {
        inner += Array(lv+1).join(p) + '<i class="vc-code-key">' + i + "</i>: ";
        _iterateObj(val[i]);
        if (i < val.length - 1) {
          inner += ",\n";
        }
      }
      lv--;
      inner += "\n" + Array(lv+1).join(p) + "]";
    } else {
      if (isString(val)) {
        inner += '<i class="vc-code-string">"' + val + '"</i>';
      } else if (isNumber(val)) {
        inner += '<i class="vc-code-number">' + val + "</i>";
      } else {
        inner += JSON.stringify(val);
      }
    }
  }
  _iterateObj(obj);

  var line = render(tplFold, {outer: outer, inner: inner});
  return line;
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
 * !!! this method is deprecated, callback will always be called !!!
 * @deprecated
 * @public
 * @param	function	callback
 */
vConsole.prototype.ready = function(callback) {
  console.warn('vConsole.ready() is deprecated, console.log() can be called at anytime without waiting for ready. This method will be removed at v2.0.0 and later');
  callback && callback.call(this);
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
  if (!isArray($el)) {
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
  if (!isArray($el)) {
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
 * see whether an element contains a className
 * @private
 */
function hasClass($el, className) {
  if (!$el) {
    return false;
  }
  var arr = $el.className.split(' ');
  for (var i=0; i<arr.length; i++) {
    if (arr[i] == className) {
      return true;
    }
  }
  return false;
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
  if (!isArray($el)) {
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
 * simply render a HTML template
 * @param string tpl
 * @param object key-value data
 * @return string
 */
function render(tpl, data) {
  var html = tpl;
  for (var k in data) {
    html = html.replace('{' + k + '}', data[k]);
  }
  return html;
}


function isNumber(value) {
  return Object.prototype.toString.call(value) == '[object Number]';
}
function isString(value) {
  return Object.prototype.toString.call(value) == '[object String]';
}
function isArray(value) {
  return Object.prototype.toString.call(value) == '[object Array]';
}
function isObject(value) {
  return Object.prototype.toString.call(value) == '[object Object]';
}
function isFunction(value) {
  return Object.prototype.toString.call(value) == '[object Function]';
}

/**
 * export
 */
export default new vConsole();
