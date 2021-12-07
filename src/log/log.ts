import * as tool from '../lib/tool';
import { VConsoleSveltePlugin } from '../lib/sveltePlugin';
import LogComp from './log.svelte';
import { VConsoleLogModel } from './log.model';
// import type { IConsoleLogMethod, IVConsoleLog, IVConsoleLogData } from './log.model';

const MAX_LOG_NUMBER = 1000;

/**
 * vConsole Log Plugin (base class).
 */
export class VConsoleLogPlugin extends VConsoleSveltePlugin {
  public module: VConsoleLogModel = VConsoleLogModel.getSingleton(VConsoleLogModel);;
  public isReady: boolean = false;
  public isShow: boolean = false;
  public isInBottom: boolean = true; // whether the panel is in the bottom
  // public maxLogNumber: number = 1000;


  constructor(id: string, name: string,) {
    super(id, name, LogComp, { pluginId: id });
    this.module.bindPlugin(id);
  }

  public onReady() {
    super.onReady();
    this.module.maxLogNumber = Number(this.vConsole.option.maxLogNumber) || MAX_LOG_NUMBER;
  }

  public onRemove() {
    super.onRemove();
    this.module.unbindPlugin(this.id);
  }

  public onAddTool(callback) {
    const toolList = [{
      name: 'Clear',
      global: false,
      onClick: (e) => {
        this.module.clearPluginLog(this.id);
        this.vConsole.triggerEvent('clearLog');
      }
    }];
    callback(toolList);
  }

  public onUpdateOption() {
    if (this.vConsole.option.maxLogNumber !== this.module.maxLogNumber) {
      this.module.maxLogNumber = Number(this.vConsole.option.maxLogNumber) || MAX_LOG_NUMBER;
    }
  }
}

export default VConsoleLogPlugin;
