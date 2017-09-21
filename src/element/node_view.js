/*
Tencent is pleased to support the open source community by making vConsole available.

Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.

Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://opensource.org/licenses/MIT

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * Node View
 */

import tplNodeHead from './tpl_node_head.html';
import tplNodeFoot from './tpl_node_foot.html';

import * as tool from '../lib/tool.js';
import $ from '../lib/query.js';

class NodeView {
  
  constructor(node) {
    this.node = node;
    this.view = this._create(this.node);
  }

  get() {
    return this.view;
  }



  _create(node, isRoot) {
    let view = document.createElement('DIV');
    $.addClass(view, 'vcelm-l');
    switch (node.nodeType) {
      case view.ELEMENT_NODE:
        this._createElementNode(node, view);
        break;
      case view.TEXT_NODE:
        this._createTextNode(node, view);
        break;
      case view.COMMENT_NODE:

      case view.DOCUMENT_NODE:

      case view.DOCUMENT_TYPE_NODE:

      case view.DOCUMENT_FRAGMENT_NODE:
        break;
    }
    return view;
  }

  _createTextNode(node, view) {
    $.addClass(view, 'vcelm-t vcelm-noc');
    if (!node.textContent) {
      return;
    }

    view.appendChild( _text(_trim(node.textContent)) );    
  }

  _createElementNode(node, view) {
    let isNullEnd = isNullEndTag(node.tagName),
        isSingleLine = isNullEnd;
    if (node.childNodes.length == 0) {
      isSingleLine = true;
    }

    let nodeHead = $.render(tplNodeHead, {node: node});
    let nodeFoot = $.render(tplNodeFoot, {node: node});

    if (isSingleLine) {

      $.addClass(view, 'vcelm-noc');
      view.appendChild(nodeHead);
      if (!isNullEnd) {
        view.appendChild(nodeFoot);
      }

    } else {

      view.appendChild(nodeHead);

      // create child nodes
      for (let i=0; i<node.childNodes.length; i++) {
        // create a placeholder for child view,
        // rather than `childView = this._create(node.childNodes[i])`
        let childView = document.createElement('DIV');
        $.addClass(childView, 'vcelm-l');
        view.appendChild(childView);
      }

      if (!isNullEnd) {
        view.appendChild(nodeFoot);
      }
    }

    // no return
  }

} // END class


/********************************************************************
 Helper Functions
 *******************************************************************/

/**
 * Is <link/> or <link></link> ?
 * @return boolean
 */
function isNullEndTag(tagName) {
  let names = ['br', 'hr', 'img', 'input', 'link', 'meta'];
  tagName = tagName ? tagName.toLowerCase() : '';
  return names.indexOf(tagName) > -1 ? true : false;
}


/**
 * Create text node
 * @return object
 */
function _text(str) {
  return document.createTextNode(str);
}

function _trim(str) {
  return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
}


export default NodeView;