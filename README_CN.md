[English](./README.md) | 简体中文

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


## 安装

### 1.下载模块

下载文件 `dist/vconsole.min.js` 到本地。

或者使用 `npm` 安装：

```
npm install vconsole
```

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

(1) 与 PC 端打印 log 一致，可直接使用 `console.log()` 等方法直接打印日志：

```javascript
console.log('Hello World');
```

未加载 vConsole 模块时，`console.log()` 会直接打印到原生控制台中；加载 vConsole 后，日志会打印到页面前端+原生控制台。

(2) 支持 5 种不同类型的日志，会以不同的颜色输出到前端面板：

```javascript
console.log('foo');   // 白底黑字
console.info('bar');  // 白底紫字
console.debug('oh');  // 白底黄字
console.warn('foo');  // 黄底黄字
console.error('bar'); // 红底红字
```

(3) 支持打印 Object 或 Array 变量，会以结构化 JSON 形式输出（并折叠）：

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

(4) 支持传入多个参数，会以空格隔开：

```javascript
var uid = 233;
console.log('UserID:', uid); // 打印出 UserID: 233
```

(5) 支持使用 `[default|system|...]` 的格式将 log 输出到指定面板：

```javascript
// [xxx] 须写在 log 的最开始
console.log('[system]', 'foo');
console.log('[system] bar');
// 系统面板将打印出两行，分别为 foo 和 bar
```

目前支持的面板有：

```
[default] Log 日志（默认）
[system]  System 系统
[network] Network 网络
```


## 注意事项

(1) 引入 vConsole 模块后，页面前端将会在右下角出现 vConsole 的悬停按钮，可展开/收起面板。

若不希望普通用户看到面板，请不要在生产环境中引入 vConsole 模块。动态引入模块的方法可参考 `example/demo2.php` 示例。

(2) 从 v1.2.0 开始，弃用 `vConsole.ready()` 接口。引入 vConsole 后，无须等待即可立即使用 `console.log()` 等方法输出日志。


## 更新记录

[CHANGELOG_CN.md](./CHANGELOG_CN.md)


## License

The MIT License (http://opensource.org/licenses/MIT)
