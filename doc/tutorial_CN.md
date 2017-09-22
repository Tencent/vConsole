[English](./tutorial.md) | 简体中文

使用教程
==============================

## 安装

### 1.下载模块

下载 vConsole 的[最新版本](https://github.com/WechatFE/vConsole/releases/latest)。

或者使用 `npm` 安装：

```
npm install vconsole
```

然后复制 `dist/vconsole.min.js` 到自己的项目中。

### 2.引入模块

(1) 如果未使用 AMD/CMD 规范，可直接在 HTML 中引入 vConsole 模块。为了便于后续扩展，建议在 `<head>` 中引入：

```html
<head>
  <script src="path/to/vconsole.min.js"></script>
  <script>
    var vConsole = new VConsole();
  </script>
</head>
```

(2) 如果使用了 AMD/CMD 规范，可在 module 内使用 `require()` 引入模块：

```javascript
var VConsole = require('path/to/vconsole.min.js');
var vConsole = new VConsole();
```

请注意，`VConsole` 只是 vConsole 的原型，而非一个已实例化的对象。所以在手动 `new` 实例化之前，vConsole 不会被插入到网页中。


## 使用方法

### 初始化 & 配置

引入后, 需要手动初始化 vConsole：

```javascript
var vConsole = new VConsole(option);
```

`option` 是一个选填的 object 对象，具体配置定义请参阅 [公共属性及方法](./public_properties_methods_CN.md)。

使用 `setOption()` 来更新 `option`：

```javascript
vConsole.setOption('maxLogNumber', 5000);
// 或者：
vConsole.setOption({maxLogNumber: 5000});


### 打印日志

与 PC 端打印 log 一致，可直接使用 `console.log()` 等方法直接打印日志：

```javascript
console.log('Hello World');
```

未加载 vConsole 模块时，`console.log()` 会直接打印到原生控制台中；加载 vConsole 后，日志会打印到页面前端+原生控制台。


### 日志类型

支持 5 种不同类型的日志，会以不同的颜色输出到前端面板：

```javascript
console.log('foo');   // 白底黑字
console.info('bar');  // 白底紫字
console.debug('oh');  // 白底黄字
console.warn('foo');  // 黄底黄字
console.error('bar'); // 红底红字
```


### Object/Array 结构化展示

支持打印 Object 或 Array 变量，会以结构化 JSON 形式输出（并折叠）：

```javascript
var obj = {};
obj.foo = 'bar';
console.log(obj);
/*
Object
{
  foo: "bar"
}
*/
```

### 多态

支持传入多个参数，会以空格隔开：

```javascript
var uid = 233;
console.log('UserID:', uid); // 打印出 UserID: 233
```

### 特殊格式

支持使用 `[system]` 作为第一个参数，来将 log 输出到 System 面板：

```javascript
console.log('[system]', 'foo'); // 'foo' 会输出到 System 面板
console.log('[system] bar'); // 这行日志会输出到 Log 面板而非 System 面板
```


## 内置插件

### Network 网络

所有 `XMLHttpRequest` 请求都会被显示到 Network tab 中。

若不希望一个请求显示在面板中，可添加属性 `_noVConsole = true` 到 XHR 对象中：

```javascript
var xhr = new XMLHttpRequest();
xhr._noVConsole = true; // 不会显示到 tab 中
xhr.open("GET", 'http://example.com/');
xhr.send();
```


[前往：文档索引](./a_doc_index_CN.md)