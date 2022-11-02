import * as tool from '../lib/tool';
import * as Helper from './helper';
import { VConsoleNetworkRequestItem } from './requestItem';
import type { VConsoleRequestMethod } from './requestItem';
import type { IOnUpdateCallback } from './helper';

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

  public set(target: T, key: string, value) {
    // if (typeof key === 'string') { console.log('Proxy set:', key) }
    return Reflect.set(target, key, value);
  }

  public get(target: T, key: string) {
    // if (typeof key === 'string') { console.log('[Fetch.proxy] get:', key) }
    const value = Reflect.get(target, key);
    switch (key) {
      case 'arrayBuffer':
      case 'blob':
      case 'formData':
      case 'json':
      case 'text':
        return () => {
          this.item.responseType = <any>key.toLowerCase();
          return value.apply(target).then((resp) => {
            this.item.response = Helper.genResonseByResponseType(this.item.responseType, resp);
            this.onUpdateCallback(this.item);
            return resp;
          });
        };
    }
    if (typeof value === 'function') {
      return value.bind(target);
    } else {
      return value;
    }
  }

  protected mockReader() {
    let readerReceivedValue: Uint8Array;
    if (!this.resp.body) {
      // some browsers do not return `body` in some cases, like `OPTIONS` method. (issue #531)
      return;
    }
    if (typeof this.resp.body.getReader !== 'function') {
      return;
    }
    const _getReader = this.resp.body.getReader;
    this.resp.body.getReader = () => {
      // console.log('[Fetch.proxy] getReader');
      const reader = <ReturnType<typeof _getReader>>_getReader.apply(this.resp.body);

      // when readyState is already 4,
      // it's not a chunked stream, or it had already been read.
      // so should not update status.
      if (this.item.readyState === 4) {
        return reader;
      }

      const _read = reader.read;
      const _cancel = reader.cancel;
      this.item.responseType = 'arraybuffer';

      reader.read = () => {
        return (<ReturnType<typeof _read>>_read.apply(reader)).then((result) => {
          // console.log('[Fetch.proxy] read', result.done);
          if (!readerReceivedValue) {
            readerReceivedValue = new Uint8Array(result.value);
          } else {
            const newValue = new Uint8Array(readerReceivedValue.length + result.value.length);
            newValue.set(readerReceivedValue);
            newValue.set(result.value, readerReceivedValue.length);
            readerReceivedValue = newValue;
          }
          this.item.endTime = Date.now();
          this.item.costTime = this.item.endTime - (this.item.startTime || this.item.endTime);
          this.item.readyState = result.done ? 4 : 3;
          this.item.statusText = result.done ? String(this.item.status) : 'Loading';
          this.item.responseSize = readerReceivedValue.length;
          this.item.responseSizeText = tool.getBytesText(this.item.responseSize);
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

  public apply(target: T, thisArg: typeof window, argsList) {
    const input: RequestInfo = argsList[0];
    const init: RequestInit = argsList[1];
    const item = new VConsoleNetworkRequestItem();
    this.beforeFetch(item, input, init);

    return (<ReturnType<T>>target.apply(window, argsList)).then(this.afterFetch(item)).catch((e) => {
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
    item.readyState = 1;
    if (!item.startTime) { // UNSENT
      item.startTime = Date.now();
      const sd = tool.getDate(item.startTime);
      item.startTimeText = `${sd.year}-${sd.month}-${sd.day} ${sd.hour}:${sd.minute}:${sd.second}.${sd.millisecond}`;
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

    this.onUpdateCallback(item);
  }

  protected afterFetch(item) {
    const then = (resp: Response) => {
      item.endTime = Date.now();
      item.costTime = item.endTime - (item.startTime || item.endTime);
      item.status = resp.status;
      item.statusText = String(resp.status);

      let isChunked = false;
      item.header = {};
      for (const [key, value] of resp.headers) {
        item.header[key] = value;
        isChunked = value.toLowerCase().indexOf('chunked') > -1 ? true : isChunked;
      }
      // console.log('[Fetch.proxy] afterFetch', 'isChunked:', isChunked, resp.status);
      
      if (isChunked) {
        // when `transfer-encoding` is chunked, the response is a stream which is under loading,
        // so the `readyState` should be 3 (Loading), 
        // and the response should NOT be `clone()` which will affect stream reading.
        item.readyState = 3;
      } else {
        // Otherwise, not chunked, the response is not a stream,
        // so it's completed and can be `clone()` for `text()` calling.
        item.readyState = 4;

        this.handleResponseBody(resp.clone(), item).then((responseValue: string | ArrayBuffer) => {
          // console.log(item.responseType, responseValue)
          item.responseSize = typeof responseValue === 'string' ? responseValue.length : responseValue.byteLength;
          item.responseSizeText = tool.getBytesText(item.responseSize);
          item.response = Helper.genResonseByResponseType(item.responseType, responseValue);
          this.onUpdateCallback(item);
        });
      }

      this.onUpdateCallback(item);
      return new Proxy(resp, new ResponseProxyHandler(resp, item, this.onUpdateCallback));
    };
    return then;
  }

  protected handleResponseBody(resp: Response, item: VConsoleNetworkRequestItem) {
    // parse response body by Content-Type
    const contentType = resp.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      item.responseType = 'json';
      return resp.text();
    } else if (contentType && (contentType.includes('text/html') || contentType.includes('text/plain'))) {
      item.responseType = 'text';
      return resp.text();
    } else {
      item.responseType = 'arraybuffer';
      return resp.arrayBuffer();
    }
  }
}

export class FetchProxy {
  public static origFetch = fetch;

  public static create(onUpdateCallback: IOnUpdateCallback) {
    return new Proxy(fetch, new FetchProxyHandler(onUpdateCallback));
  }
}
