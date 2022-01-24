declare let wx: any;

export class WxStorage {
  private wxInstance;

  constructor(wxInstance?) {
    this.wxInstance = wxInstance || wx;
    if (typeof Proxy !== 'undefined') {
      return new Proxy(this, wxStorageHandler);
    }
  }

  public get length() {
    return this.keys.length;
  }

  public get keys() {
    const info = this.callWx('getStorageInfoSync');
    const keys: string[] = !!info ? info.keys : [];
    return keys;
  }

  public getItem(key: string) {
    return this.callWx('getStorageSync', key);
  }

  public setItem(key: string, data: any) {
    return this.callWx('setStorageSync', key, data);
  }

  public removeItem(key: string) {
    return this.callWx('removeStorageSync', key);
  }

  public clear() {
    this.callWx('clearStorageSync');
  }

  private callWx(method: string, ...args) {
    if (typeof this.wxInstance !== 'undefined' && typeof this.wxInstance[method] === 'function') {
      return this.wxInstance[method].call(this.wxInstance, ...args);
    }
    return undefined;
  }
}

const wxStorageHandler: ProxyHandler<WxStorage> = {
  defineProperty(
    target: WxStorage,
    p: PropertyKey,
    attributes: PropertyDescriptor
  ): boolean {
    target.setItem(p.toString(), attributes.value);
    return true;
  },
  deleteProperty(target: WxStorage, p: PropertyKey): boolean {
    target.removeItem(p.toString());
    return true;
  },
  get(target: WxStorage, p: PropertyKey, _receiver: any): any {
    if (typeof p === 'string' && p in target) return target[p];
    const result = target.getItem(p.toString());
    return result !== null ? result : undefined;
  },
  getOwnPropertyDescriptor(
    target: WxStorage,
    p: PropertyKey
  ): PropertyDescriptor | undefined {
    if (p in target) return undefined;
    return {
      configurable: true,
      enumerable: true,
      value: target.getItem(p.toString()),
      writable: true,
    };
  },
  has(target: WxStorage, p: PropertyKey): boolean {
    if (typeof p === 'string' && p in target) return true;
    return target.getItem(p.toString()) !== null;
  },
  ownKeys(target: WxStorage): string[] {
    return target.keys;
  },
  preventExtensions(_: WxStorage): boolean {
    throw new TypeError('can\'t prevent extensions on this proxy object');
  },
  set(target: WxStorage, p: PropertyKey, value: any, _: any): boolean {
    target.setItem(p.toString(), value);
    return true;
  },
};
