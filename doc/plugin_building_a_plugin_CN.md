插件：编写插件
==============================

3 步即可编写一个 vConsole 插件：

- 实例化 vConsole 插件
- 绑定事件到插件
- 将插件添加到 vConsole


## 1. 实例化插件

插件原型挂载在 `VConsole.VConsolePlugin` 中：

```javascript
VConsole.VConsolePlugin(id, name)
```

- `id` (必填) 字符串，插件的 id，必须保证唯一，不能与其他插件冲突。
- `name` (选填) 字符串，展示为 tab 面板的名字。

所以这一步只需将插件 `new` 出来即可：

```javascript
var myPlugin = new VConsole.VConsolePlugin('my_plugin', 'My Plugin');
```



## 2. 绑定插件事件

在初始化插件、后续运行时，vConsole 会对插件触发一些事件（event）。插件须通过这些事件来完成自定义功能。

使用 `.on()` 方法来绑定一个事件：

```javascript
on(eventName, callback)
```

- `eventName` (必填) 字符串，事件的名字。
- `callback` (必填) 回调函数，事件被触发时执行。



例子：

```javascript
myPlugin.on('init', function() {
	console.log('My plugin init');
});
```

关于每个事件的具体功效，请查阅[Event 事件列表](./plugin_event_list_CN.md)。



在本教程中，我们准备编写一个既有 tab 面板，又有 tool 按钮（位于面板底部）的插件。

添加新 tab 面板，需要绑定 `renderTab` 事件：

```javascript
myPlugin.on('renderTab', function(callback) {
	var html = '<div>Click the tool button below!</div>';
	callback(html);
});
```

插件初始化过程中，就会触发 `renderTab` 事件。在这里我们简单地回传了一个 HTML 字符串给 `callback`，然后这段 HTML 就会被选染成新 tab 面板的主体部分。这个新 tab 的名字就是刚才实例化时的 `name`。

此外，若不绑定 `renderTab`，那么 vConsole 就不会添加新 tab。



接下来要添加一个底部的 tool 按钮，需要绑定 `addTool` 事件：

```javascript
myPlugin.on('addTool', function(callback) {
	var button = {
		name: 'Reload',
		onClick: function(event) {
			location.reload();
		}
	};
	callback([button]);
});
```

同样地，`addTool` 会在插件初始化过程中触发，且在 `renderTab` 之后。回调函数 `callback` 的参数接收一个 `array` 数组，数组元素是用于配置按钮的 `object` 对象。本例中，点击这个按钮会重新加载当前网页。



## 3. 添加到 vConsole

最后一步，就是将写好的插件添加到 vConsole 中：

```javascript
vConsole.addPlugin(pluginObject)
```

`pluginObject` (必填) 必须为 `VConsolePlugin` 实例化的对象。

例子：

```javascript
vConsole.addPlugin(myPlugin);
```

在添加到 vConsole 之前，请确保已经绑定完所有需要用到的事件。一些初始化相关的事件只会在插件被添加时触发一次，并不会在其他时机被触发。


[返回索引](./a_doc_index_CN.md)