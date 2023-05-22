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
- 类型：object

键名                  | 类型      | 可选     | 默认值                                       | 描述
--------------------- | -------- | -------- | ------------------------------------------- | -------------------
defaultPlugins        | Array(String) | true     | ['system', 'network', 'element', 'storage'] | 需要自动初始化并加载的内置插件。 
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