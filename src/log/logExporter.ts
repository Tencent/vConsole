import { VConsolePluginExporter } from '../lib/pluginExporter';
import { VConsoleLogModel } from './log.model';
import type { IConsoleLogMethod } from './log.model';

export class VConsoleLogExporter extends VConsolePluginExporter {
  public model: VConsoleLogModel = VConsoleLogModel.getSingleton(VConsoleLogModel, 'VConsoleLogModel');

  public log(...args) {
    this.addLog('log', ...args);
  }

  public info(...args) {
    this.addLog('info', ...args);
  }

  public debug(...args) {
    this.addLog('debug', ...args);
  }
  
  public warn(...args) {
    this.addLog('warn', ...args);
  }

  public error(...args) {
    this.addLog('error', ...args);
  }

  public clear() {
    if (!this.model) { return; }
    this.model.clearPluginLog(this.pluginId);
  }

  protected addLog(method: IConsoleLogMethod, ...args) {
    if (!this.model) { return; }
    args.unshift('[' + this.pluginId + ']');
    this.model.addLog({ type: method, origData: args, }, { noOrig: true });
  }
}
