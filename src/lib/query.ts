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

import { isArray } from './tool';

const $ = {

  /**
   * get single element
   * @public
   */
  one: function(selector: string, contextElement: Element | Document = document) {
    try {
      return <HTMLElement>contextElement.querySelector(selector) || undefined;
    } catch (e) {
      return undefined;
    }
  },

  /**
   * get multiple elements
   * @public
   */
  all: function(selector: string, contextElement: Element | Document = document) {
    try {
      const nodeList = <NodeListOf<HTMLElement>>contextElement.querySelectorAll(selector);
      return <HTMLElement[]>[].slice.call(nodeList);
    } catch (e) {
      return <HTMLElement[]>[];
    }
  },

  /**
   * add className(s) to an or multiple element(s)
   * @public
   */
  addClass: function($el: Element | Element[], className: string) {
    if (!$el) {
      return;
    }
    const $els = isArray($el) ? <Element[]>$el : [<Element>$el];
    for (let i = 0; i < $els.length; i++) {
      const name = $els[i].className || '';
      const arr = name.split(' ');
      if (arr.indexOf(className) > -1) {
        continue;
      }
      arr.push(className);
      $els[i].className = arr.join(' ');
    }
  },

  /**
   * remove className(s) from an or multiple element(s)
   * @public
   */
  removeClass: function($el: Element | Element[], className: string) {
    if (!$el) {
      return;
    }
    const $els = isArray($el) ? <Element[]>$el : [<Element>$el];
    for (let i = 0; i < $els.length; i++) {
      const arr = $els[i].className.split(' ');
      for (let j = 0; j < arr.length; j++) {
        if (arr[j] == className) {
          arr[j] = '';
        }
      }
      $els[i].className = arr.join(' ').trim();
    }
  },

  /**
   * see whether an element contains a className
   * @public
   */
  hasClass: function($el: Element, className: string) {
    if (!$el || !$el.classList) {
      return false;
    }
    return $el.classList.contains(className);
  },

  /**
   * bind an event to element(s)
   * @public
   */
  bind: function($el: Element | Element[], eventType: any, fn: any, useCapture: boolean = false) {
    if (!$el) {
      return;
    }
    const $els = isArray($el) ? <Element[]>$el : [<Element>$el];
    $els.forEach(($elm) => {
      $elm.addEventListener(eventType, fn, !!useCapture);
    })
  },

  /**
   * delegate an event to a parent element
   * @public
   * @param  $el        parent element
   * @param  eventType  name of the event
   * @param  selector   target's selector
   * @param  fn         callback function
   */
  delegate: function($el: Element, eventType: string, selector: string, fn: (event: Event, $target: HTMLElement) => void) {
    if (!$el) { return; }
    $el.addEventListener(eventType, function(e) {
      const $targets = $.all(selector, $el);
      if (!$targets) {
        return;
      }
      findTarget:
      for (let i = 0; i < $targets.length; i++) {
        let $node = <Node>e.target;
        while ($node) {
          if ($node == $targets[i]) {
            fn.call($node, e, $node);
            break findTarget;
          }
          $node = $node.parentNode;
          if ($node == $el) {
            break;
          }
        }
      }
    }, false);
  },

  /**
   * Remove all child elements of an element.
   */
  removeChildren($el: Element) {
    while ($el.firstChild) {
      $el.removeChild($el.lastChild);
    }
    return $el;
  },
};


/**
 * export
 */
export default $;