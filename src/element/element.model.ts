import { writable } from 'svelte/store';
// import { VConsoleModel } from '../lib/model';

export interface IVConsoleNode {
  nodeType: typeof Node.prototype.nodeType,
  nodeName: typeof Node.prototype.nodeName,
  textContent: typeof Node.prototype.textContent,
  id: typeof Element.prototype.id,
  className: typeof Element.prototype.className,
  attributes: { [name: string]: string }[],
  childNodes: IVConsoleNode[],
  _isExpand?: boolean;
  _isActived?: boolean;
  _isSingleLine?: boolean;
  _isNullEndTag?: boolean;
}

/**
 * Element Store
 */
export const rootNode = writable<IVConsoleNode>();
export const activedNode = writable<IVConsoleNode>();
