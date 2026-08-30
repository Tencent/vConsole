import { get } from 'svelte/store';
import type { VConsoleMCPOptions } from '../core/options.interface';
import { VConsoleLogStore } from '../log/log.store';
import { requestList } from '../network/network.model';

export type VConsoleMCPState = 'closed' | 'connecting' | 'open';
export type VConsoleMCPStateListener = (state: VConsoleMCPState) => void;

interface IMCPRequest {
  v: 1;
  id: string;
  type: 'rpc.request';
  method: 'console.list' | 'network.list' | 'runtime.evaluate';
  params?: Record<string, any>;
}

const PAGE_ID_STORAGE_KEY = '__vconsole_mcp_page_id__';
const MAX_RESULT_NUMBER = 100;
const MAX_STRING_LENGTH = 20000;
const MAX_MESSAGE_LENGTH = 1000000;
const MAX_CODE_LENGTH = 100000;
const NativeWebSocket = typeof window !== 'undefined' ? window.WebSocket : undefined;

export class VConsoleMCPClient {
  public state: VConsoleMCPState = 'closed';
  public endpoint: string = '';

  protected option: VConsoleMCPOptions;
  protected socket?: WebSocket;
  protected socketEndpoint: string = '';
  protected reconnectTimer?: number;
  protected shouldReconnect: boolean = false;
  protected pageId: string;
  protected stateListeners: Set<VConsoleMCPStateListener> = new Set();

  constructor(option: VConsoleMCPOptions = {}) {
    this.option = { ...option };
    this.endpoint = option.endpoint || '';
    this.pageId = this.getPageId();
  }

  public setOption(option: VConsoleMCPOptions = {}) {
    const endpoint = option.endpoint !== undefined ? option.endpoint : this.endpoint;
    const shouldReconnect = endpoint !== this.endpoint || option.token !== this.option.token;
    this.option = { ...option };
    if (!shouldReconnect) {
      return;
    }
    this.disconnect();
    this.endpoint = endpoint;
    if (endpoint && option.autoConnect !== false) {
      this.connect();
    }
  }

  public subscribe(listener: VConsoleMCPStateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.state);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  public connect(endpoint: string = this.endpoint) {
    if (!NativeWebSocket || !this.isValidEndpoint(endpoint)) {
      return false;
    }
    if (this.socket && this.socketEndpoint === endpoint && this.socket.readyState <= 1) {
      return true;
    }

    this.disconnect();
    this.endpoint = endpoint;
    this.shouldReconnect = true;
    this.open();
    return true;
  }

  public disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
    }
    this.socketEndpoint = '';
    this.setState('closed');
  }

  protected open() {
    if (!NativeWebSocket) {
      this.shouldReconnect = false;
      this.setState('closed');
      return;
    }

    this.setState('connecting');
    try {
      const socket = new NativeWebSocket(this.endpoint);
      this.socket = socket;
      this.socketEndpoint = this.endpoint;
      socket.addEventListener('open', () => this.onOpen(socket));
      socket.addEventListener('message', (event) => this.onMessage(socket, event));
      socket.addEventListener('close', () => this.onClose(socket));
      socket.addEventListener('error', () => socket.close());
    } catch (e) {
      this.socket = undefined;
      this.socketEndpoint = '';
      this.setState('closed');
      this.scheduleReconnect();
    }
  }

  protected onOpen(socket: WebSocket) {
    if (socket !== this.socket) {
      return;
    }
    this.setState('open');
    this.send(socket, {
      v: 1,
      type: 'page.hello',
      pageId: this.pageId,
      ts: Date.now(),
      payload: this.getPageInfo(),
      token: this.option.token,
    });
  }

  protected async onMessage(socket: WebSocket, event: MessageEvent) {
    if (socket !== this.socket) {
      return;
    }
    let request: IMCPRequest;
    try {
      request = JSON.parse(String(event.data));
    } catch (e) {
      return;
    }
    if (request?.v !== 1 || request?.type !== 'rpc.request' || !request.id) {
      return;
    }

    try {
      const result = await this.handleRequest(request);
      this.send(socket, {
        v: 1,
        id: request.id,
        type: 'rpc.response',
        result,
      });
    } catch (e) {
      this.send(socket, {
        v: 1,
        id: request.id,
        type: 'rpc.response',
        error: this.serializeError(e),
      });
    }
  }

  protected onClose(socket: WebSocket) {
    if (socket !== this.socket) {
      return;
    }
    this.socket = undefined;
    this.setState('closed');
    this.scheduleReconnect();
  }

  protected setState(state: VConsoleMCPState) {
    if (state === this.state) {
      return;
    }
    this.state = state;
    this.stateListeners.forEach((listener) => listener(state));
  }

  protected scheduleReconnect() {
    if (!this.shouldReconnect || this.reconnectTimer) {
      return;
    }
    const interval = Number(this.option.reconnectInterval) || 2000;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = undefined;
      this.open();
    }, interval);
  }

  protected handleRequest(request: IMCPRequest) {
    switch (request.method) {
      case 'console.list':
        return this.getConsoleLogs(request.params);
      case 'network.list':
        return this.getNetworkRequests(request.params);
      case 'runtime.evaluate':
        return this.evaluate(request.params);
      default:
        throw new Error(`Unsupported method: ${request.method}`);
    }
  }

  protected async evaluate(params: Record<string, any> = {}) {
    if (this.option.allowJavaScriptExecution !== true) {
      throw new Error('JavaScript execution is disabled in the vConsole MCP panel.');
    }
    if (typeof params.code !== 'string' || !params.code.trim()) {
      throw new Error('Non-empty JavaScript code is required.');
    }
    if (params.code.length > MAX_CODE_LENGTH) {
      throw new Error(`JavaScript code cannot exceed ${MAX_CODE_LENGTH} characters.`);
    }
    const result = await (0, eval)(params.code);
    return this.serialize(result);
  }

  protected getConsoleLogs(params: Record<string, any> = {}) {
    const limit = this.getLimit(params.limit);
    const level = String(params.level || '');
    const pluginId = String(params.pluginId || 'default');
    const rawStore = VConsoleLogStore.get(pluginId);
    if (!rawStore) {
      return [];
    }
    const store = get(rawStore);

    return store.logList
      .filter((log) => !level || log.type === level)
      .slice(-limit)
      .map((log) => ({
        id: log._id,
        level: log.type,
        timestamp: log.date,
        repeated: log.repeated,
        commandType: log.cmdType,
        args: log.data.map((item) => this.serialize(item.origData)),
      }));
  }

  protected getNetworkRequests(params: Record<string, any> = {}) {
    const limit = this.getLimit(params.limit);
    const failedOnly = !!params.failedOnly;
    const urlIncludes = String(params.urlIncludes || '');
    const includeBody = !!params.includeBody;

    const requests = get(requestList);
    return Object.keys(requests).map((id) => requests[id])
      .filter((item) => !!item)
      .filter((item) => !failedOnly || Number(item.status) >= 400 || (!Number(item.status) && !!item.endTime))
      .filter((item) => !urlIncludes || item.url.indexOf(urlIncludes) > -1)
      .sort((a, b) => a.startTime - b.startTime)
      .slice(-limit)
      .map((item) => ({
        id: item.id,
        requestType: item.requestType,
        method: item.method,
        url: item.url,
        status: item.status,
        statusText: item.statusText,
        readyState: item.readyState,
        startTime: item.startTime,
        duration: item.costTime,
        requestHeaders: this.serialize(item.requestHeader),
        responseHeaders: this.serialize(item.header),
        requestBody: includeBody ? this.serialize(item.postData) : undefined,
        responseBody: includeBody ? this.serialize(item.response) : undefined,
      }));
  }

  protected getPageInfo() {
    return {
      url: location.href,
      title: document.title,
      userAgent: navigator.userAgent,
    };
  }

  protected getLimit(value: any) {
    const limit = Number(value) || 50;
    return Math.min(Math.max(limit, 1), MAX_RESULT_NUMBER);
  }

  protected isValidEndpoint(endpoint: string) {
    try {
      const url = new URL(endpoint);
      return (url.protocol === 'ws:' || url.protocol === 'wss:') && !!url.hostname;
    } catch (e) {
      return false;
    }
  }

  protected getPageId() {
    try {
      const storedId = sessionStorage.getItem(PAGE_ID_STORAGE_KEY);
      if (storedId) {
        return storedId;
      }
      const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      sessionStorage.setItem(PAGE_ID_STORAGE_KEY, id);
      return id;
    } catch (e) {
      return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
  }

  protected serialize(value: any, depth: number = 0, seen: WeakSet<object> = new WeakSet()) : any {
    if (value === null || typeof value === 'boolean' || typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      return value.length > MAX_STRING_LENGTH
        ? `${value.slice(0, MAX_STRING_LENGTH)}...[truncated]`
        : value;
    }
    if (typeof value === 'undefined' || typeof value === 'symbol' || typeof value === 'bigint') {
      return String(value);
    }
    if (typeof value === 'function') {
      return `[Function ${value.name || 'anonymous'}]`;
    }
    if (value instanceof Error) {
      return { name: value.name, message: value.message, stack: value.stack };
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof Node !== 'undefined' && value instanceof Node) {
      return typeof Element !== 'undefined' && value instanceof Element
        ? value.outerHTML.slice(0, MAX_STRING_LENGTH)
        : String(value);
    }
    if (depth >= 5) {
      return '[Max Depth]';
    }
    if (seen.has(value)) {
      return '[Circular]';
    }
    seen.add(value);

    if (Array.isArray(value)) {
      return value.slice(0, 100).map((item) => this.serialize(item, depth + 1, seen));
    }
    if (value instanceof ArrayBuffer) {
      return `[ArrayBuffer ${value.byteLength} bytes]`;
    }
    if (typeof Blob !== 'undefined' && value instanceof Blob) {
      return `[Blob ${value.size} bytes, ${value.type || 'unknown'}]`;
    }

    const result: Record<string, any> = {};
    for (const key of Object.keys(value).slice(0, 100)) {
      try {
        result[key] = this.serialize(value[key], depth + 1, seen);
      } catch (e) {
        result[key] = '[Unserializable]';
      }
    }
    return result;
  }

  protected serializeError(error: any) {
    const serialized = this.serialize(error);
    return typeof serialized === 'string' ? serialized : JSON.stringify(serialized);
  }

  protected send(socket: WebSocket, message: Record<string, any>) {
    if (socket === this.socket && socket.readyState === 1) {
      let data = JSON.stringify(message);
      if (data.length > MAX_MESSAGE_LENGTH && message.type === 'rpc.response') {
        data = JSON.stringify({
          v: 1,
          id: message.id,
          type: 'rpc.response',
          error: 'Result is too large. Reduce the limit or disable response bodies.',
        });
      }
      socket.send(data);
    }
  }
}

export default VConsoleMCPClient;
