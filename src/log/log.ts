import { VConsoleSveltePlugin } from '../lib/sveltePlugin';
import { PluginExport } from '../lib/pluginExport';
import LogComp from './log.svelte';
import { VConsoleLogModel } from './log.model';
import type { IConsoleLogMethod } from './log.model';

const MAX_LOG_NUMBER = 1000;

/**
 * vConsole Log Plugin (base class).
 */
export class VConsoleLogPlugin extends VConsoleSveltePlugin {
  public module: VConsoleLogModel = VConsoleLogModel.getSingleton(VConsoleLogModel, 'VConsoleLogModel');
  public isReady: boolean = false;
  public isShow: boolean = false;
  public isInBottom: boolean = true; // whether the panel is in the bottom

  constructor(id: string, name: string,) {
    super(id, name, LogComp, { pluginId: id, filterType: 'all' });
    this.module.bindPlugin(id);
    this.provideExport();
  }

  public onReady() {
    super.onReady();
    this.module.maxLogNumber = Number(this.vConsole.option.maxLogNumber) || MAX_LOG_NUMBER;
  }

  public onRemove() {
    super.onRemove();
    this.module.unbindPlugin(this.id);
    this.removeExport();
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

  protected provideExport() {
    const methods: { [key: string]: Function } = {};
    this.module.LOG_METHODS.map((method) => {
      methods[method] = (...args) => {
        args.unshift('[' + this.id + ']');
        this.module.addLog({ type: method, origData: args, }, { noOrig: true });
      }
    });
    methods.clear = () => {
      this.module.clearPluginLog(this.id);
    };
    PluginExport.provide(this.id === 'default' ? 'log' : this.id, methods);
  }

  protected removeExport() {
    PluginExport.remove(this.id === 'default' ? 'log' : this.id);
  }
}

export default VConsoleLogPlugin;
