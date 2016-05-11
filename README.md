English | [简体中文](./README_CN.md)

vConsole
==============================
[![npm version](https://badge.fury.io/js/vconsole.svg)](https://badge.fury.io/js/vconsole) 

A front-end developer tool for mobile web page.


## Introduction

vConsole is a mobile front-end developer tool which can be very helpful for debug and development.


## Preview

![](./example/snapshot/qrcode.png)

[http://wechatfe.github.io/vconsole/demo.html](http://wechatfe.github.io/vconsole/demo.html)

![](./example/snapshot/log_panel.png)


## Installation

### 1. Download

Download file `dist/vconsole.min.js` to your project's directory.

Or, install via `npm` :

```
npm install vconsole
```

### 2. Import

(1) Under non-AMD/CMD rule, insert vConsole into `<head>`. To support further features, insert vConsole into `<head>` rather than `</body>` is a better choice.

```html
<head>
	<script src="path/to/vconsole.min.js"></script>
</head>
```

(2) Under AMD/CMD rule, use `require()` to import vConsole.

```javascript
var vConsole = require('path/to/vconsole.min.js');
```


## Usage

(1) Use the methods of `console` to print logs, just like what you do at desktop browsers:

```javascript
console.log('Hello World');
```

When vConsole is not loaded, logs will be printed to native console. After importing vConsole, logs will be printed to both front-end console and native console.


(2) 5 types of log method are supported, with different styles:

```javascript
console.log('foo');   // black word, white bakcground
console.info('bar');  // purple word, white background
console.debug('oh');  // orange word, white background
console.warn('foo');  // orange word, yellow background
console.error('bar'); // red word, pink background
```


(3) Object or Array variable will be printed as formatted JSON:

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


(4) Multiple arguments are supported, each variable will be divided by a space:

```javascript
var uid = 233;
console.log('UserID:', uid); // UserID: 233
```


(5) Use `[default|system|...]` string to print logs to specific panel:

```javascript
// [xxx] must be at the beginning of a log
console.log('[system]', 'foo');
console.log('[system] bar');
// foo & bar will be printed to system panel
```

Supported panels:

```
[default] Log panel (default)
[system]  System panel
[network] Network panel
```


## Notice

(1) After importing vConsole, a button, which can show/hide panel, will be displayed at the right bottom of the page.

Under production environment, DO NOT import vConsole to your page, unless you want to let your users help you to debug. Demo `example/demo2.php` shows how to import vConsole dynamicly.

(2) After v1.2.0, `vConsole.ready()` is deprecated. You can directly use `console.log()` after importing vConsole without waiting for its ready. This method will be removed at v2.0.0 and later.


## Changelog

[CHANGELOG.md](./CHANGELOG.md)


## License

The MIT License (http://opensource.org/licenses/MIT)
