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
</head>
```

(2) 如果使用了 AMD/CMD 规范，可在 module 内使用 `require()` 引入模块：

```javascript
var vConsole = require('path/to/vconsole.min.js');
```


## 使用方法


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

支持使用 `[default|system|...]` 的格式将 log 输出到指定 tab 面板：

```javascript
// [xxx] 须写在 log 的最开始
console.log('[system]', 'foo');
console.log('[system] bar');
// System 面板将打印出两行，分别为 foo 和 bar
```

目前支持的 tab 面板有：

```
[default] Log 日志（默认）
[system]  System 系统
```


## 其他

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