import { cookiesStorage } from '../../lib/cookiesStorage';

interface IStorageItem {
  name: string;
  storage: Storage;
}

export const getAllStorages = () => {
  const storages: IStorageItem[] = [];
  const that = globalThis || window;
  if (document.cookie !== undefined) {
    storages.push({ name: 'cookies', storage: cookiesStorage });
  }
  if (that.localStorage) {
    storages.push({ name: 'localStorage', storage: localStorage });
  }
  if (that.sessionStorage) {
    storages.push({ name: 'sessionStorage', storage: sessionStorage });
  }
  return storages;
};
