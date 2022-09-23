English | [简体中文](./tutorial_CN.md)

Tutorial
===

## Getting Started


#### Install using npm (Recommanded)

```bash
$ npm install vconsole
```

```javascript
import VConsole from 'vconsole';

const vConsole = new VConsole();
// or init with options
const vConsole = new VConsole({ theme: 'dark' });

// call `console` methods as usual
console.log('Hello world');

// remove it when you finish debugging
vConsole.destroy();
```

> Notice that `VConsole` is the prototype of vConsole.  
> So vConsole panel will not be inserted into your page until you `new` it manually.

Otherwise, you can use CDN to import vConsole:

```html
<script src="https://unpkg.com/vconsole@latest/dist/vconsole.min.js"></script>
<script>
  // VConsole will be exported to `window.VConsole` by default.
  var vConsole = new window.VConsole();
</script>
```

Available CDN:

- https://unpkg.com/vconsole@latest/dist/vconsole.min.js
- https://cdn.jsdelivr.net/npm/vconsole@latest/dist/vconsole.min.js

---

## Usage

### Initialization & Configuaration

After imported, vConsole should be inited manually:

```javascript
var vConsole = new VConsole(option);
```

`option` is an optional object.

See [Public Properties & Methods](./public_properties_methods.md) for definition.

Use `setOption()` to update `option`:

```javascript
// set single key only
vConsole.setOption('log.maxLogNumber', 5000);
// overwrite 'log' object
vConsole.setOption({ log: { maxLogNumber: 5000 } });
```

---


### Output logs

Use the methods of `console` to print logs, just like what you do at desktop browsers:

```javascript
console.log('Hello World');
```

When vConsole is not loaded, logs will be printed to browser console. After importing vConsole, logs will be printed to both vConsole panel and browser console.

If you want to print logs to vConsole panel only, try [Log plugin methods](./plugin_properties_methods.md):

```javascript
vConsole.log.log('Hello world');
```

---

### Log methods

5 types of log methods are supported, with different styles:

```javascript
console.log('foo');   // black word, white bakcground
console.info('bar');  // purple word, white background
console.debug('oh');  // orange word, white background
console.warn('foo');  // orange word, yellow background
console.error('bar'); // red word, pink background
```

---

### Other methods

Supported `console` methods:

```javascript
console.clear();        // Clear all logs
console.time('foo');    // start a timer named "foo"
console.timeEnd('foo'); // stop "foo" timer and print the elapsed time
```

---


### Styling log output

Use `%c` to add style to logs:

```javascript
console.log('%c blue %c red', 'color:blue', 'color:red'); // blue red
console.log('%c FOO', 'font-weight:bold', 'bar'); // FOO bar
console.log('%c Foo %c bar', 'color:red'); // Foo %c bar
```

> Note that only the first parameter support `%c` format, and the `%c` must be followed by a space. The following parameter(s) will be used as HTML style to fill `%c`, and the remain `%c` or parameters will be shown as normal string.

---

### Using string substitutions

Use `%s, %d, %o` to output a log with formatting. The pattern must be followed by a space.

- `%s`: Output as a string. Non-string objects will be converted into strings.
- `%d`: Output as a number.
- `%o`: Output as an object. You can clickthe object name to open more information about it.

```javascript
console.log('Hi %s, Im %s', 'Foo', 'Bar'); // Hi Foo, Im Bar
console.log('I had %d cakes', 3); // I had 3 cakes
console.log('The %o is large', obj); // The [[obj]] is large
```

---

### Special format

Use `[system]` as the first parameter to output logs to System panel:

```javascript
console.log('[system]', 'foo'); // 'foo' will be printed to System panel
console.log('[system] bar'); // this log will show in Log tab instead of System panel
```

---

## Built-in Plugins

### Network

All `XMLHttpRequest | fetch | sendBeacon` requests will be logged in Network panel by default.

To prevent logging, add `_noVConsole = true` to XHR object:

```javascript
var xhr = new XMLHttpRequest();
xhr._noVConsole = true; // now this request would not be logged in panel
xhr.open('GET', 'http://example.com/');
xhr.send();
```

If you want to print custom request logs, try [Network plugin methods](./plugin_properties_methods.md):

```javascript
vConsole.network.add(...);
```


[Goto: Documentation Index](./a_doc_index.md)