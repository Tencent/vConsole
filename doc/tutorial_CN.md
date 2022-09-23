[English](./tutorial.md) | 简体中文

使用教程
===

## 上手

#### 使用 NPM 安装（推荐）

```bash
$ npm install vconsole
```

```javascript
import VConsole from 'vconsole';

const vConsole = new VConsole();
// 或者使用配置参数进行初始化
const vConsole = new VConsole({ theme: 'dark' });

// 调用 console 方法输出日志
console.log('Hello world');

// 完成调试后，可销毁 vConsole
vConsole.destroy();
```

> 请注意，`VConsole` 只是 vConsole 的原型，而非一个已实例化的对象。  
> 所以在手动 `new` 实例化之前，vConsole 不会被插入到网页中。

或者，你可以用 CDN 来引入 vConsole：

```html
<script src="https://unpkg.com/vconsole@latest/dist/vconsole.min.js"></script>
<script>
  // VConsole 会自动挂载到 `window.VConsole`
  var vConsole = new window.VConsole();
</script>
```

可用的 CDN：

- https://unpkg.com/vconsole@latest/dist/vconsole.min.js
- https://cdn.jsdelivr.net/npm/vconsole@latest/dist/vconsole.min.js


---

## 使用方法

### 初始化 & 配置

引入后, 需要手动初始化 vConsole：

```javascript
var vConsole = new VConsole(option);
```

`option` 是一个选填的 object 对象，具体配置定义请参阅 [公共属性及方法](./public_properties_methods_CN.md)。

使用 `setOption()` 来更新 `option`：

```javascript
// 设指定键值：
vConsole.setOption('log.maxLogNumber', 5000);
// 覆盖整个对象：
vConsole.setOption({ log: { maxLogNumber: 5000 } });
```

---

### 打印日志

与 PC 端打印 log 一致，可直接使用 `console.log()` 等方法直接打印日志：

```javascript
console.log('Hello World');
```

未加载 vConsole 模块时，`console.log()` 会直接打印到原生控制台中；加载 vConsole 后，日志会打印到页面前端+原生控制台。

如果你希望日志仅输出到 vConsole 中，可使用[插件方法](./plugin_properties_methods_CN.md)：

```javascript
vConsole.log.log('Hello world');
```

---

### 日志类型

支持 5 种不同类型的日志，会以不同的颜色输出到前端面板：

```javascript
console.log('foo');   // 白底黑字
console.info('bar');  // 白底紫字
console.debug('oh');  // 白底黄字
console.warn('foo');  // 黄底黄字
console.error('bar'); // 红底红字
```

---

### 其他方法

支持以下 `console` 方法：

```javascript
console.clear();        // 清空所有日志
console.time('foo');    // 启动名为 foo 的计时器
console.timeEnd('foo'); // 停止 foo 计时器并输出经过的时间
```

---

### 样式

可使用 `%c` 来添加样式：

```javascript
console.log('%c blue %c red', 'color:blue', 'color:red'); // blue red
console.log('%c FOO', 'font-weight:bold', 'bar'); // FOO bar
console.log('%c Foo %c bar', 'color:red'); // Foo %c bar
```

> 只有第一个参数支持 `%c` 格式，且 `%c` 后必须带空格。一旦出现 `%c` 格式，后续的字符串参数将作为 HTML style 样式来替换 `%c`；未被替换的 `%c`、剩余的参数，将作为默认日志照常输出。


---


### 使用字符串替换

可使用 `%s, %d, %o` 来格式化输出，关键字后必须带空格。

- `%s`：输出为字符串。非字符串对象会被转换成字符串。
- `%d`：输出为数字。
- `%o`：输出为对象。可以点击展开对象详情。

```javascript
console.log('Hi %s, Im %s', 'Foo', 'Bar'); // Hi Foo, Im Bar
console.log('I had %d cakes', 3); // I had 3 cakes
console.log('The %o is large', obj); // The [[obj]] is large
```

---

### 特殊格式

支持使用 `[system]` 作为第一个参数，来将 log 输出到 System 面板：

```javascript
console.log('[system]', 'foo'); // 'foo' 会输出到 System 面板
console.log('[system] bar'); // 这行日志会输出到 Log 面板而非 System 面板
```

若编写自定义 log 面板插件，亦可通过上述格式将 log 输出到自定义面板：

```javascript
console.log('[myplugin]', 'bar'); // 'myplugin' 为自定义面板插件的 id
```

---

## 内置插件

### Network 网络请求

所有 `XMLHttpRequest | fetch | sendBeacon` 请求都会被显示到 Network 面板中。

若不希望一个请求显示在面板中，可添加属性 `_noVConsole = true` 到 XHR 对象中：

```javascript
var xhr = new XMLHttpRequest();
xhr._noVConsole = true; // 不会显示到 tab 中
xhr.open('GET', 'http://example.com/');
xhr.send();
```

如果你想展示自定义的 request 请求，可尝试 [Network 插件方法](./plugin_properties_methods_CN.md)：

```javascript
vConsole.network.add(...);
```


[前往：文档索引](./a_doc_index_CN.md)
