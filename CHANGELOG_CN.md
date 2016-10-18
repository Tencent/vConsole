[English](./CHANGELOG.md) | 简体中文

#### V2.5.1 (2016-10-18)

- 【修复】修复一些情况下的 `scrollHeight` 错误。
- 【修复】修正 iOS 8 下的 flex 布局问题。
- 【优化】性能增强。


#### V2.5.0 (2016-09-28)

- 【特性】新增 `vConsole.removePlugin()` 方法，请查阅[Public Properties & Methods](./doc/public_properties_methods_CN.md)。
- 【特性】新增 `remove` 插件事件，请查阅[插件：Event 事件列表](./doc/plugin_event_list_CN.md)。
- 【优化】页面不会随着 vConsole 的滚动而滚动。
- 【修复】修正 `window.onerror()` 内的函数调用笔误。


#### V2.4.0 (2016-08-31)

- 【特性】新增 `addTopBar` 插件事件，请查阅[插件：Event 事件列表](./doc/plugin_event_list_CN.md)。
- 【特性】新增日志类型筛选功能。
- 【优化】若 log 列表不处于最底部，当打印新 log 时，列表则不会自动滚动到最新 log 处。
- 【优化】优化了一些 UI 样式问题。
- 【修复】修正打印 object 类型 log 时的 XSS 问题。
- 【修复】在某些特殊情况中，开关按钮将不会再被定位出页面外。


#### V2.3.1 (2016-08-16)

- 【修复】删除 V2.3.0 中的 `tap` 事件，恢复为 `click` 事件（依旧支持快速响应），以避免冲突。
- 【优化】删除 System tab 中的 `now` 项目并新增 `navigationStart` 时间戳。


#### V2.3.0 (2016-08-15)

- 【特性】支持逐级展开 Object 或 Array 的子元素。
- 【特性】支持显示 Object 内的不可枚举属性。
- 【优化】支持在 vConsole 的 DOM 容器内使用 `tap` 事件以代替 `click` 事件。


#### V2.2.1 (2016-08-08)

- 【特性】在 System 面板中添加完整的 performance timing 测速点。
- 【新增】在 README 中新增第三方插件列表。


#### V2.2.0 (2016-07-13)

- 【特性】新增 `vConsole.version` 属性，以获取当前版本号。
- 【特性】新增 `XMLHttpRequest` 的 `xhr._noVConsole` 属性，以控制一个网络请求是否显示在 Network tab 中。


#### v2.1.0 (2016-06-29)

- 【特性】新增 `vConsole.tool` 及 `vConsole.$` 辅助函数，请查阅[辅助函数](./doc/helper_functions_CN.md)。
- 【特性】公开部分 vConsole 的属性及方法，请查阅[公共属性及方法](./doc/public_properties_methods_CN.md)。
- 【修复】修复 `window.onerror()` 中 `error` 可能为空而导致堆栈读取错误的问题。
- 【修复】修复当 `xhr.readyState < 4` 时读取 `xhr.status` 可能导致错误的问题。


#### v2.0.1 (2016-06-16)

- 【修复】修复 vConsole 可能无法运行在 X5 内核浏览器的问题。
- 【修复】修复某些设备不支持 `localStorage` 的问题。
- 【修复】修复布尔值在 Log 面板展示不正确的问题。
- 【优化】优化在 Android 设备下的 UI 表现。


#### v2.0.0 (2016-06-05)

- 【特性】完全重构，支持自定义插件，请查阅[插件：入门](./doc/plugin_getting_started_CN.md)。
- 【特性】支持手动输入、执行命令行。
- 【特性】支持打印循环引用的对象。
- 【特性】支持在 Network 面板查看请求的 headers 和 response。
- 【优化】开关按钮不会再被拖出屏幕外部。
- 【优化】自动在 System 面板打印 User Agent。
- 【优化】打印 log 时会显示时间。
- 【修复】修复 getDate() 返回错误时间的问题。
- 【修复】修复同步 AJAX 变异步 AJAX 的问题。



# v1.x.x

#### v1.3.0 (2016-05-20)

- 【新增】支持拖拽右下角开关。
- 【修复】修复异步加载导致初始化失败的问题。

#### v1.2.1 (2016-05-16)

- 【修复】修复发送 POST 请求时丢失数据的问题。


#### v1.2.0 (2016-05-11)

- 【新增】新增网络面板，可展示 AJAX 请求。
- 【删减】废弃 `vConsole.ready()` 方法。
- 【优化】支持 Object/Array 结构化展示，不再以 JSON 字符串输出。
- 【优化】新增英文 README 及 CHANGELOG 文档。
- 【优化】优化 UI 体验。


#### v1.1.0 (2016-05-06)

- 【新增】支持 `window.onerror()` 的异常信息捕获。
- 【新增】支持 `[default|system|...]` 日志格式，将 log 输出到指定面板。


#### v1.0.5 (2016-04-29)

- 【修复】修复 webpack 编译失败的问题。
- 【修复】修复打印 HTML 字符串可能导致的 XSS 问题。


#### v1.0.4 (2016-04-28)

- 【修复】修复 `package.json` 的 main 路径。
- 【优化】优化 example 的 demo 页面。


#### v1.0.2 (2016-04-27)

- 初始发布。