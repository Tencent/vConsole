/**
 * VConsole 定义文件
 * @see https://github.com/Tencent/vConsole
 */

// VConsole 配置项
export interface VConsoleConfig {
  defaultPlugins?: string[]
  onReady?: () => void
  onClearLog?: () => void
  maxLogNumber?: number
  disableLogScrolling?: boolean
}

// VConsole 主类
export class VConsoleInstance {
  constructor (config?: VConsoleConfig)

  // 当前 vConsole 的版本号
  readonly version: string

  // 配置项
  option: VConsoleConfig

  // 当前激活的 tab 的 plugin id
  readonly activedTab: string

  // 已安装的 tab 的 plugin id 列表
  readonly tabList: string[]

  // vConsole 的 HTML element
  readonly $dom: HTMLDivElement

  // 更新 vConsole.option 配置项
  setOption (config: VConsoleConfig): void;
  setOption <TKey extends keyof VConsoleConfig>(key: TKey, value: VConsoleConfig[TKey]): void

  // 析构一个 vConsole 对象实例，并将 vConsole 面板从页面中移除
  destroy (): void

  // 添加一个新插件。重名的插件会被忽略
  addPlugin (plugin: VConsolePluginInstance): boolean

  // 卸载一个插件
  removePlugin (pluginId: string): boolean

  // 根据 plugin id 激活显示一个 tab
  showTab (pluginId: string): void

  // 显示 vConsole 主面板。这个方法会触发插件事件 showConsole
  show (): void

  // 隐藏 vConsole 主面板。这个方法会触发插件事件 hideConsole
  hide (): void

  // 显示 vConsole 的开关按钮
  showSwitch (): void

  // 隐藏 vConsole 的开关按钮
  hideSwitch (): void
}

// VConsole 插件事件列表
export interface VConsolePluginEventMap {
  // 初始化
  init (): void

  // 当 vConsole 尝试为此插件渲染新 tab 时触发。这个事件只会触发一次
  renderTab (
    callback: <AnyElement extends { appendTo: () => void }>(html: string | HTMLElement | AnyElement) => void
  ): void

  // 当 vConsole 尝试为此插件添加新的 topbar 按钮时触发。这个事件只会触发一次
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

  // 当 vConsole 尝试为此插件添加新的 tool 按钮时触发。这个事件只会触发一次
  addTool (
    callback: (
      toolList: {
        name: string
        global?: boolean
        onClick (e: MouseEvent | TouchEvent): void | boolean
      }[]
    ) => void
  ): void

  // 当插件初始化结束后触发。这个事件只会触发一次。此时插件已经成功安装并已渲染到页面
  ready (): void

  // 当插件即将卸载前触发。这个事件只会触发一次
  remove (): void

  // 当插件的 tab 被显示时触发。只有绑定了 renderTab 事件的插件才会收到此事件
  show (): void

  // 当插件的 tab 被隐藏时触发。只有绑定了 renderTab 事件的插件才会收到此事件
  hide (): void

  // 当 vConsole 被显示时触发
  showConsole (): void

  // 当 vConsole 被隐藏时触发
  hideConsole (): void

  // 当 vConsole.setOption() 被调用时触发
  updateOption (): void
}

// VConsole 插件主类
export class VConsolePluginInstance {
  constructor (id: string, name?: string)

  // 插件 ID
  id: string

  // 插件名
  name: string

  // VConsole 实例
  vConsole: VConsoleInstance

  // 注册事件
  on<EventName extends keyof VConsolePluginEventMap> (
      eventName: EventName,
      callback: VConsolePluginEventMap[EventName]
  ): VConsolePluginInstance

  // 触发事件
  trigger<T = any> (eventName: keyof VConsolePluginEventMap, data: T): VConsolePluginInstance
}

export class VConsoleStatic extends VConsoleInstance {
  static VConsolePlugin: VConsolePluginInstance
}

export default VConsoleStatic
