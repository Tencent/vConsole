import { writable, get } from 'svelte/store';
import * as tool from '../lib/tool';
import { VConsoleModel } from '../lib/model';

/**********************************
 * Interfaces
 **********************************/

export type IConsoleLogMethod = 'log' | 'info' | 'debug' | 'warn' | 'error';

export interface IVConsoleLogData {
  origData: any; // The original logging data
  // type: '' | 'object' | 'array' | 'string' | 'number' | 'bigint' | 'boolean' | 'null' | 'undefined' | 'function' | 'symbol';
  // textContent: string;
  isPrivate?: boolean;
  isToggle?: boolean;
  isTree?: boolean;
}

export interface IVConsoleLog {
  _id: string;
  type: IConsoleLogMethod;
  cmdType?: 'input' | 'output';
  date: number;
  data: IVConsoleLogData[]; // the `args: any[]` of `console.log(...args)`
}

export type IVConsoleLogListMap = { [pluginId: string]: IVConsoleLog[] };
export type IVConsoleLogFilter = { [pluginId: string]: string };

export interface IVConsoleAddLogOptions {
  noOrig?: boolean;
  cmdType?: 'input' | 'output';
}


/**********************************
 * Stores
 **********************************/

export const logListMap = writable<IVConsoleLogListMap>({});
export const logFilter = writable<IVConsoleLogFilter>({});



/**********************************
 * Methods and Classes
 **********************************/

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
export const getLastIdentifier = (text: string) => {
  const front = _getIdentifier(text, frontIdentifierList, 0);
  const back = _getIdentifier(text, backIdentifierList, front.pos + 1);
  return {
    front,
    back,
  };
};


/**
 * An empty class.
 */
export class VConsoleUninvocatableObject {

}


/**********************************
 * Model
 **********************************/

export class VConsoleLogModel extends VConsoleModel {
  public readonly LOG_METHODS: IConsoleLogMethod[] = ['log', 'info', 'warn', 'debug', 'error'];
  public ADDED_LOG_PLUGIN_ID: string[] = [];
  public maxLogNumber: number = 1000;
  protected pluginPattern: RegExp;

  /**
   * The original `window.console` methods.
   */
  public origConsole: { [method: string]: Function } = {};


  /**
   * Bind a Log plugin.
   * When binding first plugin, `window.console` will be hooked.
   */
  public bindPlugin(pluginId: string) {
    if (this.ADDED_LOG_PLUGIN_ID.indexOf(pluginId) > -1) {
      return false;
    }
    if (this.ADDED_LOG_PLUGIN_ID.length === 0) {
      this.mockConsole();
    }

    logListMap.update((listMap) => {
      listMap[pluginId] = [];
      return listMap;
    });
    this.ADDED_LOG_PLUGIN_ID.push(pluginId);
    this.pluginPattern = new RegExp(`^\\[(${this.ADDED_LOG_PLUGIN_ID.join('|')})\\]$`, 'i');
    // this.callOriginalConsole('info', 'bindPlugin:', this.pluginPattern);
    return true;
  }

  /**
   * Unbind a Log plugin.
   * When no binded plugin exists, hooked `window.console` will be recovered.
   */
  public unbindPlugin(pluginId: string) {
    const idx = this.ADDED_LOG_PLUGIN_ID.indexOf(pluginId);
    if (idx === -1) { return false; }

    this.ADDED_LOG_PLUGIN_ID.splice(idx, 1);
    logListMap.update((listMap) => {
      listMap[pluginId] = [];
      delete listMap[pluginId];
      return listMap;
    });

    if (this.ADDED_LOG_PLUGIN_ID.length === 0) {
      this.unmockConsole();
    }
    return true;
  }

  /**
   * Hook `window.console` with vConsole log method.
   * Methods will be hooked only once. 
   */
  public mockConsole() {
    if (typeof this.origConsole.log === 'function') {
      return;
    }
    const methodList = this.LOG_METHODS;

    // save original console object
    if (!window.console) {
      (<any>window.console) = {};
    } else {
      methodList.map((method) => {
        this.origConsole[method] = window.console[method];
      });
      this.origConsole.time = window.console.time;
      this.origConsole.timeEnd = window.console.timeEnd;
      this.origConsole.clear = window.console.clear;
    }

    methodList.map((method) => {
      window.console[method] = ((...args) => {
        this.addLog({
          type: method,
          origData: args || [],
        });
      }).bind(window.console);
    });

    const timeLog: { [label: string]: number } = {};
    window.console.time = ((label: string = '') => {
      timeLog[label] = Date.now();
    }).bind(window.console);
    window.console.timeEnd = ((label: string = '') => {
      const pre = timeLog[label];
      if (pre) {
        console.log(label + ':', (Date.now() - pre) + 'ms');
        delete timeLog[label];
      } else {
        console.log(label + ': 0ms');
      }
    }).bind(window.console);

    window.console.clear = ((...args) => {
      this.clearLog();
      this.callOriginalConsole('clear', ...args);
    }).bind(window.console);

    // convenient for other uses
    (<any>window)._vcOrigConsole = this.origConsole;
  }

  /**
   * Recover `window.console`.
   */
  public unmockConsole() {
    // recover original console methods
    for (const method in this.origConsole) {
      window.console[method] = this.origConsole[method] as any;
    }
    if ((<any>window)._vcOrigConsole) {
      delete (<any>window)._vcOrigConsole;
    }
  }

  /**
   * Call origin `window.console[method](...args)`
   */
  public callOriginalConsole(method: string, ...args) {
    if (typeof this.origConsole[method] === 'function') {
      this.origConsole[method].apply(window.console, args);
    }
  }

  /**
   * Remove all logs.
   */
  public clearLog() {
    logListMap.update((listMap) => {
      for (const id in listMap) {
        listMap[id] = [];
      }
      return listMap;
    });
  }

  /**
   * Remove a plugin's logs.
   */
  public clearPluginLog(pluginId: string) {
    logListMap.update((listMap) => {
      if (listMap[pluginId]) {
        listMap[pluginId] = [];
      }
      return listMap;
    });
  }
  
  /**
   * Add a vConsole log.
   */
  public addLog(item: { type: IConsoleLogMethod, origData: any[] }, opt?: IVConsoleAddLogOptions) {
    // prepare data
    const log: IVConsoleLog = {
      _id: tool.getUniqueID(),
      type: item.type,
      cmdType: opt?.cmdType,
      date: Date.now(),
      data: [],
    };
    for (let i = 0; i < item?.origData.length; i++) {
      const origData = item.origData[i];
      const data: IVConsoleLogData = {
        origData: item.origData[i],
      };
      if (tool.isObject(origData) || tool.isArray(origData)) {
        data.isTree = true;
      }
      log.data.push(data);
    }

    // if origData[0] is `[xxx]` format, and `xxx` is a Log plugin id,
    // then put this log to that plugin,
    // otherwise put it to default plugin
    let pluginId = 'default';
    const firstData = log.data[0]?.origData;
    if (tool.isString(firstData)) {
      const match = (firstData as string).match(this.pluginPattern);
      if (match !== null && match.length > 1) {
        const id = match[1].toLowerCase();
        if (this.ADDED_LOG_PLUGIN_ID.indexOf(id) > -1) {
          pluginId = id;
          // if matched, delete `[xxx]` value
          log.data.shift();
        }
      }
      // this.callOriginalConsole('info', 'match:', match, firstData);
    }
    // this.callOriginalConsole('info', 'addLog()', pluginId, log);
    // this.callOriginalConsole('info', get(logListMap));

    this._pushLogList(pluginId, log);

    if (!opt?.noOrig) {
      // logging to original console
      this.callOriginalConsole(item.type, ...item.origData);
    }
  }

  /**
   * Execute a JS command.
   */
  public evalCommand(cmd: string) {
    this.addLog({
      type: 'log',
      origData: [cmd],
    }, { cmdType: 'input' });

    let result = void 0;

    try {
      result = eval.call(window, '(' + cmd + ')');
    } catch (e) {
      try {
        result = eval.call(window, cmd);
      } catch (e) {
        ;
      }
    }

    this.addLog({
      type: 'log',
      origData: [result],
    }, { cmdType: 'output' });
  };

  protected _pushLogList(pluginId: string, log: IVConsoleLog) {
    logListMap.update((listMap) => {
      listMap[pluginId].push(log);
      return listMap;
    });
  }
}
