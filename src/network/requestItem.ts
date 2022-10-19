
import { getUniqueID } from '../lib/tool';
import { genResonseByResponseType, genGetDataByUrl } from './helper';

export type VConsoleRequestMethod = '' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';

export class VConsoleNetworkRequestItem {
  id: string                 = '';
  name?: string              = '';
  method: VConsoleRequestMethod = '';
  url: string                = '';
  status: number | string    = 0; // HTTP status codes
  statusText?: string        = ''; // for display
  cancelState?: 0 | 1 | 2 | 3 = 0; // 0=no cancel; 1=abort (for XHR); 2=cancel (for Fetch); 3=timeout;
  readyState?: XMLHttpRequest['readyState'] = 0;
  header: { [key: string]: string } = null; // response header
  responseType: XMLHttpRequest['responseType'] = '';
  requestType: 'xhr' | 'fetch' | 'ping' | 'custom';
  requestHeader: HeadersInit = null;
  response: any;
  responseSize: number      = 0; // bytes
  responseSizeText: string  = '';
  startTime: number         = 0;
  startTimeText: string     = '';
  endTime: number           = 0;
  costTime?: number         = 0;
  getData: { [key: string]: string } = null;
  postData: { [key: string]: string } | string = null;
  actived: boolean          = false;
  noVConsole?: boolean      = false;

  constructor() {
    this.id = getUniqueID();
  }
}

export class VConsoleNetworkRequestItemProxy extends VConsoleNetworkRequestItem {
  static Handler = {
    get(item: VConsoleNetworkRequestItemProxy, prop: string) {
      switch (prop) {
        case 'response':
          return item._response;
        default:
          return Reflect.get(item, prop);
      }
    },
    set(item: VConsoleNetworkRequestItemProxy, prop: string, value: any) {
      switch (prop) {
        case 'response':
          // NOTICE: Once the `response` is set, 
          //         modifying its internal properties will not take effect,
          //         unless a new `response` is re-assigned.
          item._response = genResonseByResponseType(item.responseType, value);
          return true;
          
        case 'url':
          value = String(value);
          const name = value?.replace(new RegExp('[/]*$'), '').split('/').pop() || 'Unknown';
          Reflect.set(item, 'name', name);

          const getData = genGetDataByUrl(value, item.getData);
          Reflect.set(item, 'getData', getData);
          break;
        case 'status':
          const statusText = String(value) || 'Unknown';
          Reflect.set(item, 'statusText', statusText);
          break;
        case 'startTime':
          if (value && item.endTime) {
            const costTime = item.endTime - value;
            Reflect.set(item, 'costTime', costTime);
          }
          break;
        case 'endTime':
          if (value && item.startTime) {
            const costTime = value - item.startTime;
            Reflect.set(item, 'costTime', costTime);
          }
          break;
        default:
          // do nothing
      }
      return Reflect.set(item, prop, value);
    }
  };

  protected _response?: any;

  constructor(item: VConsoleNetworkRequestItem) {
    super();
    return new Proxy(item, VConsoleNetworkRequestItemProxy.Handler);
  }
}
