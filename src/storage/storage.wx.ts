import { GetProxyHandler } from './storage.proxy';

export const isWxEnv = () => {
  return typeof window !== 'undefined' && (<any>window).__wxConfig && (<any>window).wx && (<any>window).wx.getStorageSync;
};

export const callWx = (method: string, ...args) => {
  if (isWxEnv() && typeof (<any>window).wx[method] === 'function') {
    return (<any>window).wx[method].call((<any>window).wx, ...args);
  }
  return undefined;
}

export class WxStorage implements Storage {
  constructor() {
    if (typeof Proxy !== 'undefined') {
      return new Proxy(this, GetProxyHandler<WxStorage>());
    }
  }

  public get length() {
    return this.keys.length;
  }

  public get keys() {
    const info = callWx('getStorageInfoSync');
    const keys: string[] = !!info ? info.keys : [];
    return keys;
  }

  public key(index: number) {
    const sortedKeys = Object.keys(this.keys).sort();
    return index < sortedKeys.length ? sortedKeys[index] : null;
  }

  public getItem(key: string) {
    return callWx('getStorageSync', key);
  }

  public setItem(key: string, data: any) {
    return callWx('setStorageSync', key, data);
  }

  public removeItem(key: string) {
    return callWx('removeStorageSync', key);
  }

  public clear() {
    callWx('clearStorageSync');
  }
}
