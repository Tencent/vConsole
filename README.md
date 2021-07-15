English | [简体中文](./README_CN.md)

vConsole
==============================
[![npm version](https://badge.fury.io/js/vconsole.svg)](https://badge.fury.io/js/vconsole)

A lightweight, extendable front-end developer tool for mobile web page.


## Features

- View console logs
- View network requests
- View document elements
- View Cookies, LocalStorage and SessionStorage
- Execute JS command manually
- Custom plugin


## Usage

Method 1: Using npm (Recommanded)

```bash
$ npm install vconsole
```

```javascript
import VConsole from 'vconsole';

const vConsole = new VConsole();
// or init with options
const vConsole = new VConsole({ maxLogNumber: 1000 });

// call `console` methods as usual
console.log('Hello world');

// remove it when you finish debugging
vConsole.destroy();
```

Method 2: Using unpkg CDN in HTML:

```html
<script src="https://unpkg.com/vconsole/dist/vconsole.min.js"></script>
<script>
  // VConsole will be exported to `window.VConsole` by default.
  var vConsole = new window.VConsole();
</script>
```

See [Tutorial](./doc/tutorial.md) for more usage details.


## Preview

![](./example/snapshot/qrcode.png)

[http://wechatfe.github.io/vconsole/demo.html](http://wechatfe.github.io/vconsole/demo.html)

![](./example/snapshot/panel_log.jpg) ![](./example/snapshot/panel_network.jpg) ![](./example/snapshot/panel_element.jpg) ![](./example/snapshot/panel_storage.jpg)


## Documentation

vConsole:

 - [Tutorial](./doc/tutorial.md)
 - [Public Properties & Methods](./doc/public_properties_methods.md)
 - [Helper Functions](./doc/helper_functions.md)

Plugin:

 - [Plugin: Getting Started](./doc/plugin_getting_started.md)
 - [Plugin: Building a Plugin](./doc/plugin_building_a_plugin.md)
 - [Plugin: Event List](./doc/plugin_event_list.md)


## Third-party Plugins

 - [vConsole-sources](https://github.com/WechatFE/vConsole-sources)
 - [vconsole-webpack-plugin](https://github.com/diamont1001/vconsole-webpack-plugin)
 - [vconsole-stats-plugin](https://github.com/smackgg/vConsole-Stats)
 - [vconsole-vue-devtools-plugin](https://github.com/Zippowxk/vue-vconsole-devtools)
 - [vconsole-outputlog-plugin](https://github.com/sunlanda/vconsole-outputlog-plugin)
 - [vite-plugin-vconsole](https://github.com/vadxq/vite-plugin-vconsole)

## Changelog

[CHANGELOG.md](./CHANGELOG.md)


## Feedback

QQ Group: 497430533

![](./example/snapshot/qq_group.png)


## License

[The MIT License](./LICENSE)
