Plugin: Building a Plugin
==============================

3 steps to build a plugin:

- create an vConsole plugin object
- bind plugin events to this object
- add this object to vConsole


## 1. Create plugin object

Make sure you have imported vConsole, then simply `new` an instance of class `VConsolePlugin`:

```javascript
VConsole.VConsolePlugin(id, name)
```

- `id` (required) is an unique string.
- `name` (optional) is a string used for tab's display name.



Example:

```javascript
var myPlugin = new VConsole.VConsolePlugin('my_plugin', 'My Plugin');
```


## 2. Bind plugin events

While installing and running a plugin, vConsole will trigger some events to allow a plugin customizing it's functions.

use `.on()` to bind an event:

```javascript
on(eventName, callback)
```

- `eventName` (required) is a string.
- `callback` (required) is a callback function when an event is triggered.



Example:

```javascript
myPlugin.on('init', function() {
	console.log('My plugin init');
});
```

See [Event List](./plugin_event_list.md) to learn more about each event.



In this tutorial, we'd like to build a plugin with a tab and a tool button.

To add a tab, use `renderTab` event:

```javascript
myPlugin.on('renderTab', function(callback) {
	var html = '<div>Click the tool button below!</div>';
	callback(html);
});
```

`renderTab` will be triggered while a plugin is being initialized. We simply pass a HTML string to `callback`, then this HTML will be rendered as the content of a new tab, which name is `name`.

To add a tool button, use `addTool` event:

```javascript
myPlugin.on('addTool', function(callback) {
	var button = {
		name: 'Reload',
		onClick: function(event) {
			location.reload();
		}
	};
	callback([button]);
});
```

Again, `addTool` will be triggered during initialized, after `renderTab`. It's `callback` receives an `array` of tool button list. We make a button which can reload the current page.


## 3. Add to vConsole

The final step is add your new plugin to vConsole:

```javascript
vConsole.addPlugin(pluginObject)
```

`pluginObject` (required) is an `VConsolePlugin` object.

Example:

```javascript
vConsole.addPlugin(myPlugin);
```

Make sure you have finish binding all necessary events to your plugin before adding to vConsole. Some events (related to initialization) would not be trigger for second time after adding.


[Back to Index](./a_doc_index.md)