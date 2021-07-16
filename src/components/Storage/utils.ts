import { cookiesStorage } from '../../lib/cookiesStorage';

interface IStorageItem {
  name: string;
  storage: Storage;
}

export const getAllStorages = () => {
  const storages: IStorageItem[] = [];
  if (document.cookie) {
    storages.push({ name: 'cookies', storage: cookiesStorage });
  }
  if (globalThis.localStorage) {
    storages.push({ name: 'localStorage', storage: localStorage });
  }
  if (globalThis.sessionStorage) {
    storages.push({ name: 'sessionStorage', storage: sessionStorage });
  }
  return storages;
};
