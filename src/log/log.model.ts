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
  date: number;
  data: IVConsoleLogData[]; // the `args: any[]` of `console.log(...args)`
}

export type IVConsoleLogListMap = { [pluginId: string]: IVConsoleLog[] };


/**********************************
 * Stores
 **********************************/

export const logListMap = writable<IVConsoleLogListMap>({});



/**********************************
 * Methods
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
  if (tool.isArray(val)) {
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
    this.pluginPattern = new RegExp(`^\[${this.ADDED_LOG_PLUGIN_ID.join('|')}\]$`, 'i');
    this.callOriginalConsole('debug', this.pluginPattern);
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
  }

  /**
   * Recover `window.console`.
   */
  public unmockConsole() {
    // recover original console methods
    for (const method in this.origConsole) {
      window.console[method] = this.origConsole[method] as any;
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
   * Add a vConsole log.
   */
  public addLog(item: { type: IConsoleLogMethod, origData: any[] }, opt?: { noOrig: boolean }) {
    // prepare data
    const log: IVConsoleLog = {
      _id: tool.getUniqueID(),
      type: item.type,
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
      if (match !== null && match.length > 0) {
        const id = match[1].toLowerCase();
        if (this.ADDED_LOG_PLUGIN_ID.indexOf(id) > -1) {
          pluginId = id;
          // if matched, delete `[xxx]` value
          log.data.shift();
        }
      }
    }


    // this.callOriginalConsole('info', 'addLog()', pluginId, log);
    // this.callOriginalConsole('info', get(logListMap));

    this._pushLogList(pluginId, log);

    if (!opt?.noOrig) {
      // logging to original console
      this.callOriginalConsole(item.type, ...item.origData);
    }
  }

  protected _pushLogList(pluginId: string, log: IVConsoleLog) {
    logListMap.update((listMap) => {
      listMap[pluginId].push(log);
      return listMap;
    });
  }
}
