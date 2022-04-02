import MutationObserver from 'mutation-observer'
import { get } from 'svelte/store';
import { VConsoleSveltePlugin } from '../lib/sveltePlugin';
import ElementComp from './element.svelte';
import { rootNode, activedNode } from './element.model';
import type { IVConsoleNode } from './element.model';

/**
 * vConsole Element Panel
 */
export class VConsoleElementPlugin extends VConsoleSveltePlugin {
  protected isInited = false;
  protected observer: MutationObserver;
  protected nodeMap: WeakMap<Node, IVConsoleNode>;
  // protected activedNode: IVConsoleNode;

  constructor(id: string, name: string, renderProps = { }) {
    super(id, name, ElementComp, renderProps);
  }

  public onShow() {
    if (this.isInited) {
      return;
    }
    this._init();
  }

  public onRemove() {
    super.onRemove();
    if (this.isInited) {
      this.observer.disconnect();
      this.isInited = false;
      this.nodeMap = undefined;
      rootNode.set(undefined);
    }
  }

  public onAddTool(callback) {
    const toolList = [
      {
        name: 'Expand',
        global: false,
        onClick: (e) => {
          this._expandActivedNode();
        },
      },
      {
        name: 'Collapse',
        global: false,
        onClick: (e) => {
          this._collapseActivedNode();
        },
      },
    ];
    callback(toolList);
  }

  protected _init() {
    this.isInited = true;
    this.nodeMap = new WeakMap();

    // init nodes
    const root = this._generateVNode(document.documentElement);
    root._isExpand = true;
    activedNode.set(root);
    rootNode.set(root);


    // listen component
    this.compInstance.$on('toggleNode', (e) => {
      // console.log('activedNode event', e)
      activedNode.set(e.detail.node);
    });

    // init observer
    this.observer = new MutationObserver((mutations) => {
      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];
        if (this._isInVConsole(mutation.target as Element)) {
          continue;
        }
        this._handleMutation(mutation);
      }
    });

    // start observing
    this.observer.observe(document.documentElement, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  protected _handleMutation(mutation: MutationRecord) {
    // (window as any)._vcOrigConsole.log(mutation.type);
    switch (mutation.type) {
      case 'childList':
        // (window as any)._vcOrigConsole.log(mutation.removedNodes.length, mutation.removedNodes, mutation.addedNodes.length, mutation.addedNodes);
        if (mutation.removedNodes.length > 0) {
          this._onChildRemove(mutation);
        }
        if (mutation.addedNodes.length > 0) {
          this._onChildAdd(mutation);
        }
        break;
      case 'attributes':
        this._onAttributesChange(mutation);
        break;
      case 'characterData':
        this._onCharacterDataChange(mutation);
        break;
      default:
        break;
    }
  }

  protected _onChildRemove(mutation: MutationRecord) {
    const parentNode = this.nodeMap.get(mutation.target);
    if (!parentNode) {
      return;
    }
    for (let i = 0; i < mutation.removedNodes.length; i++) {
      const childNode = this.nodeMap.get(mutation.removedNodes[i]);
      if (!childNode) { continue; }
      // find child node and remove it from parent
      for (let j = 0; j < parentNode.childNodes.length; j++) {
        if (parentNode.childNodes[j] === childNode) {
          parentNode.childNodes.splice(j, 1);
          break;
        }
      }
      this.nodeMap.delete(mutation.removedNodes[i]);
    }
    this._refreshStore();
  }

  protected _onChildAdd(mutation: MutationRecord) {
    const parentNode = this.nodeMap.get(mutation.target);
    if (!parentNode) {
      return;
    }
    for (let i = 0; i < mutation.addedNodes.length; i++) {
      const newRealNode = mutation.addedNodes[i];
      const newNode = this._generateVNode(newRealNode);
      if (!newNode) {
        continue;
      }
      // Find a next sibling "supported node", then append newNode after it.
      // A "supported node" is an element node.
      let nextNode: IVConsoleNode = undefined;
      let nextRealNode = newRealNode;
      do {
        if (nextRealNode.nextSibling === null) {
          break;
        }
        if (nextRealNode.nodeType === Node.ELEMENT_NODE) {
          nextNode = this.nodeMap.get(nextRealNode.nextSibling) || undefined;
        }
        nextRealNode = nextRealNode.nextSibling;
      } while (nextNode === undefined);
      if (nextNode === undefined) {
        // newNode is the lastChild
        parentNode.childNodes.push(newNode);
      } else {
        // newNode should be inserted before nextNode
        for (let j = 0; j < parentNode.childNodes.length; j++) {
          if (parentNode.childNodes[j] === nextNode) {
            parentNode.childNodes.splice(j, 0, newNode);
            break;
          }
        }
      }
    }
    this._refreshStore();
  }

  protected _onAttributesChange(mutation: MutationRecord) {
    this._updateVNodeAttributes(mutation.target);
    this._refreshStore();
  }

  protected _onCharacterDataChange(mutation: MutationRecord) {
    const node = this.nodeMap.get(mutation.target);
    if (!node) {
      return;
    }
    node.textContent = mutation.target.textContent;
    this._refreshStore();
  }

  /**
   * Generate an VNode for rendering views. VNode will be updated if existing.
   * VNode will be stored in a WeakMap.
   */
  protected _generateVNode(elem: Node) {
    if (this._isIgnoredNode(elem)) {
      return undefined;
    }

    const node: IVConsoleNode = {
      nodeType: elem.nodeType,
      nodeName: elem.nodeName.toLowerCase(),
      textContent: '',
      id: '',
      className: '',
      attributes: [],
      childNodes: [],
    };
    this.nodeMap.set(elem, node);
    
    if (
      node.nodeType == elem.TEXT_NODE || 
      node.nodeType == elem.DOCUMENT_TYPE_NODE
      ) {
      node.textContent = elem.textContent;
    }

    // child nodes
    if (elem.childNodes.length > 0) {
      node.childNodes = [];
      for (let i = 0; i < elem.childNodes.length; i++) {
        const child = this._generateVNode(elem.childNodes[i]);
        if (!child) {
          continue;
        }
        node.childNodes.push(child);
      }
    }

    // attributes
    this._updateVNodeAttributes(elem);

    return node;
  }

  protected _updateVNodeAttributes(elem: Node) {
    const node = this.nodeMap.get(elem);
    if (!node) {
      return;
    }
    if (elem instanceof Element) {
      node.id = elem.id || '';
      node.className = elem.className || '';
      // attrs
      if (elem.hasAttributes && elem.hasAttributes()) {
        node.attributes = [];
        for (let i = 0; i < elem.attributes.length; i++) {
          node.attributes.push({
            name: elem.attributes[i].name,
            value: elem.attributes[i].value || '',
          });
        }
      }
    }
  }

  /**
   * Expand the actived node.
   * If the node is collapsed, expand it.
   * If the node is expanded, expand it's child nodes.
   */
  protected _expandActivedNode() {
    const node = get(activedNode);
    if (!node._isExpand) {
      node._isExpand = true;
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        node.childNodes[i]._isExpand = true;
      }
    }
    this._refreshStore();
  }

  /**
   * Collapse the actived node.
   * If the node is expanded, and has expanded child nodes, collapse it's child nodes.
   * If the node is expanded, and has no expanded child node, collapse it self.
   * If the node is collapsed, do nothing.
   */
  protected _collapseActivedNode() {
    const node = get(activedNode);
    if (node._isExpand) {
      let hasExpandedChild = false;
      for (let i = 0; i < node.childNodes.length; i++) {
        if (node.childNodes[i]._isExpand) {
          hasExpandedChild = true;
          node.childNodes[i]._isExpand = false;
        }
      }
      if (!hasExpandedChild) {
        node._isExpand = false;
      }
      this._refreshStore();
    }
  }

  protected _isIgnoredNode(elem: Node) {
    // empty or line-break text
    if (elem.nodeType === elem.TEXT_NODE) {
      if (elem.textContent.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$|\n+/g, '') === '') { // trim
        return true;
      }
    } else if (elem.nodeType === elem.COMMENT_NODE) {
      return true;
    }
    return false;
  }

  protected _isInVConsole(elem: Element) {
    let target = elem;
    while (target !== undefined) {
      if (target.id == '__vconsole') {
        return true;
      }
      target = target.parentElement || undefined;
    }
    return false;
  }

  protected _refreshStore() {
    // update store data
    rootNode.update((node) => node);
  }
}
