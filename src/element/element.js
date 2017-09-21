/*
Tencent is pleased to support the open source community by making vConsole available.

Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.

Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://opensource.org/licenses/MIT

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * vConsole Element Tab
 */

import './style.less';
import VConsolePlugin from '../lib/plugin.js';
import tplTabbox from './tabbox.html';
import NodeView from './node_view.js';

import * as tool from '../lib/tool.js';
import $ from '../lib/query.js';

class VConsoleElementsTab extends VConsolePlugin {

  constructor(...args) {
    super(...args);
    let that = this;

    that.isInited = false;
    that.node = {};
    that.$tabbox = $.render(tplTabbox, {});
    that.nodes = [];
    that.activedElem = {}; // actived by user

    let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    that.observer = new MutationObserver(function(mutations) {
      for (let i=0; i<mutations.length; i++) {
        let mutation = mutations[i];
        if (that._isInVConsole(mutation.target)) {
          continue;
        }
        that.onMutation(mutation);
      }
    });
  }

  onRenderTab(callback) {
    callback(this.$tabbox);
  }

  onAddTool(callback) {
    let that = this;
    let toolList = [{
      name: 'Expend',
      global: false,
      onClick: function(e) {
        if (that.activedElem) {
          if (!$.hasClass(that.activedElem, 'vc-toggle')) {
            // $.addClass(that.activedElem, 'vc-toggle');
            $.one('.vcelm-node', that.activedElem).click();
          } else {
            for (let i=0; i<that.activedElem.childNodes.length; i++) {
              let $child = that.activedElem.childNodes[i];
              if ($.hasClass($child, 'vcelm-l') && !$.hasClass($child, 'vcelm-noc') && !$.hasClass($child, 'vc-toggle')) {
                $.one('.vcelm-node', $child).click();
                break;
              }
            }
          }
        }
      }
    }, {
      name: 'Collapse',
      global: false,
      onClick: function(e) {
        if (that.activedElem) {
          if ($.hasClass(that.activedElem, 'vc-toggle')) {
            $.one('.vcelm-node', that.activedElem).click();
          } else {
            if (that.activedElem.parentNode && $.hasClass(that.activedElem.parentNode, 'vcelm-l')) {
              $.one('.vcelm-node', that.activedElem.parentNode).click();
            }
          }
        }
      }
    }];
    callback(toolList);
  }

  onShow() {
    if (this.isInited) {
      return;
    }
    this.isInited = true;

    this.node = this.getNode(document.documentElement);
    // console.log(this.node);

    // render root view
    let $rootView = this.renderView(this.node, $.one('.vc-log', this.$tabbox));
    // auto open first level
    let $node = $.one('.vcelm-node', $rootView);
    $node && $node.click();

    // start observing
    let config = {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true
    };
    this.observer.observe(document.documentElement, config);
  }

  onRemove() {
    this.observer.disconnect();
  }

  // handle mutation
  onMutation(mutation) {
    // console.log(mutation.type, mutation);
    switch (mutation.type) {
      case 'childList':
        if (mutation.removedNodes.length > 0) {
          this.onChildRemove(mutation);
        }
        if (mutation.addedNodes.length > 0) {
          this.onChildAdd(mutation);
        }
        break;
      case 'attributes':
        this.onAttributesChange(mutation);
        break;
      case 'characterData':
        this.onCharacterDataChange(mutation);
        break;
      default:
        break;
    }
  }

  onChildRemove(mutation) {
    let $parent = mutation.target,
        parentNode = $parent.__vconsole_node;
    if (!parentNode) {
      return;
    }
    for (let i=0; i<mutation.removedNodes.length; i++) {
      let $target = mutation.removedNodes[i],
          node = $target.__vconsole_node;
      if (!node) {
        continue;
      }
      // remove view
      if (node.view) {
        node.view.parentNode.removeChild(node.view);
      }
    }
    // update parent node
    this.getNode($parent);
  }

  onChildAdd(mutation) {
    let $parent = mutation.target,
        parentNode = $parent.__vconsole_node;
    // console.log('parentNode', parentNode)
    if (!parentNode) {
      return;
    }
    // update parent node
    this.getNode($parent);
    // update parent view
    if (parentNode.view) {
      $.removeClass(parentNode.view, 'vcelm-noc');
    }
    for (let i=0; i<mutation.addedNodes.length; i++) {
      let $target = mutation.addedNodes[i],
          node = $target.__vconsole_node; // added right now
      // console.log('node:', node)
      if (!node) {
        continue;
      }
      // create view
      if (mutation.nextSibling !== null) {
        // insert before it's sibling
        let siblingNode = mutation.nextSibling.__vconsole_node;
        if (siblingNode.view) {
          this.renderView(node, siblingNode.view, 'insertBefore');
        }
      } else {
        // append to parent view
        if (parentNode.view) {
          if (parentNode.view.lastChild) {
            // insert before last child, eg: </tag>
            this.renderView(node, parentNode.view.lastChild, 'insertBefore');
          } else {
            this.renderView(node, parentNode.view);
          }
        }
      }
    }
  }

  onAttributesChange(mutation) {
    let node = mutation.target.__vconsole_node;
    if (!node) {
      return;
    }
    // update node
    node = this.getNode(mutation.target);
    // update view
    if (node.view) {
      this.renderView(node, node.view, true);
    }
  }

  onCharacterDataChange(mutation) {
    let node = mutation.target.__vconsole_node;
    if (!node) {
      return;
    }
    // update node
    node = this.getNode(mutation.target);
    // update view
    if (node.view) {
      this.renderView(node, node.view, true);
    }
  }

  renderView(node, $related, renderMethod) {
    let that = this;
    let $view = (new NodeView(node)).get();
    // connect to node
    node.view = $view;
    // expend
    $.delegate($view, 'click', '.vcelm-node', function(event) {
      event.stopPropagation();
      let $parent = this.parentNode;
      if ($.hasClass($parent, 'vcelm-noc')) {
        return;
      }
      that.activedElem = $parent;
      if ($.hasClass($parent, 'vc-toggle')) {
        $.removeClass($parent, 'vc-toggle');
      } else {
        $.addClass($parent, 'vc-toggle');
      }
      // render child views
      let childIdx = -1;
      for (let i=0; i<$parent.children.length; i++) {
        let $child = $parent.children[i];
        if (!$.hasClass($child, 'vcelm-l')) {
          // not a child view, skip
          continue;
        }
        childIdx++;
        if ($child.children.length > 0) {
          // already been rendered, skip
          continue;
        }
        if (!node.childNodes[childIdx]) {
          // cannot find related node, hide it
          $child.style.display = 'none';
          continue;
        }
        that.renderView(node.childNodes[childIdx], $child, 'replace');
      }
    });
    // output to page
    switch (renderMethod) {
      case 'replace':
        $related.parentNode.replaceChild($view, $related);
        break;
      case 'insertBefore':
        $related.parentNode.insertBefore($view, $related);
        break;
      default:
        $related.appendChild($view);
        break;
    }
    return $view;
  }

  // convert an element to a simple object
  getNode(elem) {
    if (this._isIgnoredElement(elem)) {
      return undefined;
    }

    let node = elem.__vconsole_node || {};

    // basic node info
    node.nodeType = elem.nodeType;
    node.nodeName = elem.nodeName;
    node.tagName = elem.tagName || '';
    node.textContent = '';
    if (
      node.nodeType == elem.TEXT_NODE || 
      node.nodeType == elem.DOCUMENT_TYPE_NODE
      ) {
      node.textContent = elem.textContent;
    }

    // attrs
    node.id = elem.id || '';
    node.className = elem.className || '';
    node.attributes = [];
    if (elem.hasAttributes && elem.hasAttributes()) {
      for (let i=0; i<elem.attributes.length; i++) {
        node.attributes.push({
          name: elem.attributes[i].name,
          value: elem.attributes[i].value || ''
        });
      }
    }

    // child nodes
    node.childNodes = [];
    if (elem.childNodes.length > 0) {
      for (let i=0; i<elem.childNodes.length; i++) {
        let child = this.getNode(elem.childNodes[i]);
        if (!child) {
          continue;
        }
        node.childNodes.push(child);
      }
    }

    // save node to element for further actions
    elem.__vconsole_node = node;
    return node;
  }

  _isIgnoredElement(elem) {
    // empty or line-break text
    if (elem.nodeType == elem.TEXT_NODE) {
      if (elem.textContent.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$|\n+/g, '') == '') { // trim
        return true;
      }
    }
    return false;
  }

  _isInVConsole(elem) {
    let target = elem;
    while (target != undefined) {
      if (target.id == '__vconsole') {
        return true;
      }
      target = target.parentNode || undefined;
    }
    return false;
  }

} // END class

export default VConsoleElementsTab;