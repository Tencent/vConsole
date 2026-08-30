公共属性及方法
==============================

vConsole 提供一些公共属性字段、函数方法，以便开发插件。

## 静态属性

---

### VConsole.instance

获取当前已实例化后的 vConsole 对象，是一个单例对象。如果没有实例化过，将返回 `undefined`。

---

### VConsole.VConsolePlugin

自定义插件的原型对象。具体用法见 [插件：入门](./plugin_getting_started_CN.md)。

---

## 实例属性

---

### vConsole.version

当前 vConsole 的版本号。

- 只读
- 类型：string

例子：

```javascript
vConsole.version // => "3.11.0"
```

---

### vConsole.option

配置项。

- 可写
- 类型：`VConsoleOptions`

TypeScript 用户可直接导入类型：

```typescript
import type { VConsoleOptions } from 'vconsole';
```

相关子类型：`VConsoleLogOptions`、`VConsoleNetworkOptions`、`VConsoleStorageOptions`、`VConsoleAvailableStorage`、`VConsoleMCPOptions`。

键名                  | 类型      | 可选     | 默认值                                       | 描述
--------------------- | -------- | -------- | ------------------------------------------- | -------------------
defaultPlugins        | Array(String) | true     | ['system', 'network', 'element', 'storage', 'mcp'] | 需要自动初始化并加载的内置插件。
pluginOrder           | Array(String) | true | [] | 插件面板会按此列表进行排序，未列出的插件将排在最后。
onReady               | Function | true     |                                             | 回调方法，当 vConsole 完成初始化并加载完内置插件后触发。
disableLogScrolling   | Boolean  | true     |                                             | 若为 `false`，有新日志时面板将不会自动滚动到底部。
theme                 | String   | true     | 'light'                                     | 主题颜色，可选值为 'light' | 'dark'。
target                | String, HTMLElement | true | `document.documentElement`           | 挂载到的节点，可为 HTMLElement 或 CSS selector。
log.maxLogNumber      | Number   | true     | 1000                                        | 超出数量上限的日志会被自动清除。
log.showTimestamps    | Boolean  | true     | false                                       | 显示日志的输出时间
log.maxNetworkNumber  | Number   | true     | 1000                                        | 超出数量上限的请求记录会被自动清除。
network.ignoreUrlRegExp | RegExp | true     |                                             | 不展示 URL 匹配正则表达式的请求。
storage.defaultStorages  | Array  | true    | ['cookies', 'localStorage', 'sessionStorage'] | 在 Storage 面板中要加载的 storage 类型。
mcp.endpoint           | String   | true     |                                             | vConsole MCP 服务的 WebSocket 地址。
mcp.token              | String   | true     |                                             | MCP 服务配置的可选配对 Token。
mcp.autoConnect        | Boolean  | true     | true                                        | 配置 endpoint 后，在 vConsole 就绪时自动连接。
mcp.reconnectInterval  | Number   | true     | 2000                                        | 断线重连的等待时间，单位为毫秒。
mcp.allowJavaScriptExecution | Boolean | true | false                                       | 是否允许 MCP 客户端在页面中执行 JavaScript。

例子：

```javascript
// 获取：
vConsole.option // => {...}
// 设指定键值：
vConsole.setOption('log.maxLogNumber', 5000);
// 覆盖整个对象：
vConsole.setOption({ log: { maxLogNumber: 5000 } });
```


---

## 方法

---

### vConsole.setOption(keyOrObj[, value])

更新 `vConsole.option` 配置项。

##### 参数：
- (required) keyOrObj: 配置项的 key 值，或直接传入 key-value 格式的 object 对象。
- (optional) value: 配置项的 value 值。

##### 返回：
- 无

##### 例子：

```javascript
vConsole.setOption('maxLogNumber', 5000);
// 或者：
vConsole.setOption({maxLogNumber: 5000});
```

---

### vConsole.setSwitchPosition(x, y)

设置开关按钮的位置。

##### 参数：
- (required) x: X 坐标，坐标原点位于屏幕右下角。
- (required) y: Y 坐标，坐标原点位于屏幕右下角。

##### 返回：
- 无

##### 例子：

```javascript
vConsole.setSwitchPosition(20, 20);
```

---

### vConsole.mcp

内置的 MCP 面板支持用户填写电脑 Host、端口和可选配对 Token，并通过工具栏连接或断开。面板会记住设置，在启用连接后自动重连。

也可以通过代码配置连接：

```javascript
var vConsole = new VConsole({
  mcp: {
    endpoint: 'ws://192.168.1.100:8765',
    token: 'your-development-token',
    autoConnect: true,
    allowJavaScriptExecution: false,
  },
});

vConsole.mcp.connect('ws://192.168.1.100:8765');
vConsole.mcp.disconnect();
vConsole.mcp.state; // 'closed' | 'connecting' | 'open'
```

Console 日志和 Network 记录始终以只读请求提供。JavaScript 执行默认拒绝，可在当前页面的 MCP 面板中开启，或配置 `mcp.allowJavaScriptExecution: true`。启用后的脚本具有当前页面同源环境的完整权限，因此请配置配对 Token，并只在可信开发页面中开启。

MCP 连接使用浏览器原始的 WebSocket 实现，因此不会出现在 Network 面板中。

---

### vConsole.destroy()

析构一个 vConsole 对象实例，并将 vConsole 面板从页面中移除。

##### 参数：
- 无

##### 返回：
- 无

##### 例子：

```javascript
var vConsole = new VConsole();
// ... do something
vConsole.destroy();
```

---

### vConsole.addPlugin(plugin)

添加一个新插件。重名的插件会被忽略。

##### 参数：
- (required) plugin: 一个 VConsolePlugin 对象。

##### 返回：
- Boolean: 成功为 `true`，失败为 `false`。

##### 例子：

```javascript
var myPlugin = new VConsolePlugin('my_plugin', 'My Plugin');
vConsole.addPlugin(myPlugin);
```

---

### vConsole.removePlugin(pluginID)

卸载一个插件。

##### 参数：
- (required) pluginID: 插件的 plugin id。

##### 返回：
- Boolean: 成功为 `true`，失败为 `false`。

##### 例子：

```javascript
vConsole.removePlugin('my_plugin');
```

---

### vConsole.showPlugin(pluginID)

根据 plugin id 激活显示一个面板。

此方法会触发先前激活态面板的 `hide` 事件，并触发当前激活态面板的 `show` 事件。

##### 参数：
- (required) pluginID: 字符串，面板的 plugin id。

##### 返回：
- 无

##### 例子：

```javascript
vConsole.showPlugin("system"); // 显示 System 面板
```

---

### vConsole.show()

显示 vConsole 主面板。这个方法会触发插件事件 `showConsole`。

##### 参数：
- 无

##### 返回：
- 无

##### 例子：

```javascript
vConsole.show();
```

---

### vConsole.hide()

隐藏 vConsole 主面板。这个方法会触发插件事件 `hideConsole`。

##### 参数：
- 无

##### 返回：
- 无

##### 例子：

```javascript
vConsole.hide();
```

---

### vConsole.showSwitch()

显示 vConsole 的开关按钮。

##### 参数：
- 无

##### 返回：
- 无

##### 例子：

```javascript
vConsole.showSwitch();
```

---

### vConsole.hideSwitch()

隐藏 vConsole 的开关按钮

隐藏后，用户将无法手动唤起 vConsole 面板。因此按钮或面板必须通过 `vConsole.showSwitch()` 或 `vConsole.show()` 来展示出来。

##### 参数：
- 无

##### 返回：
- 无

##### 例子：

```javascript
vConsole.hideSwitch();
```

---

[返回索引](./a_doc_index_CN.md)
