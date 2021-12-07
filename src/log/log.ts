import * as tool from '../lib/tool';
import { VConsoleSveltePlugin } from '../lib/sveltePlugin';
import LogComp from './log.svelte';
import { VConsoleLogModel, logListMap } from './log.model';
import type { IConsoleLogMethod, IVConsoleLog, IVConsoleLogData } from './log.model';


/**
 * vConsole Log Plugin (base class).
 */
export class VConsoleLogPlugin extends VConsoleSveltePlugin {
  public module: VConsoleLogModel = VConsoleLogModel.getSingleton(VConsoleLogModel);;
  public isReady: boolean = false;
  public isShow: boolean = false;
  public isInBottom: boolean = true; // whether the panel is in the bottom
  public maxLogNumber: number = 1000;


  constructor(id: string, name: string,) {
    super(id, name, LogComp, { pluginId: id });
    this.module.bindPlugin(id);
  }

  public onRemove() {
    super.onRemove();
    this.module.unbindPlugin(this.id);
  }
}

export default VConsoleLogPlugin;
