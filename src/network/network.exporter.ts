import { VConsolePluginExporter } from '../lib/pluginExporter';
import { VConsoleNetworkModel } from './network.model';
import { RequestItemHelper, VConsoleNetworkRequestItem, VConsoleNetworkRequestItemProxy } from './requestItem';
// import type { VConsoleNetworkRequestItem } from './requestItem';



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

  protected completeDate(item: VConsoleNetworkRequestItem) {
    if (!item.name) {
      item.name = item.url?.replace(new RegExp('[/]*$'), '').split('/').pop() || 'Unknown';
    }
    item.method = item.method || 'GET';
    item.statusText = item.statusText || String(item.status) || 'Unknown';
    item.readyState = item.readyState || 0;
    item.requestType = item.requestType || 'custom';
    if (!item.costTime && item.endTime) {
      item.costTime = item.endTime - item.startTime;
    }
    item.responseType = item.responseType || '';
    // if (item.response) {
    //   RequestItemHelper.updateResonseByResponseType(item, item.response);
    // }
  }
}
