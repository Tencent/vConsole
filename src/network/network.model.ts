import { writable, get } from 'svelte/store';
import * as tool from '../lib/tool';
import { VConsoleModel } from '../lib/model';
import { contentStore } from '../core/core.model';
import { RequestItemHelper, VConsoleNetworkRequestItem } from './requestItem';
import { XHRProxy } from './xhr.proxy';
import { FetchProxy } from './fetch.proxy';


/**
 * Network Store
 */
export const requestList = writable<{ [id: string]: VConsoleNetworkRequestItem }>({});


/**
 * Network Model
 */
export class VConsoleNetworkModel extends VConsoleModel {
  public maxNetworkNumber: number = 1000;
  protected itemCounter: number = 0;

  private _sendBeacon: Navigator['sendBeacon'] = undefined;

 
  constructor() {
    super();
    this.mockXHR();
    this.mockFetch();
    this.mockSendBeacon();
  }

  public unMock() {
    // recover original functions
    if (window.hasOwnProperty('XMLHttpRequest')) {
      window.XMLHttpRequest = XHRProxy.origXMLHttpRequest;
    }
    if (window.hasOwnProperty('fetch')) {
      window.fetch = FetchProxy.origFetch;
    }
    if (window.navigator.sendBeacon) {
      window.navigator.sendBeacon = this._sendBeacon;
      this._sendBeacon = undefined;
    }
  }

  public clearLog() {
    // remove list
    requestList.set({});
  }

  /**
   * Add or update a request item by request ID.
   */
  public updateRequest(id: string, data: VConsoleNetworkRequestItem) {
    const reqList = get(requestList);
    const hasItem = !!reqList[id];
    if (hasItem) {
      // force re-assign to ensure that the value is updated
      const item = reqList[id];
      for (let key in data) {
        item[key] = data[key];
      }
      data = item;
    }
    requestList.update((reqList) => {
      reqList[id] = data;
      return reqList;
    });
    if (!hasItem) {
      contentStore.updateTime();
      this.limitListLength();
    }
  }

  /**
   * mock XMLHttpRequest
   * @private
   */
  private mockXHR() {
    if (!window.hasOwnProperty('XMLHttpRequest')) {
      return;
    }

    window.XMLHttpRequest = XHRProxy.create((item: VConsoleNetworkRequestItem) => {
      this.updateRequest(item.id, item);
    });
  };

  /**
   * mock fetch request
   * @private
   */
  private mockFetch() {
    if (!window.hasOwnProperty('fetch')) {
      return;
    }

    window.fetch = FetchProxy.create((item: VConsoleNetworkRequestItem) => {
      this.updateRequest(item.id, item);
    });
  }

  /**
   * mock navigator.sendBeacon
   * @private
   */
  private mockSendBeacon() {
    const _sendBeacon = window.navigator.sendBeacon;
    if (!_sendBeacon) { return; }
    const that = this;
    this._sendBeacon = _sendBeacon;

    // https://fetch.spec.whatwg.org/#concept-bodyinit-extract
    const getContentType = (data?: BodyInit) => {
      if (data instanceof Blob) { return data.type; }
      if (data instanceof FormData) { return 'multipart/form-data'; }
      if (data instanceof URLSearchParams) { return 'application/x-www-form-urlencoded;charset=UTF-8'; }
      return 'text/plain;charset=UTF-8';
    };

    window.navigator.sendBeacon = (urlString: string, data?: BodyInit) => {
      const item = new VConsoleNetworkRequestItem();
      this.updateRequest(item.id, item);

      const url = RequestItemHelper.getURL(urlString);
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
      item.postData = RequestItemHelper.genFormattedBody(data);

      if (!item.startTime) {
        item.startTime = Date.now();
      }

      const isSuccess = _sendBeacon.call(window.navigator, urlString, data);
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
      that.updateRequest(item.id, item);
      return isSuccess;
    };
  }

  protected limitListLength() {
    // update list length every N rounds
    const N = 10;
    this.itemCounter++;
    if (this.itemCounter % N !== 0) {
      return;
    }
    this.itemCounter = 0;

    const list = get(requestList);
    const keys = Object.keys(list);
    if (keys.length > this.maxNetworkNumber - N) {
      requestList.update((store) => {
        // delete N more logs for performance
        const deleteKeys = keys.splice(0, keys.length - this.maxNetworkNumber + N);
        for (let i = 0; i < deleteKeys.length; i++) {
          store[deleteKeys[i]] = undefined;
          delete store[deleteKeys[i]];
        }
        return store;
      });
    }
  }

} // END class

export default VConsoleNetworkModel;
