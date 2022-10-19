import { getBytesText, getDate } from '../lib/tool';
import * as Helper from './helper';
import { VConsoleNetworkRequestItem } from './requestItem';
import type { IOnUpdateCallback } from './helper';

export class XHRProxyHandler<T extends XMLHttpRequest> implements ProxyHandler<T> {
  public XMLReq: XMLHttpRequest;
  public item: VConsoleNetworkRequestItem;
  protected onUpdateCallback: IOnUpdateCallback;

  constructor(XMLReq: XMLHttpRequest, onUpdateCallback: IOnUpdateCallback) {
    this.XMLReq = XMLReq;
    this.XMLReq.onreadystatechange = () => { this.onReadyStateChange() };
    this.XMLReq.onabort = () => { this.onAbort() };
    this.XMLReq.ontimeout = () => { this.onTimeout() };
    this.item = new VConsoleNetworkRequestItem();
    this.item.requestType = 'xhr';
    this.onUpdateCallback = onUpdateCallback;
  }

  public get(target: T, key: string) {
    // if (typeof key === 'string') { console.log('Proxy get:', typeof key, key); }
    switch (key) {
      case '_noVConsole':
        return this.item.noVConsole;

      case 'open':
        return this.getOpen(target);

      case 'send':
        return this.getSend(target);
      
      case 'setRequestHeader':
        return this.getSetRequestHeader(target);

      default:
        const value = Reflect.get(target, key);
        if (typeof value === 'function') {
          return value.bind(target);
        } else {
          return value;
        }
    }
  }

  public set(target: T, key: string, value: any) {
    // if (typeof key === 'string') { console.log('Proxy set:', typeof key, key); }
    switch (key) {
      case '_noVConsole':
        this.item.noVConsole = !!value;
        return;

      case 'onreadystatechange':
        return this.setOnReadyStateChange(target, key, value);

      case 'onabort':
        return this.setOnAbort(target, key, value);

      case 'ontimeout':
        return this.setOnTimeout(target, key, value);

      default:
      // do nothing
    }
    return Reflect.set(target, key, value);
  }

  public onReadyStateChange() {
    // console.log('Proxy onReadyStateChange()')
    this.item.readyState = this.XMLReq.readyState;
    this.item.responseType = this.XMLReq.responseType;
    this.item.endTime = Date.now();
    this.item.costTime = this.item.endTime - this.item.startTime;

    // update data by readyState
    this.updateItemByReadyState();

    // update response by responseType
    this.item.response = Helper.genResonseByResponseType(this.item.responseType, this.item.response);

    this.triggerUpdate();
  }

  public onAbort() {
    // console.log('Proxy onAbort()')
    this.item.cancelState = 1;
    this.item.statusText = 'Abort';
    this.triggerUpdate();
  }

  public onTimeout() {
    this.item.cancelState = 3;
    this.item.statusText = 'Timeout';
    this.triggerUpdate();
  }

  protected triggerUpdate() {
    if (!this.item.noVConsole) {
      this.onUpdateCallback(this.item);
    }
  }

  protected getOpen(target: T) {
    const targetFunction = Reflect.get(target, 'open');
    return (...args) => {
      // console.log('Proxy open()');
      const method = args[0];
      const url = args[1];
      this.item.method = method ? method.toUpperCase() : 'GET';
      this.item.url = url || '';
      this.item.name = this.item.url.replace(new RegExp('[/]*$'), '').split('/').pop() || '';
      this.item.getData = Helper.genGetDataByUrl(this.item.url, {});
      this.triggerUpdate();
      return targetFunction.apply(target, args);
    };
  }

  protected getSend(target: T) {
    const targetFunction = Reflect.get(target, 'send');
    return (...args) => {
      // console.log('Proxy send()');
      const data: XMLHttpRequestBodyInit = args[0];
      this.item.postData = Helper.genFormattedBody(data);
      this.triggerUpdate();
      return targetFunction.apply(target, args);
    };
  }

  protected getSetRequestHeader(target: T) {
    const targetFunction = Reflect.get(target, 'setRequestHeader');
    return (...args) => {
      if (!this.item.requestHeader) {
        this.item.requestHeader = {};
      }
      this.item.requestHeader[args[0]] = args[1];
      this.triggerUpdate();
      return targetFunction.apply(target, args);
    };
  }

  protected setOnReadyStateChange(target: T, key: string, value) {
    return Reflect.set(target, key, (...args) => {
      this.onReadyStateChange();
      value.apply(target, args);
    });
  }

  protected setOnAbort(target: T, key: string, value) {
    return Reflect.set(target, key, (...args) => {
      this.onAbort();
      value.apply(target, args);
    });
  }

  protected setOnTimeout(target: T, key: string, value) {
    return Reflect.set(target, key, (...args) => {
      this.onTimeout();
      value.apply(target, args);
    });
  }

  /**
   * Update item's properties according to readyState.
   */
  protected updateItemByReadyState() {
    switch (this.XMLReq.readyState) {
      case 0: // UNSENT
      case 1: // OPENED
        this.item.status = 0;
        this.item.statusText = 'Pending';
        if (!this.item.startTime) {
          this.item.startTime = Date.now();
          const sd = getDate(this.item.startTime);
          this.item.startTimeText = `${sd.year}-${sd.month}-${sd.day} ${sd.hour}:${sd.minute}:${sd.second}.${sd.millisecond}`;
        }
        break;

      case 2: // HEADERS_RECEIVED
        this.item.status = this.XMLReq.status;
        this.item.statusText = 'Loading';
        this.item.header = {};
        const header = this.XMLReq.getAllResponseHeaders() || '',
          headerArr = header.split('\n');
        // extract plain text to key-value format
        for (let i = 0; i < headerArr.length; i++) {
          const line = headerArr[i];
          if (!line) { continue; }
          const arr = line.split(': ');
          const key = arr[0];
          const value = arr.slice(1).join(': ');
          this.item.header[key] = value;
        }
        break;

      case 3: // LOADING
        this.item.status = this.XMLReq.status;
        this.item.statusText = 'Loading';
        if (!!this.XMLReq.response && this.XMLReq.response.length) {
          this.item.responseSize = this.XMLReq.response.length;
          this.item.responseSizeText = getBytesText(this.item.responseSize);
        }
        break;

      case 4: // DONE
        // `XMLReq.abort()` will change `status` from 200 to 0, so use previous value in this case
        this.item.status = this.XMLReq.status || this.item.status || 0;
        this.item.statusText = String(this.item.status); // show status code when request completed
        this.item.endTime = Date.now();
        this.item.costTime = this.item.endTime - (this.item.startTime || this.item.endTime);
        this.item.response = this.XMLReq.response;

        if (!!this.XMLReq.response && this.XMLReq.response.length) {
          this.item.responseSize = this.XMLReq.response.length;
          this.item.responseSizeText = getBytesText(this.item.responseSize);
        }
        break;

      default:
        this.item.status = this.XMLReq.status;
        this.item.statusText = 'Unknown';
        break;
    }
  }
}

export class XHRProxy {
  public static origXMLHttpRequest = XMLHttpRequest;

  public static create(onUpdateCallback: IOnUpdateCallback) {
    return new Proxy(XMLHttpRequest, {
      construct(ctor) {
        const XMLReq = new ctor();
        return new Proxy(XMLReq, new XHRProxyHandler(XMLReq, onUpdateCallback));
      },
    });
  }
}