export interface VConsoleLogOptions {
  maxLogNumber?: number;
  showTimestamps?: boolean;
}

export interface VConsoleNetworkOptions {
  maxNetworkNumber?: number;
}

export type VConsoleAvailableStorage = 'cookies' | 'localStorage' | 'sessionStorage' | 'wxStorage';
export interface VConsoleStorageOptions {
  defaultStorages?: VConsoleAvailableStorage[];
}

export interface VConsoleOptions {
  target?: string | HTMLElement;
  defaultPlugins?: ('system' | 'network' | 'element' | 'storage')[];
  theme?: '' | 'dark' | 'light';
  disableLogScrolling?: boolean;
  pluginOrder?: string[];
  onReady?: () => void;

  log?: VConsoleLogOptions,
  network?: VConsoleNetworkOptions,
  storage?: VConsoleStorageOptions,

  /**
   * @deprecated Since v3.12.0, use `log.maxLogNumber`.
   */
  maxLogNumber?: number;
  /**
   * @deprecated Since v3.12.0, use `network.maxNetworkNumber`.
   */
  maxNetworkNumber?: number;
  /**
   * @deprecated Since v3.12.0.
   */
  onClearLog?: () => void;
}
