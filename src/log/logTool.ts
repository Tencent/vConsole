import * as tool from '../lib/tool';
import type { IVConsoleLog, IVConsoleLogData } from './log.model';

const getPreviewText = (val: any) => {
  const json = tool.safeJSONStringify(val, { maxDepth: 0 });
  let preview = json.substring(0, 36);
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


// keywords: `%c | %s | %d | %o`, must starts or ends with a blank
const logFormattingPattern = /(\%[csdo] )|( \%[csdo])/g;
/**
 * Styling log output (`%c`), or string substitutions (`%s`, `%d`, `%o`).
 * Apply to the first log only.
 */
export const getLogDatasWithFormatting = (origDatas: any[]) => {
  // reset RegExp.lastIndex to ensure search starts from beginning
  logFormattingPattern.lastIndex = 0;
  if (tool.isString(origDatas[0]) && logFormattingPattern.test(origDatas[0])) {
    const rawDatas = [...origDatas];
    const firstData: string = rawDatas.shift();

    // use firstData as display logs
    const mainLogs = firstData.split(logFormattingPattern).filter((val) => {
      return val !== undefined && val !== '';
    });
    // use remain logs as replace item
    const subLogs = rawDatas;

    const logDataList: IVConsoleLogData[] = [];
    let isSetOrigData = false;
    let origData: any;
    let style = '';
    while (mainLogs.length > 0) {
      const mainText = mainLogs.shift();
      
      if (/ ?\%c ?/.test(mainText)) {
        // Use subLogs[0] as CSS style.
        // If subLogs[0] is not set, use original mainText as origData.
        // If subLogs[0] is not a string, then leave style empty.
        if (subLogs.length > 0) {
          style = subLogs.shift();
          if (typeof style !== 'string') {
            style = '';
          }
        } else {
          origData = mainText;
          style = '';
          isSetOrigData = true;
        }
      } else if (/ ?\%[sd] ?/.test(mainText)) {
        // Use subLogs[0] as origData (as String).
        // If subLogs[0] is not set, use original mainText as origData.
        // If subLogs[0] is not a string, convert it to a string.
        if (subLogs.length > 0) {
          origData = tool.isObject(subLogs[0]) ? tool.getObjName(subLogs.shift()) : String(subLogs.shift());
        } else {
          origData = mainText;
        }
        isSetOrigData = true;
      } else if (/ ?\%o ?/.test(mainText)) {
        // Use subLogs[0] as origData (as original Object value).
        // If subLogs[0] is not set, use original mainText as origData.
        origData = subLogs.length > 0 ? subLogs.shift() : mainText;
        isSetOrigData = true;
      } else {
        origData = mainText;
        isSetOrigData = true;
      }

      if (isSetOrigData) {
        const log: IVConsoleLogData = { origData };
        if (style) {
          log.style = style;
        }
        logDataList.push(log);
        // reset
        isSetOrigData = false;
        origData = undefined;
        style = '';
      }
    }
    // If there are remaining subLogs, add them to logs.
    for (let i = 0; i < subLogs.length; i++) {
      logDataList.push({
        origData: subLogs[i],
      });
    }
    // (window as any)._vcOrigConsole.log('getLogDataWithSubstitutions format', logDataList);
    return logDataList;
  } else {
    const logDataList: IVConsoleLogData[] = [];
    for (let i = 0; i < origDatas.length; i++) {
      logDataList.push({
        origData: origDatas[i],
      });
    }
    // (window as any)._vcOrigConsole.log('getLogDataWithSubstitutions normal', logDataList);
    return logDataList;
  }
};


/**
 * An empty class for rendering views.
 */
export class VConsoleUninvocatableObject {

}
