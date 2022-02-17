export interface VConsoleLogOptions {
  maxLogNumber?: number;
}

export interface VConsoleNetworkOptions {
  maxNetworkNumber?: number;
}

export interface VConsoleStorageOptions {
  defaultStorages?: ('cookies' | 'localStorage' | 'sessionStorage' | 'wxStorage')[];
}

export interface VConsoleOptions {
  target?: string | HTMLElement;
  defaultPlugins?: ('system' | 'network' | 'element' | 'storage')[];
  theme?: '' | 'dark' | 'light';
  disableLogScrolling?: boolean;
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
