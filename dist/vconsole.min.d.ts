/**
 * VConsole type definitions
 * @see https://github.com/Tencent/vConsole
 */

declare module 'vconsole' {
  // VConsole configs
  export interface VConsoleConfig {
    defaultPlugins?: string[]
    onReady?: () => void
    onClearLog?: () => void
    maxLogNumber?: number
    disableLogScrolling?: boolean
  }

  /**
   * VConsole
   * @see https://github.com/Tencent/vConsole/blob/dev/doc/public_properties_methods.md
   */
  export class VConsoleInstance {
    constructor (config?: VConsoleConfig)

    // properties
    readonly version: string
    option: VConsoleConfig
    readonly activedTab: string
    readonly tabList: string[]
    readonly $dom: HTMLDivElement

    // methods
    setOption (config: VConsoleConfig): void;
    setOption <TKey extends keyof VConsoleConfig>(key: TKey, value: VConsoleConfig[TKey]): void
    destroy (): void
    addPlugin (plugin: VConsolePluginInstance): boolean
    removePlugin (pluginId: string): boolean
    showTab (pluginId: string): void
    show (): void
    hide (): void
    showSwitch (): void
    hideSwitch (): void
  }

  /**
   * VConsole Plugin Event List
   * @see https://github.com/Tencent/vConsole/blob/dev/doc/plugin_event_list.md
   */
  export interface VConsolePluginEventMap {
    init (): void

    renderTab (
      callback: <AnyElement extends { appendTo: () => void }>(html: string | HTMLElement | AnyElement) => void
    ): void

    addTopBar (
      callback: (
        btnList: {
          name: string
          data?: { [key: string]: string | number }
          className?: string
          onClick (e: MouseEvent | TouchEvent): void | boolean
        }[]
      ) => void
    ): void

    addTool (
      callback: (
        toolList: {
          name: string
          global?: boolean
          onClick (e: MouseEvent | TouchEvent): void | boolean
        }[]
      ) => void
    ): void

    ready (): void

    remove (): void

    show (): void

    hide (): void

    showConsole (): void

    hideConsole (): void

    updateOption (): void
  }

  /**
   * VConsole Plugin
   * @see https://github.com/Tencent/vConsole/blob/dev/doc/plugin_getting_started.md
   */
  export class VConsolePluginInstance {
    constructor (id: string, name?: string)

    // properties
    id: string
    name: string
    vConsole: VConsoleInstance

    // methods
    on<EventName extends keyof VConsolePluginEventMap> (
        eventName: EventName,
        callback: VConsolePluginEventMap[EventName]
    ): VConsolePluginInstance
    trigger<T = any> (eventName: keyof VConsolePluginEventMap, data: T): VConsolePluginInstance
  }

  export class VConsole extends VConsoleInstance {
    static VConsolePlugin: VConsolePluginInstance
  }

  export default VConsole
}
