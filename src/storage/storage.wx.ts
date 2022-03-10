import type { IStorage } from './storage.model';
import { callWx } from '../lib/tool';

export class WxStorage implements IStorage {
  public keys: string[] = [];
  public currentSize: number = 0;
  public limitSize: number = 0;

  public get length() {
    return this.keys.length;
  }

  public key(index: number) {
    return index < this.keys.length ? this.keys[index] : null;
  }

  /**
   * Prepare for async data.
   */
  public async prepare() {
    return new Promise<boolean>((resolve, reject) => {
      callWx('getStorageInfo', {
        success: (res) => {
          this.keys = !!res ? res.keys.sort() : [];
          this.currentSize = !!res ? res.currentSize : 0;
          this.limitSize = !!res ? res.limitSize : 0;
          resolve(true);
        },
        fail() {
          reject(false);
        },
      });
    });
  }

  public getItem(key: string) {
    return new Promise<string>((resolve, reject) => {
      callWx('getStorage', {
        key,
        success(res) {
          let data: string = res.data;
          if (typeof res.data === 'object') {
            try {
              data = JSON.stringify(res.data);
            } catch (e) {
              // do nothing
            }
          }
          resolve(data);
        },
        fail(res) {
          reject(res);
        },
      });
    });
  }

  public setItem(key: string, data: any) {
    return new Promise<void>((resolve, reject) => {
      callWx('setStorage', {
        key,
        data,
        success(res) {
          resolve(res);
        },
        fail(res) {
          reject(res);
        },
      });
    });
  }

  public removeItem(key: string) {
    return new Promise<void>((resolve, reject) => {
      callWx('removeStorage', {
        key,
        success(res) {
          resolve(res);
        },
        fail(res) {
          reject(res);
        },
      });
    });
  }

  public clear() {
    return new Promise<void>((resolve, reject) => {
      callWx('clearStorage', {
        success(res) {
          resolve(res);
        },
        fail(res) {
          reject(res);
        },
      });
    });
  }
}
