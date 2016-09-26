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
vConsole.version // => "2.1.0"
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

##### 参数
- 无

##### 返回：
- 无

##### 例子：

```javascript
vConsole.show();
```


### vConsole.hide()

隐藏 vConsole 主面板。这个方法会触发插件事件 `hideConsole`。

##### 参数
- 无

##### 返回：
- 无

##### 例子：

```javascript
vConsole.hide();
```


[返回索引](./a_doc_index_CN.md)