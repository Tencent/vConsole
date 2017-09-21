Plugin: Getting Started
==============================

A plugin allows you to:

- add a new tab
- add one or more tool button(s)

You can customize the functions of the tab and buttons.


## Quick Start

Two lines to create a vConsole plugin:

```javascript
var myPlugin = new VConsole.VConsolePlugin('my_plugin', 'My Plugin');
vc.addPlugin(myPlugin);
```

The above plugin has no function. See [Building a Plugin](./plugin_building_a_plugin.md) for more details.


[Back to Index](./a_doc_index.md)