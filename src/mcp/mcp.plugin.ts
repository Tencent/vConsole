import { VConsoleSveltePlugin } from '../lib/sveltePlugin';
import * as tool from '../lib/tool';
import MCPComp from './mcp.svelte';

const ENDPOINT_STORAGE_KEY = 'mcp_endpoint';
const TOKEN_STORAGE_KEY = 'mcp_token';
const AUTO_CONNECT_STORAGE_KEY = 'mcp_auto_connect';

function getStoredValue(key: string, legacyKey?: string) {
  try {
    return tool.getStorage(key) || (legacyKey ? localStorage.getItem(legacyKey) : '') || '';
  } catch (e) {
    return '';
  }
}

function setStoredValue(key: string, value: string) {
  try {
    tool.setStorage(key, value);
  } catch (e) {
    // Ignore unavailable storage and keep the connection usable.
  }
}

export class VConsoleMCPPlugin extends VConsoleSveltePlugin {
  protected unsubscribeState?: () => void;
  protected unsubscribeExecutionChange?: () => void;

  constructor(id: string, name: string) {
    super(id, name, MCPComp, {
      protocol: location.protocol === 'https:' ? 'wss:' : 'ws:',
      host: location.hostname,
      port: '8765',
      path: '',
      token: '',
      state: 'closed',
      allowJavaScriptExecution: false,
    });
  }

  public onReady() {
    super.onReady();
    const option = this.vConsole.option.mcp || {};
    const savedEndpoint = getStoredValue(ENDPOINT_STORAGE_KEY, 'vconsole-mcp-endpoint');
    const savedToken = getStoredValue(TOKEN_STORAGE_KEY, 'vconsole-mcp-token');

    this.updateForm(
      option.endpoint || savedEndpoint,
      option.token || savedToken,
      option.allowJavaScriptExecution === true,
    );
    this.unsubscribeState = this.vConsole.mcp.subscribe((state) => {
      (<any>this.compInstance).state = state;
    });
    this.unsubscribeExecutionChange = this.compInstance.$on('allowJavaScriptExecutionChange', (event) => {
      this.vConsole.setOption('mcp.allowJavaScriptExecution', event.detail === true);
    });

    if (
      option.autoConnect !== false
      && !option.endpoint
      && savedEndpoint
      && getStoredValue(AUTO_CONNECT_STORAGE_KEY) !== 'false'
    ) {
      this.connect();
    }
  }

  public onAddTool(callback: Function) {
    callback([
      {
        name: 'Connect',
        global: false,
        onClick: () => this.connect(),
      },
      {
        name: 'Disconnect',
        global: false,
        onClick: () => this.disconnect(),
      },
    ]);
  }

  public onUpdateOption() {
    const option = this.vConsole.option.mcp || {};
    this.updateForm(option.endpoint, option.token, option.allowJavaScriptExecution === true);
  }

  public onRemove() {
    this.unsubscribeState?.();
    this.unsubscribeExecutionChange?.();
    super.onRemove();
  }

  protected connect() {
    const comp = <any>this.compInstance;
    const host = String(comp.host).trim();
    const port = Number(comp.port);
    if (!host || !Number.isInteger(port) || port < 1 || port > 65535) {
      return false;
    }
    const formattedHost = host.indexOf(':') > -1 && host[0] !== '[' ? `[${host}]` : host;
    const endpoint = `${comp.protocol}//${formattedHost}:${port}${comp.path}`;
    try {
      new URL(endpoint);
    } catch (e) {
      return false;
    }
    const option = {
      ...this.vConsole.option.mcp,
      endpoint,
      token: comp.token,
      autoConnect: true,
      allowJavaScriptExecution: comp.allowJavaScriptExecution === true,
    };
    setStoredValue(ENDPOINT_STORAGE_KEY, endpoint);
    setStoredValue(TOKEN_STORAGE_KEY, comp.token);
    setStoredValue(AUTO_CONNECT_STORAGE_KEY, 'true');
    this.vConsole.setOption({ mcp: option });
    this.vConsole.mcp.connect();
    return true;
  }

  protected disconnect() {
    setStoredValue(AUTO_CONNECT_STORAGE_KEY, 'false');
    this.vConsole.mcp.disconnect();
  }

  protected updateForm(endpoint?: string, token?: string, allowJavaScriptExecution?: boolean) {
    const comp = <any>this.compInstance;
    if (endpoint) {
      try {
        const url = new URL(endpoint);
        comp.protocol = url.protocol === 'wss:' ? 'wss:' : 'ws:';
        comp.host = url.hostname;
        comp.port = url.port || (comp.protocol === 'wss:' ? '443' : '80');
        comp.path = `${url.pathname === '/' ? '' : url.pathname}${url.search}`;
      } catch (e) {
        // Keep the current values when the endpoint is invalid.
      }
    }
    if (token !== undefined) {
      comp.token = token;
    }
    if (allowJavaScriptExecution !== undefined) {
      comp.allowJavaScriptExecution = allowJavaScriptExecution;
    }
  }
}
