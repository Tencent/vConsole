import { VConsoleSveltePlugin } from '../lib/sveltePlugin';
import NetworkComp from './network.svelte';
import { VConsoleNetworkModel } from './network.model';

export class VConsoleNetworkPlugin extends VConsoleSveltePlugin {
  protected module: VConsoleNetworkModel = VConsoleNetworkModel.getSingleton(VConsoleNetworkModel, 'VConsoleNetworkModel');

  constructor(id: string, name: string, renderProps = { }) {
    super(id, name, NetworkComp, renderProps);
  }

  public onAddTool(callback) {
    const toolList = [{
      name: 'Clear',
      global: false,
      onClick: (e) => {
        this.module.clearLog();
      }
    }];
    callback(toolList);
  }

  public onRemove() {
    super.onRemove();
    if (this.module) {
      this.module.unMock();
    }
  }
}
