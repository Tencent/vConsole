[English](./CHANGELOG.md) | 简体中文

#### v2.1.0 (2016-06-29)

- 【特性】新增 `vConsole.tool` 及 `vConsole.$` 辅助函数，请查阅[辅助函数](./doc/helper_functions_CN.md)。
- 【特性】公开部分 vConsole 的属性及方法，请查阅[公共属性及方法](./doc/public_properties_methods_CN.md)。
- 【修复】修复 `window.onerror()` 中 `error` 可能为空而导致堆栈读取错误的问题。
- 【修复】修复当 `xhr.readyState < 4` 时读取 `xhr.status` 可能导致错误的问题。


#### v2.0.1 (2016-06-16)

- 【修复】修复 vConsole 可能无法运行在 X5 内核浏览器的问题
- 【修复】修复某些设备不支持 `localStorage` 的问题
- 【修复】修复布尔值在 Log 面板展示不正确的问题
- 【优化】优化在 Android 设备下的 UI 表现


#### v2.0.0 (2016-06-05)

- 【特性】完全重构，支持自定义插件，请查阅[插件：入门](./doc/plugin_getting_started_CN.md)。
- 【特性】支持手动输入、执行命令行
- 【特性】支持打印循环引用的对象
- 【特性】支持在 Network 面板查看请求的 headers 和 response
- 【优化】开关按钮不会再被拖出屏幕外部
- 【优化】自动在 System 面板打印 User Agent
- 【优化】打印 log 时会显示时间
- 【修复】修复 getDate() 返回错误时间的问题
- 【修复】修复同步 AJAX 变异步 AJAX 的问题



# v1.x.x

#### v1.3.0 (2016-05-20)

- 【新增】支持拖拽右下角开关
- 【修复】修复异步加载导致初始化失败的问题

#### v1.2.1 (2016-05-16)

- 【修复】修复发送 POST 请求时丢失数据的问题


#### v1.2.0 (2016-05-11)

- 【新增】新增网络面板，可展示 AJAX 请求
- 【删减】废弃 `vConsole.ready()` 方法
- 【优化】支持 Object/Array 结构化展示，不再以 JSON 字符串输出
- 【优化】新增英文 README 及 CHANGELOG 文档
- 【优化】优化 UI 体验


#### v1.1.0 (2016-05-06)

- 【新增】支持 `window.onerror()` 的异常信息捕获
- 【新增】支持 `[default|system|...]` 日志格式，将 log 输出到指定面板


#### v1.0.5 (2016-04-29)

- 【修复】修复 webpack 编译失败的问题
- 【修复】修复打印 HTML 字符串可能导致的 XSS 问题


#### v1.0.4 (2016-04-28)

- 【修复】修复 `package.json` 的 main 路径
- 【优化】优化 example 的 demo 页面


#### v1.0.2 (2016-04-27)

- 初始发布