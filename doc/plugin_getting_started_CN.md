插件：入门
==============================

通过插件，你可以：

- 添加一个新的 tab 面板
- 添加一个或多个 tool 按钮（位于面板底部）

在 tab 和 tool 按钮中，即可添加自定义功能，以满足个性化开发的需要。


## 快速上手

两行创建一个 vConsole 插件：

```javascript
var myPlugin = new VConsole.VConsolePlugin('my_plugin', 'My Plugin');
vc.addPlugin(myPlugin);
```

当然，上面的插件并无任何功能。请继续阅读[编写插件](./plugin_building_a_plugin_CN.md)来了解细节。


[返回索引](./a_doc_index_CN.md)