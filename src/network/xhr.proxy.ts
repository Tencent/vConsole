import { VConsoleNetworkRequestItem, RequestItemHelper } from './requestItem';

type IOnUpdateCallback = (item: VConsoleNetworkRequestItem) => void;

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
      case 'open':
        return this.getOpen(target);
      
      case 'send':
        return this.getSend(target);

      default:
        if (typeof target[key] === 'function') {
          return (...args) => {
            return target[key].apply(target, args);
          };
        } else {
          return Reflect.get(target, key);
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
    RequestItemHelper.updateItemByReadyState(this.item, this.XMLReq);

    // update response by responseType
    this.item.response = RequestItemHelper.genResonseByResponseType(this.item.responseType, this.item.response);

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

  protected getOpen(target) {
    return (...args) => {
      // console.log('Proxy open()');
      const method = args[0];
      const url = args[1];
      this.item.method = method ? method.toUpperCase() : 'GET';
      this.item.url = url || '';
      this.item.name = this.item.url.replace(new RegExp('[/]*$'), '').split('/').pop() || '';
      this.item.getData = RequestItemHelper.genGetDataByUrl(this.item.url, {});
      this.triggerUpdate();
      return target.open.apply(target, args);
    };
  }

  protected getSend(target) {
    return (...args) => {
      // console.log('Proxy send()');
      const data: XMLHttpRequestBodyInit = args[0];
      this.item.postData = RequestItemHelper.genFormattedBody(data);
      this.triggerUpdate();
      return target.send.apply(target, args);
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