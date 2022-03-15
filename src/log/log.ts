import { VConsoleSveltePlugin } from '../lib/sveltePlugin';
import LogComp from './log.svelte';
import { VConsoleLogModel } from './log.model';
import { VConsoleLogExporter } from './log.exporter';
import type { IConsoleLogMethod } from './log.model';

const MAX_LOG_NUMBER = 1000;

/**
 * vConsole Log Plugin (base class).
 */
export class VConsoleLogPlugin extends VConsoleSveltePlugin {
  public model: VConsoleLogModel = VConsoleLogModel.getSingleton(VConsoleLogModel, 'VConsoleLogModel');
  public isReady: boolean = false;
  public isShow: boolean = false;
  public isInBottom: boolean = true; // whether the panel is in the bottom

  constructor(id: string, name: string,) {
    super(id, name, LogComp, { pluginId: id, filterType: 'all' });
    this.model.bindPlugin(id);
    this.exporter = new VConsoleLogExporter(id);
  }

  public onReady() {
    super.onReady();
    this.model.maxLogNumber = Number(this.vConsole.option.log?.maxLogNumber) || MAX_LOG_NUMBER;
    this.compInstance.showTimestamps = !!this.vConsole.option.log?.showTimestamps;
  }

  public onRemove() {
    super.onRemove();
    this.model.unbindPlugin(this.id);
  }

  public onAddTopBar(callback: Function) {
    const types = ['All', 'Log', 'Info', 'Warn', 'Error'];
    const btnList = [];
    for (let i = 0; i < types.length; i++) {
      btnList.push({
        name: types[i],
        data: {
          type: types[i].toLowerCase()
        },
        actived: i === 0,
        className: '',
        onClick: (e: PointerEvent, data: { type: 'all' | IConsoleLogMethod }) => {
          if (data.type === this.compInstance.filterType) { return false; }
          this.compInstance.filterType = data.type;
        }
      });
    }
    btnList[0].className = 'vc-actived';
    callback(btnList);
  }

  public onAddTool(callback: Function) {
    const toolList = [{
      name: 'Clear',
      global: false,
      onClick: (e) => {
        this.model.clearPluginLog(this.id);
        this.vConsole.triggerEvent('clearLog');
      }
    }];
    callback(toolList);
  }

  public onUpdateOption() {
    if (this.vConsole.option.log?.maxLogNumber !== this.model.maxLogNumber) {
      this.model.maxLogNumber = Number(this.vConsole.option.log?.maxLogNumber) || MAX_LOG_NUMBER;
    }
    if (!!this.vConsole.option.log?.showTimestamps !== this.compInstance.showTimestamps) {
      this.compInstance.showTimestamps = !!this.vConsole.option.log?.showTimestamps;
    }
  }
}

export default VConsoleLogPlugin;
