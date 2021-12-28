import { VConsoleSveltePlugin } from '../lib/sveltePlugin';
import NetworkComp from './network.svelte';
import { VConsoleNetworkModel } from './network.model';
import { VConsoleNetworkExporter } from './network.exporter';

export class VConsoleNetworkPlugin extends VConsoleSveltePlugin {
  public model: VConsoleNetworkModel = VConsoleNetworkModel.getSingleton(VConsoleNetworkModel, 'VConsoleNetworkModel');
  public exporter: VConsoleNetworkExporter;

  constructor(id: string, name: string, renderProps = { }) {
    super(id, name, NetworkComp, renderProps);
    this.exporter = new VConsoleNetworkExporter(id);
  }

  public onAddTool(callback) {
    const toolList = [{
      name: 'Clear',
      global: false,
      onClick: (e) => {
        this.model.clearLog();
      }
    }];
    callback(toolList);
  }

  public onRemove() {
    super.onRemove();
    if (this.model) {
      this.model.unMock();
    }
  }
}
