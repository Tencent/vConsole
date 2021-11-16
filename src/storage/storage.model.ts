import { CookieStorage } from 'cookie-storage';
import { VConsoleModel } from '../lib/model';

interface IStorageItem {
  name: string;
  storage: Storage;
}

export class VConsoleStorageModel extends VConsoleModel {
  protected cookiesStorage: CookieStorage = new CookieStorage();

  public getAllStorages() {
    const storages: IStorageItem[] = [];
    if (document.cookie !== undefined) {
      storages.push({ name: 'cookies', storage: this.cookiesStorage });
    }
    if (window.localStorage) {
      storages.push({ name: 'localStorage', storage: localStorage });
    }
    if (window.sessionStorage) {
      storages.push({ name: 'sessionStorage', storage: sessionStorage });
    }
    return storages;
  }
}

export default VConsoleStorageModel;
