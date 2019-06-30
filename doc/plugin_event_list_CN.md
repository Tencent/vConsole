插件：Event 事件列表
==============================

插件的所有事件（event）都是可选的，不强制绑定。但一些特性（比如添加 tool 按钮）依赖于指定的事件，所以若要实现那些特性，就必须绑定指定的事件。

每个事件都会有一个 callback 回调函数，当事件被触发时，就会执行 callback。一些 callback 可能会带有参数。



## init

当插件开始初始化时触发。这个事件触发时，代表 vConsole 开始安装此插件，开发者可以在此时初始化一些配置。
这个事件只会触发一次。

注意，此时插件的 DOM 仍未就绪，插件还未被渲染到页面中。

##### Callback 参数：
- 无

##### 例子：
```javascript
myPlugin.on('init', function() {
	// 在这里可以初始化一些自用的配置
	this.list = []; // `this` == `myPlugin`
});
```


## renderTab

当 vConsole 尝试为此插件渲染新 tab 时触发。这个事件只会触发一次。

绑定此事件后，vConsole 会认为此插件需要创建新 tab，并会将 callback 中获取的 HTML 用于渲染 tab。因此，只要绑定了此事件，新 tab 肯定会被渲染到页面中，无论 callback 传入的 HTML 是否为空。如果不需要添加新 tab，请不要绑定此事件。

##### Callback 参数
- (必填) function(html): 回调函数，接收一个 HTML 参数用于渲染 tab。`html` 可以为 HTML 字符串，或者 `HTMLElement` 对象（或支持 `appendTo()` 方法的对象，如 jQuery 对象）。

##### 例子：

```javascript
myPlugin.on('renderTab', function(callback) {
	var html = '<div>Hello</div>';
	callback(html);
});
```


## addTopBar

当 vConsole 尝试为此插件添加新的 topbar 按钮时触发。这个事件只会触发一次。

#### Callback 参数：

- (必填) function(btnList): 回调函数，接收一个带有按钮配置信息的 `array` 数组。

按钮的参数为：

Property | | | |
------- | ------- | ------- | -------
name | string | 必填 | 按钮展示的名字。
data | object | 选填 | 按钮的 dataset，key-value 格式。
className | string | 选填 | 按钮的 className。
onClick | function | 必填 | 点击按钮时的回调函数。触发回调后，除非回调函数返回 `false`，此按钮将自动变为选中的样式。

##### 例子：

```javascript
var type;
myPlugin.on('addTopBar', function(callback) {
	var btnList = [];
	btnList.push({
		name: 'Apple',
		className: '',
		data: {type: 'apple'},
		onClick: function() {
			if (type != this.dataset.type) {
				// `this` 指向当前按钮
				type = this.dataset.type;
			} else {
				return false;
			}
		}
	});
	btnList.push({
		name: 'Orange',
		className: '',
		data: {type: 'orange'},
		onClick: function() {
			type = this.dataset.type;
		}
	}
	});
	callback(btnList);
});
```



## addTool

当 vConsole 尝试为此插件添加新的 tool 按钮时触发。这个事件只会触发一次。

##### Callback 参数：

- (必填) function(toolList): 回调函数，接收一个带有按钮配置信息的 `array` 数组。

tool 按钮的参数为：

Property | | | |
------- | ------- | ------- | -------
name | string | 必填 | 按钮展示的名字。
global | boolean | 选填，默认 `false` | `false` 时，当切换到别的 tab 后，按钮就会被隐藏；`true` 时，按钮变成全局可见。
onClick | function() | 必填 | 点击按钮时的回调函数。

##### 例子：

```javascript
myPlugin.on('addTool', function(callback) {
	var toolList = [];
	toolList.push({
		name: 'Reload',
		global: false,
		onClick: function(e) {
			location.reload();
		}
	});
	callback(toolList);
});
```


## ready

当插件初始化结束后触发。这个事件只会触发一次。此时插件已经成功安装并已渲染到页面。

##### Callback 参数：

- 无

##### 例子：

```javascript
myPlugin.on('ready', function() {
	// do something...
});
```


## remove

当插件即将卸载前触发。这个事件只会触发一次。

需要注意的是，如果在 vConsole ready 之前就卸载插件，那么此事件会在 `init` 之前就被调用。

##### Callback 参数：

- 无

##### 例子：

```javascript
myPlugin.on('remove', function() {
	// do something...
});
```


## show

当插件的 tab 被显示时触发。只有绑定了 `renderTab` 事件的插件才会收到此事件。

##### Callback 参数：

- 无

##### 例子：

```javascript
myPlugin.on('show', function() {
	// do something
});
```


## hide

当插件的 tab 被隐藏时触发。只有绑定了 `renderTab` 事件的插件才会收到此事件。

##### Callback 参数：

- 无

##### 例子：

```javascript
myPlugin.on('hide', function() {
	// do something
});
```


## showConsole

当 vConsole 被显示时触发。

##### Callback 参数：

- 无

##### 例子:

```javascript
myPlugin.on('showConsole', function() {
	// do something
});
```


## hideConsole

当 vConsole 被隐藏时触发。

##### Callback 参数：

- 无

##### 例子:

```javascript
myPlugin.on('hideConsole', function() {
	// do something
});
```


## updateOption

当 `vConsole.setOption()` 被调用时触发

##### Callback 参数：

- none

##### 例子:

```javascript
myPlugin.on('updateOption', function() {
	// do something
});
```


[返回索引](./a_doc_index_CN.md)