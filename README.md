English | [简体中文](./README_CN.md)

vConsole
==============================
[![npm version](https://badge.fury.io/js/vconsole.svg)](https://badge.fury.io/js/vconsole) 

A lightweight, extendable front-end developer tool for mobile web page.


## Features

- View console logs
- View network requests
- Execute JS command manually
- Custom plugin


## Usage

Download the [latest release](https://github.com/WechatFE/vConsole/releases/latest). (DO NOT copy `dist/vconsole.min.js` in the dev branch)

Or, install via npm:

```
npm install vconsole
```

Import `dist/vconsole.min.js` to your project:

```html
<script src="path/to/vconsole.min.js"></script>
<script>
console.log('Hello world');
// then tap vConsole button to see the log
</script>
```

See [Tutorial](./doc/tutorial.md) for more details.


## Preview

![](./example/snapshot/qrcode.png)

[http://wechatfe.github.io/vconsole/demo.html](http://wechatfe.github.io/vconsole/demo.html)

![](./example/snapshot/log_panel.png)


## Documentation

vConsole:

 - [Tutorial](./doc/tutorial.md)
 - [Public Properties & Methods](./doc/public_properties_methods.md)
 - [Helper Functions](./doc/helper_functions.md)

Plugin:

 - [Plugin: Getting Started](./doc/plugin_getting_started.md)
 - [Plugin: Building a Plugin](./doc/plugin_building_a_plugin.md)
 - [Plugin: Event List](./doc/plugin_event_list.md)


## Plugins

 - [vConsole-resources](https://github.com/WechatFE/vConsole-resources)
 - [vConsole-sources](https://github.com/WechatFE/vConsole-sources)
 - [vConsole-elements](https://github.com/WechatFE/vConsole-elements)


## Changelog

[CHANGELOG.md](./CHANGELOG.md)


## License

The MIT License (http://opensource.org/licenses/MIT)
