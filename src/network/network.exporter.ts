import { VConsolePluginExporter } from '../lib/pluginExporter';
import { VConsoleNetworkModel } from './network.model';
import { VConsoleNetworkRequestItem, VConsoleNetworkRequestItemProxy } from './requestItem';

export class VConsoleNetworkExporter extends VConsolePluginExporter {
  public model: VConsoleNetworkModel = VConsoleNetworkModel.getSingleton(VConsoleNetworkModel, 'VConsoleNetworkModel');

  public add(item: VConsoleNetworkRequestItem) {
    const itemProxy = new VConsoleNetworkRequestItemProxy(new VConsoleNetworkRequestItem());
    for (let key in item) {
      itemProxy[key] = item[key];
    }
    itemProxy.startTime = itemProxy.startTime || Date.now();
    itemProxy.requestType = itemProxy.requestType || 'custom';
    this.model.updateRequest(itemProxy.id, itemProxy);
    return itemProxy;
  }

  public update(id: string, item: VConsoleNetworkRequestItem) {
    this.model.updateRequest(id, item);
  }

  public clear() {
    this.model.clearLog();
  }
}
