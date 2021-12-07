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
}

export interface IVConsoleLog {
  _id: string;
  type: IConsoleLogMethod;
  cmdType?: 'input' | 'output';
  repeated?: number;
  date: number;
  data: IVConsoleLogData[]; // the `args: any[]` of `console.log(...args)`
}

export type IVConsoleLogListMap = { [pluginId: string]: IVConsoleLog[] };
export type IVConsoleLogFilter = { [pluginId: string]: string };

export interface IVConsoleAddLogOptions {
  noOrig?: boolean;
  cmdType?: 'input' | 'output';
}

export interface IVConsoleLogStore {
  logList: IVConsoleLog[];
  filterType: 'all' | IConsoleLogMethod;
  filterText: string;
}


/**********************************
 * Stores
 **********************************/

// export const logListMap = writable<IVConsoleLogListMap>({});
// export const logFilter = writable<IVConsoleLogFilter>({});
export const logStore = writable<{ [pluginId: string]: IVConsoleLogStore }>({});



/**********************************
 * Model
 **********************************/

export class VConsoleLogModel extends VConsoleModel {
  public readonly LOG_METHODS: IConsoleLogMethod[] = ['log', 'info', 'warn', 'debug', 'error'];
  public ADDED_LOG_PLUGIN_ID: string[] = [];
  public maxLogNumber: number = 1000;
  protected logCounter: number = 0; // a counter used to do some tasks on a regular basis
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

    logStore.update((store) => {
      store[pluginId] = {
        logList: [],
        filterText: '',
        filterType: 'all',
      };
      return store;
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
    logStore.update((store) => {
      store[pluginId].logList = [];
      delete store[pluginId];
      return store;
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
    logStore.update((store) => {
      for (const id in store) {
        store[id].logList = [];
      }
      return store;
    });
  }

  /**
   * Remove a plugin's logs.
   */
  public clearPluginLog(pluginId: string) {
    logStore.update((store) => {
      if (store[pluginId]) {
        store[pluginId].logList = [];
      }
      return store;
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
      log.data.push(data);
    }

    // extract pluginId by `[xxx]` format
    const pluginId = this._extractPluginIdByLog(log);

    if (this._isRepeatedLog(pluginId, log)) {
      this._updateLastLogRepeated(pluginId);
    } else {
      this._pushLogList(pluginId, log);
      this._limitLogListLength();
    }
    
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

  protected _extractPluginIdByLog(log: IVConsoleLog) {
    // if origData[0] is `[xxx]` format, and `xxx` is a Log plugin id,
    // then put this log to that plugin,
    // otherwise put it to default plugin.
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
    }
    return pluginId;
  }

  protected _isRepeatedLog(pluginId: string, log: IVConsoleLog) {
    const store = get(logStore)[pluginId];
    const lastLog = store.logList[store.logList.length - 1];
    if (!lastLog) {
      return false;
    }

    let isRepeated = false;
    if (log.type === lastLog.type && log.cmdType === lastLog.cmdType && log.data.length === lastLog.data.length) {
      isRepeated = true;
      for (let i = 0; i < log.data.length; i++) {
        if (log.data[i].origData !== lastLog.data[i].origData) {
          isRepeated = false;
          break;
        }
      }
    }
    return isRepeated;
  }

  protected _updateLastLogRepeated(pluginId: string) {
    logStore.update((store) => {
      const list = store[pluginId].logList
      const last = list[list.length - 1];
      last.repeated = last.repeated ? last.repeated + 1 : 2;
      return store;
    });
  }

  protected _pushLogList(pluginId: string, log: IVConsoleLog) {
    logStore.update((store) => {
      store[pluginId].logList.push(log);
      return store;
    });
  }

  protected _limitLogListLength() {
    // update logList length every N rounds
    const N = 10;
    this.logCounter++;
    if (this.logCounter % N !== 0) {
      return;
    }
    this.logCounter = 0;

    logStore.update((store) => {
      for (const id in store) {
        if (store[id].logList.length > this.maxLogNumber) {
          // delete N more logs for performance
          store[id].logList.splice(0, store[id].logList.length - this.maxLogNumber + N);
          // this.callOriginalConsole('info', 'delete', id, store[id].logList.length);
        }
      }
      return store;
    });
  }
}
