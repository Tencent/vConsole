
import * as Helper from './helper';
import { VConsoleNetworkRequestItem } from './requestItem';
import type { IOnUpdateCallback } from './helper';

// https://fetch.spec.whatwg.org/#concept-bodyinit-extract
const getContentType = (data?: BodyInit) => {
  if (data instanceof Blob) { return data.type; }
  if (data instanceof FormData) { return 'multipart/form-data'; }
  if (data instanceof URLSearchParams) { return 'application/x-www-form-urlencoded;charset=UTF-8'; }
  return 'text/plain;charset=UTF-8';
};

export class BeaconProxyHandler<T extends typeof navigator.sendBeacon> implements ProxyHandler<T> {
  protected onUpdateCallback: IOnUpdateCallback;

  constructor(onUpdateCallback: IOnUpdateCallback) {
    this.onUpdateCallback = onUpdateCallback;
  }

  public apply(target: T, thisArg: T, argsList: any[]) {
    // console.log('on call!!')
    const urlString: string = argsList[0];
    const data: BodyInit = argsList[1];
    const item = new VConsoleNetworkRequestItem();

    const url = Helper.getURL(urlString);
    item.method = 'POST';
    item.url = urlString;
    item.name = (url.pathname.split('/').pop() || '') + url.search;
    item.requestType = 'ping';
    item.requestHeader = { 'Content-Type': getContentType(data) };
    item.status = 0;
    item.statusText = 'Pending';
    
    if (url.search && url.searchParams) {
      item.getData = {};
      for (const [key, value] of url.searchParams) {
        item.getData[key] = value;
      }
    }
    item.postData = Helper.genFormattedBody(data);

    if (!item.startTime) {
      item.startTime = Date.now();
    }

    this.onUpdateCallback(item);

    const isSuccess = target.apply(thisArg, argsList);
    if (isSuccess) {
      item.endTime = Date.now();
      item.costTime = item.endTime - (item.startTime || item.endTime);
      item.status = 0;
      item.statusText = 'Sent';
      item.readyState = 4;
    } else {
      item.status = 500;
      item.statusText = 'Unknown';
    }
    this.onUpdateCallback(item);
    return isSuccess;
  }
}

export class BeaconProxy {
  public static origSendBeacon = window?.navigator?.sendBeacon;

  public static hasSendBeacon() {
    return !!BeaconProxy.origSendBeacon;
  }

  public static create(onUpdateCallback: IOnUpdateCallback) {
    if (!BeaconProxy.hasSendBeacon()) {
      return undefined;
    }
    return new Proxy(BeaconProxy.origSendBeacon, new BeaconProxyHandler(onUpdateCallback));
  }
}
