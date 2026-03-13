import { writable, get } from 'svelte/store';
import { VConsoleModel } from '../lib/model';
import { contentStore } from '../core/core.model';
import { VConsoleNetworkRequestItem } from './requestItem';
import { XHRProxy } from './xhr.proxy';
import { FetchProxy } from './fetch.proxy';
import { BeaconProxy } from './beacon.proxy';
import { ResourceProxy } from './resource.proxy';
import { WebSocketProxy } from './websocket.proxy';


/**
 * Network Store
 */
export const requestList = writable<{ [id: string]: VConsoleNetworkRequestItem }>({});


/**
 * Network Model
 */
export class VConsoleNetworkModel extends VConsoleModel {
  public maxNetworkNumber: number = 1000;
  public ignoreUrlRegExp: RegExp = undefined;
  protected itemCounter: number = 0;
  private resourceProxy: ResourceProxy;

  constructor() {
    super();
    this.mockXHR();
    this.mockFetch();
    this.mockSendBeacon();
    this.mockResource();
    this.mockWebSocket();
  }

  public unMock() {
    // recover original functions
    if (window.hasOwnProperty('XMLHttpRequest')) {
      window.XMLHttpRequest = XHRProxy.origXMLHttpRequest;
    }
    if (window.hasOwnProperty('fetch')) {
      const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
      if (!descriptor || descriptor.set || descriptor.writable) {
        window.fetch = FetchProxy.origFetch;
      }
    }
    if (BeaconProxy.hasSendBeacon()) {
      window.navigator.sendBeacon = BeaconProxy.origSendBeacon;
    }
    if (this.resourceProxy) {
      this.resourceProxy.unMock();
    }
    if (window.hasOwnProperty('WebSocket')) {
      window.WebSocket = WebSocketProxy.origWebSocket;
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
    const { url } = data;
    if (url && this.ignoreUrlRegExp?.test(url)) {
      return;
    }
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
    const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (descriptor && !descriptor.set && !descriptor.writable) {
      // fetch is defined as a getter-only property by a third-party library; skip mocking
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
    if (!BeaconProxy.hasSendBeacon()) {
      return;
    }
    window.navigator.sendBeacon = BeaconProxy.create((item: VConsoleNetworkRequestItem) => {
      this.updateRequest(item.id, item);
    });
  }

  /**
   * observe resource loading via PerformanceObserver (images, scripts, stylesheets, fonts, etc.)
   * @private
   */
  private mockResource() {
    if (typeof PerformanceObserver === 'undefined') {
      return;
    }
    this.resourceProxy = ResourceProxy.create((item: VConsoleNetworkRequestItem) => {
      this.updateRequest(item.id, item);
    });
  }

  /**
   * mock WebSocket
   * @private
   */
  private mockWebSocket() {
    if (!window.hasOwnProperty('WebSocket')) {
      return;
    }
    window.WebSocket = WebSocketProxy.create((item: VConsoleNetworkRequestItem) => {
      this.updateRequest(item.id, item);
    });
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
