vConsole
==============================
[![npm version](https://badge.fury.io/js/vconsole.svg)](https://badge.fury.io/js/vconsole) 

一个针对手机网页的前端 console 调试面板。


## 简介

vConsole 是一个网页前端调试面板，专为手机 web 页面量身设计，帮助开发者更为便捷地进行开发调试工作。

## 手机预览

![](./example/snapshot/qrcode.png)

[http://wechatfe.github.io/vconsole/demo.html](http://wechatfe.github.io/vconsole/demo.html)

![](./example/snapshot/log_panel.png)

## 使用方法

### 1.下载模块

checkout 文件 `dist/vconsole.min.js` 到本地。

### 2.引入模块

(1) 如果未使用 AMD/CMD 规范，可直接在 HTML 中引入 vConsole 模块：

```html
<script src="path/to/vconsole.min.js"></script>
```

(2) 如果使用了 AMD/CMD 规范，可在 module 内使用 `require()` 引入模块：

```javascript
var vConsole = require('path/to/vconsole.min.js');
```

### 3.打印 log 日志

(1) 与 PC 端打印 log 一致，可直接使用 `console.log()` 等方法直接打印日志：

```javascript
console.log('Hello World');
```

未加载 vConsole 模块时，`console.log()` 会直接打印到原生控制台中；加载 vConsole 后，日志会打印到页面前端+原生控制台。

(2) 支持 4 种不同类型的日志，会以不同的颜色输出到前端面板：

```javascript
console.log('foo'); // 白底黑字
console.info('bar'); // 白底紫字
console.debug('oh'); // 白底黄字
console.warn('foo'); // 黄底黄字
console.error('bar'); // 红底红字
```

(3) 支持打印 Object 对象，会以 JSON 字符串格式输出：

```javascript
var obj = {};
obj.foo = 'bar';
console.log(obj); // 打印出 {foo: 'bar'}
```

(4) 支持传入多个参数，会以空格隔开：

```javascript
var uid = 233;
console.log('UserID:', uid); // 打印出 UserID: 233
```

(5) 引入模块后，vConsole 会有一段很小的延迟来用于初始化工作。此时若需打印日志，请使用 `vConsole.ready()` 方法：

```javascript
// 若未通过 AMD/CMD 方式加载模块，
// vConsole 会自动挂载在全局 window 对象中，即 window.vConsole
vConsole.ready(function() {
	console.log('Hello World');
});
```

## 注意事项

引入 vConsole 模块后，页面前端将会在右下角出现 vConsole 的悬停按钮，可展开/收起面板。

若不希望普通用户看到面板，请不要在生产环境中引入 vConsole 模块。动态引入模块的方法可参考 `example/demo2.php` 示例。

## License

The MIT License (http://opensource.org/licenses/MIT)