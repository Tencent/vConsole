import { getDate } from '../lib/tool';
import { VConsoleNetworkRequestItem, VConsoleWebSocketMessage } from './requestItem';
import type { IOnUpdateCallback } from './helper';

export class WebSocketProxyHandler<T extends WebSocket> implements ProxyHandler<T> {
  public ws: WebSocket;
  public item: VConsoleNetworkRequestItem;
  protected onUpdateCallback: IOnUpdateCallback;

  constructor(ws: WebSocket, onUpdateCallback: IOnUpdateCallback) {
    this.ws = ws;
    this.item = new VConsoleNetworkRequestItem();
    this.item.requestType = 'websocket';
    this.item.method = 'WS';
    this.item.messages = [];
    this.onUpdateCallback = onUpdateCallback;

    ws.addEventListener('open', () => this.onOpen());
    ws.addEventListener('message', (e) => this.onMessage(e));
    ws.addEventListener('error', () => this.onError());
    ws.addEventListener('close', (e) => this.onClose(e));
  }

  public get(target: T, key: string) {
    switch (key) {
      case '_noVConsole':
        return this.item.noVConsole;
      case 'send':
        return this.getSend(target);
      default:
        const value = Reflect.get(target, key);
        if (typeof value === 'function') {
          return value.bind(target);
        }
        return value;
    }
  }

  public set(target: T, key: string, value: any) {
    switch (key) {
      case '_noVConsole':
        this.item.noVConsole = !!value;
        return true;
      default:
        return Reflect.set(target, key, value);
    }
  }

  protected getSend(target: T) {
    const targetFunction = Reflect.get(target, 'send');
    return (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
      this.addMessage('send', data);
      return targetFunction.apply(target, [data]);
    };
  }

  protected addMessage(type: 'send' | 'receive', data: any) {
    const time = Date.now();
    const sd = getDate(time);
    const msg: VConsoleWebSocketMessage = {
      type,
      data,
      time,
      timeText: `${sd.hour}:${sd.minute}:${sd.second}.${sd.millisecond}`,
    };
    this.item.messages.push(msg);
    this.triggerUpdate();
  }

  protected onOpen() {
    this.item.status = 101;
    this.item.statusText = 'Connected';
    this.item.endTime = Date.now();
    this.item.costTime = this.item.endTime - (this.item.startTime || this.item.endTime);
    this.triggerUpdate();
  }

  protected onMessage(e: MessageEvent) {
    this.addMessage('receive', e.data);
  }

  protected onError() {
    this.item.status = 0;
    this.item.statusText = 'Error';
    this.item.endTime = Date.now();
    this.item.costTime = this.item.endTime - (this.item.startTime || this.item.endTime);
    this.triggerUpdate();
  }

  protected onClose(e: CloseEvent) {
    this.item.status = e.code;
    this.item.statusText = e.wasClean ? 'Closed' : 'Closed (abnormal)';
    this.item.endTime = Date.now();
    this.item.costTime = this.item.endTime - (this.item.startTime || this.item.endTime);
    this.triggerUpdate();
  }

  protected triggerUpdate() {
    if (!this.item.noVConsole) {
      this.onUpdateCallback(this.item);
    }
  }
}

export class WebSocketProxy {
  public static origWebSocket = WebSocket;

  public static create(onUpdateCallback: IOnUpdateCallback) {
    return new Proxy(WebSocket, {
      construct(ctor, args: [string, (string | string[])?]) {
        const ws = new ctor(...args);
        const handler = new WebSocketProxyHandler(ws, onUpdateCallback);
        const proxy = new Proxy(ws, handler);

        // initialize item after URL is available
        const url = args[0];
        const sd = getDate(Date.now());
        handler.item.url = url || '';
        handler.item.name = (url || '').replace(/[/]*$/, '').split('/').pop() || 'Unknown';
        handler.item.startTime = Date.now();
        handler.item.startTimeText = `${sd.year}-${sd.month}-${sd.day} ${sd.hour}:${sd.minute}:${sd.second}.${sd.millisecond}`;
        handler.item.status = 0;
        handler.item.statusText = 'Connecting';
        onUpdateCallback(handler.item);

        return proxy;
      },
    });
  }
}
