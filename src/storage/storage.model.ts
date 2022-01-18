import { VConsoleCookieStorage } from './cookieStorage';
import { VConsoleModel } from '../lib/model';

interface IStorageItem {
  name: string;
  storage: Storage;
}
export class VConsoleStorageModel extends VConsoleModel {
  protected cookiesStorage = new VConsoleCookieStorage();
  protected storages: IStorageItem[];

  /**
   * Get the singleton of storage list.
   */
  public getAllStorages() {
    if (!this.storages) {
      this.storages = [];
      if (document.cookie !== undefined) {
        this.storages.push({ name: 'cookies', storage: this.cookiesStorage });
      }
      if (window.localStorage) {
        this.storages.push({ name: 'localStorage', storage: localStorage });
      }
      if (window.sessionStorage) {
        this.storages.push({ name: 'sessionStorage', storage: sessionStorage });
      }
    }
    return this.storages;
  }
}
