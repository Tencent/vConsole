/**
 * DOM related Functions
 *
 * @author WechatFE
 */

import {isArray} from '../lib/tool.js';
import render from '../lib/mito.js';

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
  let nodeList,
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
  for (let $e of $el) {
    $e.className += ' ' + className;
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
  for (let $e of $el) {
    let arr = $e.className.split(' ');
    for (let j=0; j<arr.length; j++) {
      if (arr[j] == className) {
        arr[j] = '';
      }
    }
    $e.className = arr.join(' ');
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
  let arr = $el.className.split(' ');
  for (let name of arr) {
    if (name == className) {
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
  for (let $e of $el) {
    $e.addEventListener(eventType, fn, useCapture);
  }
}

/**
 * simply render a HTML template
 * @param string tpl
 * @param object key-value data
 * @param boolean whether to conver to HTML string
 * @return object|string
 */
$.render = render;


/**
 * export
 */
export default $;