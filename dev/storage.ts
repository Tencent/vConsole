import { WxStorage } from '../src/storage/storage.wx';

const testWxStorage = () => {
  let storageData: { [key: string]: any } = {
    foo: 'bar',
    hello: 'world',
  };
  (<any>global).window = {};
  (<any>global).window.__wxConfig = {};
  (<any>global).window.wx = {
    getStorageSync(key: string) {
      return storageData[key];
    },
    setStorageSync(key: string, data: any) {
      storageData[key] = data;
    },
    removeStorageSync(key: string) {
      delete storageData[key];
    },
    clearStorageSync() {
      storageData = {};
    },
    getStorageInfoSync() {
      return {
        keys: Object.keys(storageData),
      };
    },
  };

  const wxStorage = new WxStorage();
  console.log('getItem: foo =', wxStorage.getItem('foo'));
  wxStorage.setItem('aaa', 'bbb');
  console.log('setItem: aaa =', wxStorage.getItem('aaa'));
  console.log('Object.entries():');
  for (const [k, v] of Object.entries(wxStorage)) {
    console.log(k, '=', v);
  }
  wxStorage.removeItem('aaa');
  console.log('removeItem: keys:', wxStorage.keys);
  wxStorage.clear();
  console.log('clear: keys:', wxStorage.keys);

};

testWxStorage();
