/**
 * DOM related Functions
 *
 * @author WechatFE
 */

import {isArray} from '../lib/tool.js';

const $ = {};

/**
 * get single element
 * @private
 */
$.one = function(selector, contextElement) {
  if (contextElement) {
    return contextElement.querySelector(selector);
  }
  return document.querySelector(selector);
}

/**
 * get multiple elements
 * @private
 */
$.all = function(selector, contextElement) {
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
$.addClass = function($el, className) {
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
$.removeClass = function($el, className) {
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
$.hasClass = function($el, className) {
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
$.bind = function($el, eventType, fn, useCapture) {
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
 * simply render a HTML template
 * @param string tpl
 * @param object key-value data
 * @return string
 */
$.render = function(tpl, data) {
  var html = tpl;
  for (var k in data) {
    html = html.replace('{' + k + '}', data[k]);
  }
  return html;
}


/**
 * export
 */
export default $;