[English](./CHANGELOG.md) | 简体中文

#### 3.9.1 (2021-07-27)

- `Fix(Log)` 修正命令行输入框样式。 (PR #437 by @FredZeng)
- `Fix(Storage)` 修复由 `globalThis` 引起的报错。 (issue #438 #439)
- `Chore` 修复由 Svelte 引起的 `const` `let` 报错。 (PR #440 by @dellyoung)


#### 3.9.0 (2021-07-16)

- `Feat(Log)` 显示 audio 资源加载失败的报错。 (PR #419 by @zimv)
- `Feat(Storage)` 重写 Storage 面板，现支持添加/编辑/删除内容。 (PR #429 by @ManiaciaChao)
- `Feat(Plugin)` 新增第三方插件 [vite-plugin-vconsole](https://github.com/vadxq/vite-plugin-vconsole)。 (by @vadxq)
- `Refactor(Global)` 开始使用 Svelte 作为模板引擎。 (PR #429 by @ManiaciaChao)
- `Refactor(Core|Element)` 转换 core 文件及 Element 面板为 `.ts` 文件。
- `Fix(Log)` 修复打印无 `toJSON` 方法的对象（如 `Vue` 实例）时会报错的问题。 (PR #431 by @sillyhong)
- `Fix(Network)` 修复不以 `http` 开头的 url 会报错的问题。 (issue #420)
- `Fix(Network)` 修复使用 `Request` 作为 `Fetch` 参数时的报错。 (PR #428 by @tatsunoneko)
- `Fix(Network)` 当 `POST` 数据为一个 JSON 字符串时亦以 key-value 型键值表来显示数据。 (issue #425)
- `style` 修正 LESS 数学运算符。 (PR #426 by @ManiaciaChao)
- `Chore` 修复执行 `yarn serve` 的报错。 (issue #424)


#### 3.8.1 (2021-06-24)

- `Fix(Log)` 不再合并包含 object 或 array 的重复日志，以避免合并结构相同但取值不同的对象。
- `Fix(Log)` 修复日志过滤器（Filter）在点选日志类型 tab 后不生效的问题。
- `Fix(Network)` 修复 url 以 `//` 开头时产生的错误。 (PR #414 by @kooritea)
- `Chore` 移除 babel-loader 的 `exclude: node_modules` 选项以避免第三方库的兼容性问题。 (issue #404, #407)
- `Refactor(Log)` 转换 Log 和 System 面板为 `.ts` 文件。


#### 3.8.0 (2021-06-23)

- `Feat(Log)` 新增显示资源（image/video/link/script）加载失败报错。 (PR #411 by @zimv)
- `Chore` 新增 Webpack 配置 `target: ['web', 'es5']` 以避免兼容性问题。 (issue #404)
- `Fix(Network)` 修复 `new URL('x', undefined)` 第二参数为 `undefined` 时的报错。 (PR #409 by @moonkop)


#### 3.7.0 (2021-05-27)

- `Feat(Storage)` 对于大体积 value 先展示预览值，以避免堵塞渲染。 (issue #300)
- `Feat(Storage)` 新增复制按钮、删除按钮。
- `Feat(Global)` 当初始参数 `theme` 为空时，跟随系统默认主题色。
- `Refactpr(Storage)` 转换 Storage 面板为 `.ts` 文件。
- `Fix(Network)` 使用 `forEach` 而非 `.entries()` 来遍历 `headers` 以避免一些兼容性问题。 (issue #404)
- `Fix(Network)` 修复 `Content-Type` 为空时导致的报错。


#### 3.6.1 (2021-05-24)

- `Fix(Network)` 修复 "Invalid base URL" 错误。 (PR #402)


#### 3.6.0 (2021-05-21)

- `Feat(Log)` 新增输出 `unhandledrejection` 类型日志。 (PR #389 by @zimv)
- `Feat(Network)` 新增支持展示 `navigator.sendBeacon()` 的网络请求。 (PR #383 by @cola119)
- `Feat(Network)` 新增在 "General" 栏目展示 "Type" (Request Type) 字段，取值包括 `xhr|fetch|ping`。
- `Refactpr(Global)` 开始使用 TypeScript 重构代码。现在 Network 面板首先转成了 `.ts` 文件。
- `Fix(Network)` 修复移除 Network 面板后没有恢复原生 `window.fetch()` 方法的问题。
- `Fix(Storage)` 修复清除所有 cookie 时无法完全删除非顶级域名下的 cookie 的问题。 (issue #398)
- `Fix(Element)` 修复当 element 的 `attributes` 或 `characterData` 变化时 element 被嵌套渲染的问题。 (issue #399)


#### 3.5.2 (2021-05-13)

- `Chore` 升级到 Webpack5，并升级所有 NPM packages 到最新版本。
- `Fix(Global)` 修复因 `selection` 选区引起的点击事件无效问题。
- `Fix(Log)` 当日志数量达到 `maxLogNumber` 上限时清空对应的 `cachedLogs`。
- `Fix(Log)` 修复 XSS 漏洞。


#### 3.5.1 (2021-05-07)

- `Chore(Babel)` 修复由 `catch` 写法引起的 babel-loader 构建问题。 (PR #392 by @myl0204)
- `Fix(Network)` 修复语法笔误。 (PR #388 by @xovel)


#### 3.5.0 (2021-04-28)

- `Feature(Log)` 新增复制单行日志的能力。 (by @akai)
- `Feature(Plugin)` 新第三方插件 [vconsole-vue-devtools-plugin](https://github.com/Zippowxk/vue-vconsole-devtools)。 (by @Zippowxk)
- `Perf(System)` 将 "System" 字段改名为 "Client"，并新增 `MacOS` 系统版本号。
- `Fix(Log)` 使用自然排序来排序 object 和 array 的键值。 (issue #372)
- `Fix(Network)` 修复当 `contentType` 为 `text/html` 时潜在的 JSON 错误。 (by @zimv)
- `Fix(Network)` 修复 `disableLogScrolling` 参数在 Network 面板中不生效的问题。 (issue #282, #379)


#### V3.4.1 (2021-04-09)

- `Feature(Global)` 新增 `setSwitchPosition(x, y)` 方法以更新开关按钮的位置，见 [Public Properties & Methods](./doc/public_properties_methods_CN.md)。
- `Perf(Global)` 添加 `Symbol` polyfill。(issue #361)
- `Fix(Global)` 修复 `setOption()` 后主题样式未及时更新的问题。
- `Fix(Global)` 删除 `transitionEnd` 以避免一些兼容性问题。(issue #364)
- `Fix(Network)` 修复 `fetch` 的 `init` 未考虑为可选参数的问题。(issue #363, #365)
- `Fix(Network)` 修复 XSS 漏洞。


#### V3.4.0 (2021-01-14)

- `Feature(Global)` 支持暗黑模式，配置项 `vConsole.option.theme` 见 [Public Properties & Methods](./doc/public_properties_methods_CN.md)。(by @progrape)
- `Feature(Global)` 开关按钮加入拖拽安全区，避免遮挡全面屏手机底部操作区。(issue #353)
- `Feature(Log)` 指令输入框键入括号且自动补全括号后，光标将自动移动到括号内部。(issue #293)
- `Feature(System)` 增加显示 `Location` 信息。(issue #343)
- `Feature(Network)`支持 `fetch` 网络记录。(by @weiqian93)
- `Feature(Network)` 支持显示 Request Headers。
- `Feature(Network)` 仅显示简短网址，URL 参数将显示在详细信息中。(issue #291)
- `Feature(Plugin)` 新第三方插件 [vconsole-stats-plugin](https://github.com/smackgg/vConsole-Stats)。(by @smackgg)
- `Fix(Global)` 修复点击开关按钮后位置会被重置的问题。
- `Fix(Global)` 修复 `document.documentElement.offsetHeight|offsetWidth` 在新浏览器中不够准确的问题。(by @littlee)
- `Fix(Global)` 阻止用户事件派发到 readOnly 或 disabled 的 element 上。(by @norux)
- `Fix(Global)` 修复 nonce 查找不准确的问题。(by @sunderls)
- `Fix(Global)` 修复一个安全问题。(#345 by @QiAnXinCodeSafe)
- `Fix(Global)` 屏蔽 "webkitStorageInfo deprecation" 告警。
- `Perf(Global)` 删除 `Symbol`、`Array.from` polyfill。(issue #325, #275)
- `Perf(Global)` 日志中显示对象内所有的 enumerable 和 unenumerable 属性。 (issue #327)
- `Chore` 更新 Webpack DevServer 的配置项。(by @QinZhen001)


#### V3.3.4 (2019-08-19)

- `Feature(Log)` 增加 `%c` 以支持自定义日志样式，详情见 [使用教程](./doc/tutorial_CN.md)。
- `Feature(Plugin)` 增加 `VConsole.VConsoleLogPlugin` 等 `VConsole.VConsole*` 内置插件在 `VConsole` class 上的挂载。
- `Fix(Global)` 修复若干小问题。(#267 by @Molunerfinn, #272 by @domom)
- `Fix(Storage)` 修复当 cookie `path=/` 或设置了 `domain` 时删除失败的问题。(#264 by @qianxinfeng)
- `Perf(Global)` 在 `window DOMContentLoaded` 而不是 `window load` 时显示 vConsole。


#### V3.3.2 (2019-07-04)

- `Feature(Global)` 增加 TypeScript 声明文件。（by @jas0ncn）
- `Fix(Global)` 修复开关按钮拖动后位置不对的问题。（by @rexschuang）
- `Fix(Global)` 修复若干小问题。（by @stenders）
- `Fix(Log)` 不在列表底部时避免自动滚动。（by @ele828）


#### V3.3.0 (2019-02-02)

- `Feature(Log)` 新增自动合并相同日志的能力。频繁输出相同日志时不再会被刷屏。
- `Fix(Log)` 修复格式化日志（如 `console.log('[foo]', 'bar')`）无法显示到 Log 面板的问题。


#### V3.2.2 (2019-01-17)

- `Feature` 新增控制台输入提示。 (by @65147400)
- `Feature` 支持 SessionStorage。 (by @hkc452)
- `Fix` 修复 `JSON.stringify` 函数被错误地改写的问题。
- `Fix` 修复清空日志时没有重置 `logNumber` 的问题。 (by @liuyuekeng)
- `Fix` 修复 Network 面板中 HTML 标签未被 encode 的问题。 (by @mokang)
- `Fix` 修复 Storage 面板 decode 内容时可能会导致崩溃的问题。 (by @wolfsilver)
- `Fix` 修复 CSP 签名获取失败问题。 (by @scotthuang)
- `Perf` 增加底部安全区域，适配 iPhone X 等全面屏。 (by @dingyi1993)


#### V3.2.0 (2018-04-10)

- `Feature` 支持 `console.time()` 及 `console.timeEnd()`。
- `Feature` 新增 `disableLogScrolling` 配置项（`vConsole.option`），用于禁止新日志引起的自动滚动到底部。
- `Fix` 修复初始化后立即调用 `setOption` 引起的错误。
- `Fix` 修复 cookies 显示错误的问题。
- `Fix` 修复 "Uncaught InvalidStateError" 错误。 (by @fireyy)


#### V3.1.0 (2017-12-27)

- `Feature` 新增 `vConsole.showSwitch()` 及 `vConsole.hideSwitch()` 方法，请查阅[公共属性及方法](./doc/public_properties_methods_CN.md)。
- `Feature` 新增 `onReady` 及 `onClearLog` 回调方法，位于 `vConsole.option`。
- `Feature` 调用 `console.clear` 时将自动清除面板中的日志。
- `Fix` 修复 Windows 下构建引起的 `\r` 转义问题。
- `Fix` 修复 iOS8 或其它低版本系统中的 `Symbol` 错误。


#### V3.0.0 (2017-09-27)

基础：

- `Feature` 需要手动初始化 vConsole：`var vConsole = new VConsole(option)`。
- `Feature` 新增 `vConsole.option` 配置项，配置项可在实例化时传入，也可通过 `vConsole.setOption(key, value)` 更新。
- `Feature` 支持自定义按需加载内置插件，配置项为 `option` 里的 `defaultPlugins` 字段。
- `Perf` 支持 CSP 规则 `unsafe-eval` 和 `unsafe-inline`。
- `Perf` 优化 `initial-scale < 1` 时的 `font-size`。

Log 插件：

- `Feature` 支持 `maxLogNumber` 配置项，以控制面板内展示的最多日志数量。
- `Fix` 修复打印大型复杂 object 时引起的崩溃问题。
- `Perf` 只有 `console.log('[system]', xxx)` 这种将 `[system]` 放在第一位参数的写法，才会输出到 System 面板。因此可以规避 `[foo] bar` 这类格式无法正确打印到 Log 面板的问题。

Network 插件：

- `Feature` 新增 `Query String Parameters` 和 `Form Data` 两栏，以展示 GET 和 POST 的参数。
- `Perf` 自动格式化展示 JSON 类型的回包。
- `Fix` 修复 status 一直为 "Pending" 的问题。这种问题一般是引入了第三方的 HTTP 库而引起的。


插件模块：

- `Feature` 在 `init` 事件触发时/之后，插件实例内可以通过 `this.vConsole` 来获取到 vConsole 的对象实例。
- `Feature` 新增 `updateOption` 事件，以监测 `vConsole.option` 的更新。
- `Feature` 新增 Element 面板作为默认的内置插件。
- `Feature` 新增 Storage 面板作为默认的内置插件。



## V2.x.x

#### V2.5.2 (2016-12-27)

- `Fix` 捕获执行自定义命令行时发生的错误。


#### V2.5.1 (2016-10-18)

- `Fix` 修复一些情况下的 `scrollHeight` 错误。
- `Fix` 修正 iOS 8 下的 flex 布局问题。
- `Perf` 性能增强。


#### V2.5.0 (2016-09-28)

- `Feature` 新增 `vConsole.removePlugin()` 方法，请查阅[公共属性及方法](./doc/public_properties_methods_CN.md)。
- `Feature` 新增 `remove` 插件事件，请查阅[插件：Event 事件列表](./doc/plugin_event_list_CN.md)。
- `Perf` 页面不会随着 vConsole 的滚动而滚动。
- `Fix` 修正 `window.onerror()` 内的函数调用笔误。


#### V2.4.0 (2016-08-31)

- `Feature` 新增 `addTopBar` 插件事件，请查阅[插件：Event 事件列表](./doc/plugin_event_list_CN.md)。
- `Feature` 新增日志类型筛选功能。
- `Perf` 若 log 列表不处于最底部，当打印新 log 时，列表则不会自动滚动到最新 log 处。
- `Perf` 优化了一些 UI 样式问题。
- `Fix` 修正打印 object 类型 log 时的 XSS 问题。
- `Fix` 在某些特殊情况中，开关按钮将不会再被定位出页面外。


#### V2.3.1 (2016-08-16)

- `Fix` 删除 V2.3.0 中的 `tap` 事件，恢复为 `click` 事件（依旧支持快速响应），以避免冲突。
- `Perf` 删除 System tab 中的 `now` 项目并新增 `navigationStart` 时间戳。


#### V2.3.0 (2016-08-15)

- `Feature` 支持逐级展开 Object 或 Array 的子元素。
- `Feature` 支持显示 Object 内的不可枚举属性。
- `Perf` 支持在 vConsole 的 DOM 容器内使用 `tap` 事件以代替 `click` 事件。


#### V2.2.1 (2016-08-08)

- `Feature` 在 System 面板中添加完整的 performance timing 测速点。
- `Perf` 在 README 中新增第三方插件列表。


#### V2.2.0 (2016-07-13)

- `Feature` 新增 `vConsole.version` 属性，以获取当前版本号。
- `Feature` 新增 `XMLHttpRequest` 的 `xhr._noVConsole` 属性，以控制一个网络请求是否显示在 Network tab 中。


#### v2.1.0 (2016-06-29)

- `Feature` 新增 `vConsole.tool` 及 `vConsole.$` 辅助函数，请查阅[辅助函数](./doc/helper_functions_CN.md)。
- `Feature` 公开部分 vConsole 的属性及方法，请查阅[公共属性及方法](./doc/public_properties_methods_CN.md)。
- `Fix` 修复 `window.onerror()` 中 `error` 可能为空而导致堆栈读取错误的问题。
- `Fix` 修复当 `xhr.readyState < 4` 时读取 `xhr.status` 可能导致错误的问题。


#### v2.0.1 (2016-06-16)

- `Fix` 修复 vConsole 可能无法运行在 X5 内核浏览器的问题。
- `Fix` 修复某些设备不支持 `localStorage` 的问题。
- `Fix` 修复布尔值在 Log 面板展示不正确的问题。
- `Perf` 优化在 Android 设备下的 UI 表现。


#### v2.0.0 (2016-06-05)

- `Feature` 完全重构，支持自定义插件，请查阅[插件：入门](./doc/plugin_getting_started_CN.md)。
- `Feature` 支持手动输入、执行命令行。
- `Feature` 支持打印循环引用的对象。
- `Feature` 支持在 Network 面板查看请求的 headers 和 response。
- `Perf` 开关按钮不会再被拖出屏幕外部。
- `Perf` 自动在 System 面板打印 User Agent。
- `Perf` 打印 log 时会显示时间。
- `Fix` 修复 getDate() 返回错误时间的问题。
- `Fix` 修复同步 AJAX 变异步 AJAX 的问题。



# v1.x.x

#### v1.3.0 (2016-05-20)

- `Feature` 支持拖拽右下角开关。
- `Fix` 修复异步加载导致初始化失败的问题。

#### v1.2.1 (2016-05-16)

- `Fix` 修复发送 POST 请求时丢失数据的问题。


#### v1.2.0 (2016-05-11)

- `Feature` 新增网络面板，可展示 AJAX 请求。
- `Feature` 废弃 `vConsole.ready()` 方法。
- `Perf` 支持 Object/Array 结构化展示，不再以 JSON 字符串输出。
- `Perf` 新增英文 README 及 CHANGELOG 文档。
- `Perf` 优化 UI 体验。


#### v1.1.0 (2016-05-06)

- `Feature` 支持 `window.onerror()` 的异常信息捕获。
- `Feature` 支持 `[default|system|...]` 日志格式，将 log 输出到指定面板。


#### v1.0.5 (2016-04-29)

- `Fix` 修复 webpack 编译失败的问题。
- `Fix` 修复打印 HTML 字符串可能导致的 XSS 问题。


#### v1.0.4 (2016-04-28)

- `Fix` 修复 `package.json` 的 main 路径。
- `Perf` 优化 example 的 demo 页面。


#### v1.0.2 (2016-04-27)

- 初始发布。