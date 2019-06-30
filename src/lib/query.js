/*
Tencent is pleased to support the open source community by making vConsole available.

Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.

Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://opensource.org/licenses/MIT

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * DOM related Functions
 */

import {isArray} from '../lib/tool.js';
import render from '../lib/mito.js';

const $ = {};

/**
 * get single element
 * @public
 */
$.one = function(selector, contextElement) {
  return (contextElement || document).querySelector(selector)
}

/**
 * get multiple elements
 * @public
 */
$.all = function(selector, contextElement) {
  const nodeList = (contextElement || document).querySelectorAll(selector)
  return Array.from(nodeList)
}

/**
 * add className(s) to an or multiple element(s)
 * @public
 */
$.addClass = function($el, className) {
  if (!$el) {
    return;
  }
  if (!isArray($el)) {
    $el = [$el];
  }
  for (let i=0; i<$el.length; i++) {
    if (isArray(className)) {
      className.forEach(name => $el[0].classList.add(name));
    } else if (className.split(' ')[1]) {
      className.split(' ').forEach(name => $el[0].classList.add(name))
    } else {
      $el[0].classList.add(className);
    }
  }
}

/**
 * remove className(s) from an or multiple element(s)
 * @public
 */
$.removeClass = function($el, className) {
  if (!$el) {
    return;
  }
  if (!isArray($el)) {
    $el = [$el];
  }
  for (let i=0; i<$el.length; i++) {
    if (isArray(className)) {
      className.forEach(name => $el[0].classList.remove(name));
    } else if (className.split(' ')[1]) {
      className.split(' ').forEach(name => $el[0].classList.remove(name))
    } else {
      $el[0].classList.remove(className);
    }
  }
}

/**
 * see whether an element contains a className
 * @public
 */
$.hasClass = function($el, className) {
  if (!$el) {
    return false;
  }
  return $el.classList.contains(className)
}

/**
 * bind an event to element(s)
 * @public
 * @param  array    $el      element object or array
 * @param  string    eventType  name of the event
 * @param  function  fn
 * @param  boolean    useCapture
 */
$.bind = function($el, eventType, fn, useCapture) {
  if (!$el) {
    return;
  }
  if (!isArray($el)) {
    $el = [$el];
  }
  $el.forEach(el => el.addEventListener(eventType, fn, !!useCapture))
}

/**
 * delegate an event to a parent element
 * @public
 * @param  array     $el        parent element
 * @param  string    eventType  name of the event
 * @param  string    selector   target's selector
 * @param  function  fn
 */
$.delegate = function($el, eventType, selector, fn) {
  if (!$el) { return; }
  $el.addEventListener(eventType, function(e) {
    let targets = $.all(selector, $el);
    if (!targets) {
      return;
    }
    findTarget:
    for (let i=0; i<targets.length; i++) {
      let $node = e.target;
      while ($node) {
        if ($node == targets[i]) {
          fn.call($node, e);
          break findTarget;
        }
        $node = $node.parentNode;
        if ($node == $el) {
          break;
        }
      }
    }
  }, false);
};

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