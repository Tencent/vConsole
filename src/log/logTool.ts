import * as tool from '../lib/tool';
import type { IVConsoleLog } from './log.model';

const getPreviewText = (val: any) => {
  const json = tool.safeJSONStringify(val, 0);
  let preview = json.substr(0, 36);
  let ret = tool.getObjName(val);
  if (json.length > 36) {
    preview += '...';
  }
  // ret = tool.getVisibleText(tool.htmlEncode(ret + ' ' + preview));
  ret = tool.getVisibleText(ret + ' ' + preview);
  return ret;
};

/**
 * Get a value's text content and its type.
 */
export const getValueTextAndType = (val: any, wrapString = true) => {
  let valueType = 'undefined';
  let text = val;
  if (val instanceof VConsoleUninvocatableObject) {
    valueType = 'uninvocatable';
    text = '(...)';
  } else if (tool.isArray(val)) {
    valueType = 'array';
    text = getPreviewText(val);
  } else if (tool.isObject(val)) {
    valueType = 'object';
    text = getPreviewText(val);
  } else if (tool.isString(val)) {
    valueType = 'string';
    text = tool.getVisibleText(val);
    if (wrapString) {
      text = '"' + text + '"';
    }
  } else if (tool.isNumber(val)) {
    valueType = 'number';
    text = String(val);
  } else if (tool.isBigInt(val)) {
    valueType = 'bigint';
    text = String(val) + 'n';
  } else if (tool.isBoolean(val)) {
    valueType = 'boolean';
    text = String(val);
  } else if (tool.isNull(val)) {
    valueType = 'null';
    text = 'null';
  } else if (tool.isUndefined(val)) {
    valueType = 'undefined';
    text = 'undefined';
  } else if (tool.isFunction(val)) {
    valueType = 'function';
    text = (val.name || 'function') + '()';
  } else if (tool.isSymbol(val)) {
    valueType = 'symbol';
    text = String(val);
  }
  return { text, valueType };
}

const frontIdentifierList = ['.', '[', '(', '{', '}'];
const backIdentifierList = [']', ')', '}'];

const _getIdentifier = (text: string, identifierList: string[], startPos = 0) => {
  // for case 'aa.bb.cc'
  const ret = {
    text: '',        // '.'
    pos: -1,         // 5
    before: '',      // 'aa.bb'
    after: '',       // 'cc'
  };
  for (let i = text.length - 1; i >= startPos; i--) {
    const idx = identifierList.indexOf(text[i]);
    if (idx > -1) {
      ret.text = identifierList[idx];
      ret.pos = i;
      ret.before = text.substring(startPos, i);
      ret.after = text.substring(i + 1, text.length);
      break;
    }
  }
  return ret;
};

/**
 * A simple parser to get `[` or `]` information.
 */
export const getLastIdentifier = (text: string) => {
  const front = _getIdentifier(text, frontIdentifierList, 0);
  const back = _getIdentifier(text, backIdentifierList, front.pos + 1);
  return {
    front,
    back,
  };
};

export const isMatchedFilterText = (log: IVConsoleLog, filterText: string) => {
  if (filterText === '') { return true; }
  for (let i = 0; i < log.data.length; i++) {
    const type = typeof log.data[i].origData;
    if (type === 'string') {
      if (log.data[i].origData.indexOf(filterText) > -1) {
        return true;
      }
    }
  }
  return false;
};


/**
 * An empty class for rendering views.
 */
export class VConsoleUninvocatableObject {

}
