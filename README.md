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

Download the [latest release](https://github.com/Tencent/vConsole/releases/latest). (DO NOT copy `dist/vconsole.min.js` in the `dev` branch)

Or, install via npm:

```
npm install vconsole
```

Import `dist/vconsole.min.js` to your project:

```html
<script src="path/to/vconsole.min.js"></script>
<script>
  // init vConsole
  var vConsole = new VConsole();
  console.log('Hello world');
</script>
```

For TypeScript users:

```javascript
import 'path/to/vconsole.min.d.ts';
```

See [Tutorial](./doc/tutorial.md) for more details.


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

## Changelog

[CHANGELOG.md](./CHANGELOG.md)


## Feedback

QQ Group: 497430533

![](./example/snapshot/qq_group.png)


## License

[The MIT License](./LICENSE)
