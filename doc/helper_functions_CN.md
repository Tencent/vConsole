辅助函数
==============================

vConsole 提供一些辅助函数以便开发插件。

辅助函数会按照类型，挂载到 vConsole 的不同属性中：

- `vConsole.tool`：辅助函数。
- `vConsole.$`：DOM 操作相关函数。


## vConsole.tool

### vConsole.tool.isString(value)
### vConsole.tool.isArray(value)
### vConsole.tool.isBoolean(value)
### vConsole.tool.isElement(value)
### vConsole.tool.isFunction(value)
### vConsole.tool.isNull(value)
### vConsole.tool.isNumber(value)
### vConsole.tool.isObject(value)
### vConsole.tool.isSymbol(value)
### vConsole.tool.isUndefined(value)

判断变量是否为指定的类型。

##### 返回：
- Boolean



### vConsole.tool.htmlEncode(text)

将文本转为 HTML 安全的字符串。

##### 参数：
- (required) text: 字符串。

##### 返回：
- String



### vConsole.tool.setStorage(key, value)

将数据写入 `localStorage`。前缀 `vConsole_` 会自动加到 `key` 之前。

在一些设备中，`localStorage` 可能不存在，因此 `value` 将无法正常存储。所以不要使用此方法来保存持久性数据。

##### 参数：
- (required) key: 字符串，数据的键名。
- (required) value: 字符串，数据的键值。

##### 返回：
- 无

##### 例子：

```javascript
vConsole.tool.setStorage('count', 1);
```



### vConsole.tool.getStorage(key)

获取 `localStorage` 的数据。前缀 `vConsole_` 会自动加到 `key` 之前。

##### 参数：
- (required) key: A string, the name of data.

##### 返回：
- String

##### 例子：

```javascript
var num = vConsole.tool.setStorage('count'); // => 1
```



## vConsole.$

### vConsole.$.one(selectors, baseElement)

获取在 `document` 或 `baseElement` 中匹配 `selectors` 的首个 element 元素。

##### 参数：
- (required) selectors: CSS 选择器字符串，多个选择器以空格隔开。
- (optional) baseElement: Element 对象，默认为 `document`.

##### 返回：
- Element object

##### 例子：

```javascript
var $page = vConsole.$.one('#my_page');
var $item = vConsole.$.one('.item', $page);
```


### vConsole.$.all(selectors, baseElement)

获取在 `document` 或 `baseElement` 中匹配 `selectors` 的所有 element 元素。

##### 参数：
- (required) selectors: CSS 选择器字符串，多个选择器以空格隔开。
- (optional) baseElement: Element 对象，默认为 `document`.

##### 返回：
- Element object

##### 例子：

```javascript
var $page = vConsole.$.one('#my_page');
var $items = vConsole.$.all('.item', $page);
```


### vConsole.$.addClass(elements, className)

为一个或一组 element 添加 class 样式名。

##### 参数：
- (required) elements: 单个或一个数组的 element 对象。
- (required) className: 字符串，多个样式名以空格隔开。

##### 返回：
- 无

##### 例子：

```javascript
var $items = vConsole.$.all('.item');
vConsole.$.addClass($items, 'selected');
```


### vConsole.$.removeClass(elements, className)

为一个或一组 element 删除 class 样式名。

##### 参数：
- (required) elements: 单个或一个数组的 element 对象。
- (required) className: 字符串，多个样式名以空格隔开。

##### 返回：
- 无

##### 例子：

```javascript
var $items = vConsole.$.all('.item');
vConsole.$.removeClass($items, 'selected');
```


### vConsole.$.hasClass(element, className)

判断一个 element 对象是否有指定的样式名。

##### 参数：
- (required) element: Element 对象。
- (required) className: 字符串。

##### 返回：
- Boolean

##### 例子：

```javascript
var $page = vConsole.$.one('#my_page');
if (vConsole.$.hasClass($page, 'actived')) {
	// do something
}
```


### vConsole.$.bind(elements, eventType, fn, useCapture)

绑定一个事件到一个或一组 element。

##### 参数：
- (required) elements: 单个或一个数组的 element 对象。
- (required) eventType: 字符串，事件类型。
- (required) fn: 事件回调函数。
- (optional) useCapture: 布尔值，用于设定是使用 capturing 还是 bubbling。默认为 `false`.

##### 返回：
- 无

##### 例子：

```javascript
var $btn = vConsole.$.one('#submit');
vConsole.$.bind($btn, 'click', function(event) {
	event.preventDefault();
	alert('submit!');
});
```


### vConsole.$.delegate(element, eventType, selectors, fn)

绑定一个事件到一个 element 中，只有匹配 selecors 的子元素才会触发事件。

##### 参数：
- (required) element: Element 对象。
- (required) eventType: 字符串，事件类型。
- (required) selectors: CSS 选择器字符串，多个选择器以空格隔开。
- (required) fn: 事件回调函数。

##### 返回：
- 无

##### 例子：

```javascript
var $page = vConsole.$.one('#my_page');
vConsole.$.delegate($page, 'click', '.item', function(event) {
	vConsole.$.addClass(this, 'selected'); // this => '.item'
});
```


### vConsole.$.render(tpl, data, toString)

Compile a template into an element object or a HTML string with given data.
使用指定数据将模板文本编译成 element 对象或者 HTML 字符串。

##### 参数：
- (required) tpl: 模板字符串。
- (required) data: 一组 key-value 形式的数据源。
- (optional) toString: 布尔值，用于设定返回值为 element 对象还是 HTML 字符串，默认为 `false`。

##### 返回：
- Element 对象或者 HTML 字符串

##### 模板语法：

If:
```html
{{if}}
	...
{{else}}
	...
{{/if}}
```

For:
```html
{{for (var i=0; i<10; i++)}}
	...
	{{continue}}
	{{break}}
{{/for}}
```

Switch:
```html
{{switch (flag)}}
	{{case 1}}
		...
		{{break}}
	{{default}}
		...
{{/switch}}
```

Print:
```html
{{flag}}
```

###### 例子：

```javascript
var tpl = '<ul>' +
	'{{for (var i = 0; i < list.length; i++)}}' +
		'<li>' + '{{list[i]}}' + '</li>' +
	'{{/for}}' +
'</ul>';
var data = {
	list: ['Red', 'Blue', 'Yellow']	
};

var html = vConsole.$.render(tpl, data, true);
document.body.innerHTML += html;
```

输出：

```html
<ul>
<li>Red</li>
<li>Blue</li>
<li>Yellow</li>
</ul>
```


[返回索引](./a_doc_index_CN.md)