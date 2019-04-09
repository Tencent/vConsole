Plugin: Event List
==============================

All events are optional. But some features (like adding tool buttons) are depended on specific events.

Each event has a callback function, which will be called when event is triggered.

## init
Trigger before starting to initialize a plugin. You can configure plugin's properties in this event. This event will only be trigger once.
Note that plugin's DOM is not ready now.

##### Callback Arguments:
- none

##### Example:
```javascript
myPlugin.on('init', function() {
	// do something to init plugin
	this.list = []; // `this` == `myPlugin`
});
```


## renderTab
Trigger while vConsole trying to create a new tab for a plugin. This event will only be triggered once.
After binding this event, vConsole will get HTML from your callback to render a tab. A new tab will definitely be added if you bind this event, no matter what tab's HTML you set. Do not bind this event if you don't want to add a new tab.

##### Callback Arguments:
- (required) function(html): a callback function that receives the content HTML of the new tab. `html` can be a HTML `string` or an `HTMLElement` object (Or object which supports `appendTo()` method, like JQuery object).

##### Example:

```javascript
myPlugin.on('renderTab', function(callback) {
	var html = '<div>Hello</div>';
	callback(html);
});
```


## addTopBar
Trigger while vConsole trying to add new tab buttons which are under the tab bar. This event will only be triggered once.

#### Callback Arguments:

- (required) function(btnList): a callback function that receives an `array` of tab buttons.

A tab button is an object with properties:

Property | | | |
------- | ------- | ------- | -------
name | string | required | The display name of the button.
data | object | optional | The dataset of the button, key-value format.
className | string | optional | The className of the button.
onClick | function | required | A callback function when user click the button. The target button will automatically be added actived style after this callback unless it returns `false`.

##### Example:

```javascript
var type;
myPlugin.on('addTopBar', function(callback) {
	var btnList = [];
	btnList.push({
		name: 'Apple',
		className: '',
		data: {type: 'apple'},
		onClick: function() {
			if (type != this.dataset.type) {
				// `this` points to current button
				type = this.dataset.type;
			} else {
				return false;
			}
		}
	});
	btnList.push({
		name: 'Orange',
		className: '',
		data: {type: 'orange'},
		onClick: function() {
			type = this.dataset.type;
		}
	}
	});
	callback(btnList);
});
```


## addTool
Trigger while vConsole trying to add new tool buttons for a plugin. This event will only be triggered once.

##### Callback Arguments:

- (required) function(toolList): a callback function that receives an `array` of tool buttons.

A tool button is an object with properties:

Property | | | |
------- | ------- | ------- | -------
name | string | required | The display name of the button.
global | boolean | optional, default `false` | When `false`, the button will be hidden while switching to other tab. When `true`, the button will be available to all tabs.
onClick | function | required | A callback function when user click the button.

##### Example:

```javascript
myPlugin.on('addTool', function(callback) {
	var toolList = [];
	toolList.push({
		name: 'Reload',
		global: false,
		onClick: function(e) {
			location.reload();
		}
	});
	callback(toolList);
});
```


## ready

Trigger when all initialization is finished. This event will only be triggered once.
Now plugin is installed and it's DOM is ready.

##### Callback Arguments:

- none

##### Example:

```javascript
myPlugin.on('ready', function() {
	// do something...
});
```


## remove

Trigger before starting to uninitialize a plugin. This event will only be triggered once.

Note that this event may be called before `init` event if you remove a plugin before vConsole is ready.

##### Callback Arguments:

- none

##### Example:

```javascript
myPlugin.on('remove', function() {
	// do something...
});
```


## show

Trigger when a tab is shown. Only the plugin binded with `renderTab` will receive this event.

##### Callback Arguments:

- none

##### Example:

```javascript
myPlugin.on('show', function() {
	// do something
});
```


## hide

Trigger when a tab is hidden. Only the plugin binded with `renderTab` will receive this event.

##### Callback Arguments:

- none

##### Example:

```javascript
myPlugin.on('hide', function() {
	// do something
});
```


## showConsole

Trigger when vConsole is shown.

##### Callback Arguments:

- none

##### Example:

```javascript
myPlugin.on('showConsole', function() {
	// do something
});
```


## hideConsole

Trigger when vConsole is hidden.

##### Callback Arguments:

- none

##### Example:

```javascript
myPlugin.on('hideConsole', function() {
	// do something
});
```


## updateOption

Trigger when `vConsole.setOption()` is called.

##### Callback Arguments:

- none

##### Example:

```javascript
myPlugin.on('updateOption', function() {
	// do something
});
```


[Back to Index](./a_doc_index.md)