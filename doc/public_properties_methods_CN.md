公共属性及方法
==============================

vConsole 提供一些公共属性字段、函数方法，以便开发插件。

## 属性


### vConsole.version

当前 vConsole 的版本号。

- 只读
- 类型：string

例子：

```javascript
vConsole.version // => "3.1.0"
```


### vConsole.option

配置项。

- 可写
- 类型：object

键名                  | 类型      | 可选     | 默认值                                       | 描述
--------------------- | -------- | -------- | ------------------------------------------- | -------------------
defaultPlugins        | Array    | true     | ['system', 'network', 'element', 'storage'] | 需要自动初始化并加载的内置插件。 
onReady               | Function | true     |                                             | 回调方法，当 vConsole 完成初始化并加载完内置插件后触发。
onClearLog            | Function | true     |                                             | 回调方法，点击 Log 或 System 面板的 "Clear" 按钮后出发。
maxLogNumber          | Number   | true     | 1000                                        | 超出上限的日志会被自动清除。
disableLogScrolling   | Boolean  | true     |                                             | 若为 `false`，有新日志时面板将不会自动滚动到底部。

例子：

```javascript
// get
vConsole.option // => {...}
// set
vConsole.setOption('maxLogNumber', 5000);
// 或者：
vConsole.setOption({maxLogNumber: 5000});
```


### vConsole.activedTab

当前激活的 tab 的 plugin id。

- 只读
- 类型：string
- 默认值："default"

例子：

```javascript
vConsole.activedTab // => "system"
```


### vConsole.tabList

已安装的 tab 的 plugin id 列表。

- 只读
- 类型：array(string)

例子：

```javascript
vConsole.tabList // => ["default", "system"]
```


### vConsole.$dom

vConsole 的 HTML element。

- 类型：HTMLDivElement



## 方法


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


### vConsole.showTab(pluginID)

根据 plugin id 激活显示一个 tab。

此方法会触发先前激活态 tab 的 `hide` 事件，并触发当前激活态 tab 的 `show` 事件。

##### 参数：
- (required) pluginID: 字符串，tab 的 plugin id。

##### 返回：
- 无

##### 例子：

```javascript
vConsole.showTab("system"); // 显示 System tab
```


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


[返回索引](./a_doc_index_CN.md)