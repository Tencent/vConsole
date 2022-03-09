import { writable, get } from 'svelte/store';
import { isWxEnv } from '../lib/tool';
import type { VConsoleAvailableStorage } from '../core/options.interface';
import { CookieStorage } from './storage.cookie';
import { WxStorage } from './storage.wx';
import { VConsoleModel } from '../lib/model';

export interface IStorage {
  length: number;
  key: (index: number) => string | null;
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, data: any) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
  clear: () => void | Promise<void>;
  prepare?: () => Promise<boolean>;
}

/**
 * Storage Store
 */
export const storageStore = {
  updateTime: writable(0),
  activedName: writable<VConsoleAvailableStorage>(null),
  defaultStorages: writable<VConsoleAvailableStorage[]>(['cookies', 'localStorage', 'sessionStorage']),
};

export class VConsoleStorageModel extends VConsoleModel {
  protected storage: Map<VConsoleAvailableStorage, IStorage> = new Map();

  constructor() {
    super();
    storageStore.activedName.subscribe((value) => {
      const defaultStorages = get(storageStore.defaultStorages);
      if (defaultStorages.length > 0 && defaultStorages.indexOf(value) === -1) {
        storageStore.activedName.set(defaultStorages[0]);
      }
    });
    storageStore.defaultStorages.subscribe((list) => {
      if (list.indexOf(get(storageStore.activedName)) === -1) {
        storageStore.activedName.set(list[0]);
      }
      this.updateEnabledStorages();
    });
  }

  public get activedStorage() {
    return this.storage.get(get(storageStore.activedName));
  }

  public async getItem(key: string) {
    if (!this.activedStorage) { return ''; }
    return await this.promisify(this.activedStorage.getItem(key));
  }

  public async setItem(key: string, data: any) {
    if (!this.activedStorage) { return; }
    const ret = await this.promisify(this.activedStorage.setItem(key, data));
    this.refresh();
    return ret;
  }

  public async removeItem(key: string) {
    if (!this.activedStorage) { return; }
    const ret = await this.promisify(this.activedStorage.removeItem(key));
    this.refresh();
    return ret;
  }

  public async clear() {
    if (!this.activedStorage) { return; }
    const ret = await this.promisify(this.activedStorage.clear());
    this.refresh();
    return ret;
  }

  public refresh() {
    storageStore.updateTime.set(Date.now());
  }

  /**
   * Get key-value data.
   */
  public async getEntries() {
    const storage = this.activedStorage;
    if (!storage) {
      return [];
    }
    if (typeof storage.prepare === 'function') {
      await storage.prepare();
    }
    const list: [string, string][] = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      const v = await this.getItem(k);
      list.push([k, v]);
    }
    return list;
  }

  public updateEnabledStorages() {
    const defaultStorages = get(storageStore.defaultStorages);
    if (defaultStorages.indexOf('cookies') > -1) {
      if (document.cookie !== undefined) {
        this.storage.set('cookies', new CookieStorage());
      }
    } else {
      this.deleteStorage('cookies');
    }
    if (defaultStorages.indexOf('localStorage') > -1) {
      if (window.localStorage) {
        this.storage.set('localStorage', window.localStorage);
      }
    } else {
      this.deleteStorage('localStorage');
    }
    if (defaultStorages.indexOf('sessionStorage') > -1) {
      if (window.sessionStorage) {
        this.storage.set('sessionStorage', window.sessionStorage);
      }
    } else {
      this.deleteStorage('sessionStorage');
    }
    if (defaultStorages.indexOf('wxStorage') > -1) {
      if (isWxEnv()) {
        this.storage.set('wxStorage', new WxStorage());
      }
    } else {
      this.deleteStorage('wxStorage');
    }
  }

  protected promisify<T extends string | void>(ret: T | Promise<T>) {
    if (typeof ret === 'string' || ret === null || ret === undefined) {
      return Promise.resolve(ret);
    } else {
      return ret;
    }
  }

  protected deleteStorage(key: VConsoleAvailableStorage) {
    if (this.storage.has(key)) {
      this.storage.delete(key);
    }
  }
}
