import { cookiesStorage } from '../../lib/cookiesStorage';

interface IStorageItem {
  name: string;
  storage: Storage;
}

export const getAllStorages = () => {
  const storages: IStorageItem[] = [];
  if (document.cookie !== undefined) {
    storages.push({ name: 'cookies', storage: cookiesStorage });
  }
  if (window.localStorage) {
    storages.push({ name: 'localStorage', storage: localStorage });
  }
  if (window.sessionStorage) {
    storages.push({ name: 'sessionStorage', storage: sessionStorage });
  }
  return storages;
};
