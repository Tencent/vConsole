English | [简体中文](./tutorial_CN.md)

Tutorial
==============================

## Installation

### 1. Download

Download the [latest release](https://github.com/WechatFE/vConsole/releases/latest) of vConsole.

Or, install via `npm` :

```
npm install vconsole
```

Then save `dist/vconsole.min.js` to your project.

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

### Print logs

Use the methods of `console` to print logs, just like what you do at desktop browsers:

```javascript
console.log('Hello World');
```

When vConsole is not loaded, logs will be printed to native console. After importing vConsole, logs will be printed to both front-end console and native console.


### Styles

5 types of log method are supported, with different styles:

```javascript
console.log('foo');   // black word, white bakcground
console.info('bar');  // purple word, white background
console.debug('oh');  // orange word, white background
console.warn('foo');  // orange word, yellow background
console.error('bar'); // red word, pink background
```


### Formatted object / array

Object or Array variable will be printed as formatted JSON:

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


### Polymorphic

Multiple arguments are supported, each variable will be divided by a space:

```javascript
var uid = 233;
console.log('UserID:', uid); // UserID: 233
```


### Special format

Use `[default|system|...]` string to print logs to specific tab:

```javascript
// [xxx] must be at the beginning of a log
console.log('[system]', 'foo');
console.log('[system] bar');
// foo & bar will be printed to system tab
```

Supported tabs:

```
[default] Log tab (default)
[system]  System tab
```


## Others

### Network

All `XMLHttpRequest` requests will be displayed in Network tab by default.

To prevent the display, add `_noVConsole = true` to XHR object:

```javascript
var xhr = new XMLHttpRequest();
xhr._noVConsole = true; // now this request would not be displayed in tab
xhr.open("GET", 'http://example.com/');
xhr.send();
```


[Goto: Documentation Index](./a_doc_index.md)