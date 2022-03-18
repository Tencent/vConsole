import * as tool from '../lib/tool';
import * as Helper from './helper';
import { VConsoleNetworkRequestItem } from './requestItem';
import type { VConsoleRequestMethod } from './requestItem';

type IOnUpdateCallback = (item: VConsoleNetworkRequestItem) => void;

export class ResponseProxyHandler<T extends Response> implements ProxyHandler<T> {
  public resp: Response;
  public item: VConsoleNetworkRequestItem;
  protected onUpdateCallback: IOnUpdateCallback;

  constructor(resp: T, item: VConsoleNetworkRequestItem, onUpdateCallback: IOnUpdateCallback) {
    // console.log('Proxy: new constructor')
    this.resp = resp;
    this.item = item;
    this.onUpdateCallback = onUpdateCallback;
    this.mockReader();
  }

  public set(target, key, value) {
    // if (typeof key === 'string') { console.log('Proxy set:', key) }
    return Reflect.set(target, key, value);
  }

  public get(target, key) {
    // if (typeof key === 'string') { console.log('Proxy get:', key) }
    switch (key) {
      case 'arrayBuffer':
      case 'blob':
      case 'formData':
      case 'json':
      case 'text':
        return () => {
          this.item.responseType = <any>key.toLowerCase();
          return target[key]().then((val) => {
            this.item.response = Helper.genResonseByResponseType(this.item.responseType, val);
            this.onUpdateCallback(this.item);
            return val;
          });
        };
    }
    if (typeof target[key] === 'function') {
      return (...args) => {
        return target[key].apply(target, args);
      };
    } else {
      return Reflect.get(target, key);
    }
  }

  protected mockReader() {
    let readerReceivedValue = new Uint8Array();
    const _getReader = this.resp.body.getReader;
    this.resp.body.getReader = () => {
      const reader = <ReturnType<typeof _getReader>>_getReader.apply(this.resp.body);
      const _read = reader.read;
      const _cancel = reader.cancel;
      this.item.responseType = 'arraybuffer';

      reader.read = () => {
        return (<ReturnType<typeof _read>>_read.apply(reader)).then((result) => {
          this.item.endTime = Date.now();
          this.item.costTime = this.item.endTime - (this.item.startTime || this.item.endTime);
          this.item.readyState = result.done ? 4 : 3;
          this.item.statusText = result.done ? String(this.item.status) : 'Loading';
          readerReceivedValue = new Uint8Array([...readerReceivedValue, ...result.value]);
          if (result.done) {
            this.item.response = Helper.genResonseByResponseType(this.item.responseType, readerReceivedValue);
          }
          this.onUpdateCallback(this.item);
          return result;
        });
      };
      
      reader.cancel = (...args) => {
        this.item.cancelState = 2;
        this.item.statusText = 'Cancel';
        this.item.endTime = Date.now();
        this.item.costTime = this.item.endTime - (this.item.startTime || this.item.endTime);
        this.item.response = Helper.genResonseByResponseType(this.item.responseType, readerReceivedValue);
        this.onUpdateCallback(this.item);
        return _cancel.apply(reader, args);
      };
      return reader;
    };
  }
}

export class FetchProxyHandler<T extends typeof fetch> implements ProxyHandler<T> {
  protected onUpdateCallback: IOnUpdateCallback;

  constructor(onUpdateCallback: IOnUpdateCallback) {
    this.onUpdateCallback = onUpdateCallback;
  }

  public apply(target: T, thisArg: T, argsList) {
    const input: RequestInfo = argsList[0];
    const init: RequestInit = argsList[1];
    const item = new VConsoleNetworkRequestItem();
    this.beforeFetch(item, input, init);

    return (<ReturnType<T>>target.apply(thisArg, argsList)).then(this.afterFetch(item)).catch((e) => {
      // mock finally
      item.endTime = Date.now();
      item.costTime = item.endTime - (item.startTime || item.endTime);
      this.onUpdateCallback(item);
      throw e;
    });
  }

  protected beforeFetch(item: VConsoleNetworkRequestItem, input: RequestInfo, init?: RequestInit) {
    let url: URL,
        method = 'GET',
        requestHeader: HeadersInit = null;

    // handle `input` content
    if (tool.isString(input)) { // when `input` is a string
      method = init?.method || 'GET';
      url = Helper.getURL(<string>input);
      requestHeader = init?.headers || null;
    } else { // when `input` is a `Request` object
      method = (<Request>input).method || 'GET';
      url = Helper.getURL((<Request>input).url);
      requestHeader = (<Request>input).headers;
    }

    item.method = <VConsoleRequestMethod>method;
    item.requestType = 'fetch';
    item.requestHeader = requestHeader;
    item.url = url.toString();
    item.name = (url.pathname.split('/').pop() || '') + url.search;
    item.status = 0;
    item.statusText = 'Pending';
    if (!item.startTime) { // UNSENT
      item.startTime = (+new Date());
    }

    if (Object.prototype.toString.call(requestHeader) === '[object Headers]') {
      item.requestHeader = {};
      for (const [key, value] of <Headers>requestHeader) {
        item.requestHeader[key] = value;
      }
    } else {
      item.requestHeader = requestHeader;
    }

    // save GET data
    if (url.search && url.searchParams) {
      item.getData = {};
      for (const [key, value] of url.searchParams) {
        item.getData[key] = value;
      }
    }

    // save POST data
    if (init?.body) {
      item.postData = Helper.genFormattedBody(init.body);
    }

    // const request = tool.isString(input) ? url.toString() : input;

    this.onUpdateCallback(item);
  }

  protected afterFetch(item) {
    const then = (resp: Response) => {
      item.endTime = Date.now();
      item.costTime = item.endTime - (item.startTime || item.endTime);
      item.status = resp.status;
      item.statusText = String(resp.status);

      item.header = {};
      for (const [key, value] of resp.headers) {
        item.header[key] = value;
      }
      item.readyState = 4;

      this.onUpdateCallback(item);

      return new Proxy(resp, new ResponseProxyHandler(resp, item, this.onUpdateCallback));

      // parse response body by Content-Type
      // const contentType = response.headers.get('content-type');
      // if (contentType && contentType.includes('application/json')) {
      //   item.responseType = 'json';
      //   return response.text();
      // } else if (contentType && (contentType.includes('text/html') || contentType.includes('text/plain'))) {
      //   item.responseType = 'text';
      //   return response.text();
      // } else {
      //   item.responseType = 'blob';
      //   return response.text();
      //   // item.responseType = '';
      //   // return '[object Object]';
      // }
    };
    return then;
  }
}

export class FetchProxy {
  public static origFetch = fetch;

  public static create(onUpdateCallback: IOnUpdateCallback) {
    return new Proxy(fetch, new FetchProxyHandler(onUpdateCallback));
  }
}
