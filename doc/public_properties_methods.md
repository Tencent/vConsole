Public Properties & Methods
==============================

Some useful vConsole properties and methods are available for plugin development.

## Properties


### vConsole.version

The current version of vConsole.

- Readonly
- Type: string

Example:

```javascript
vConsole.version // => "2.1.0"
```


### vConsole.activedTab

The actived tab's plugin id.

- Readonly
- Type: string
- Default: "default"

Example:

```javascript
vConsole.activedTab // => "system"
```


### vConsole.tabList

A list of installed tabs' plugin id.

- Readonly
- Type: array(string)

Example:

```javascript
vConsole.tabList // => ["default", "system"]
```


### vConsole.$dom

vConsole's HTML element.

- Type: HTMLDivElement



## Methods


### vConsole.addPlugin(plugin)

Add a new plugin to vConsole. Duplicate plugin will be ignored.

##### Parameters:
- (required) plugin: An VConsolePlugin object.

##### Return:
- Boolean: `true` for success, `false` for failure.

##### Example:

```javascript
var myPlugin = new VConsolePlugin('my_plugin', 'My Plugin');
vConsole.addPlugin(myPlugin);
```


### vConsole.removePlugin(pluginID)

Remove an existing plugin.

##### Parameters:
- (required) pluginID: A string, plugin's id.

##### Return:
- Boolean: `true` for success, `false` for failure.

##### Example:

```javascript
vConsole.removePlugin('my_plugin');
```


### vConsole.showTab(pluginID)

Activating a tab according to its plugin id.

Plugin event `hide` will be triggered for previous actived tab, and `show` for current actived tab.

##### Parameters:
- (required) pluginID: A string, tab's plugin id.

##### Return:
- None

##### Example:

```javascript
vConsole.showTab("system"); // show System tab
```


### vConsole.show()

Show vConsole panel. This method will trigger plugin event `showConsole`.

##### Parameters:
- None

##### Return:
- None

##### Example:

```javascript
vConsole.show();
```


### vConsole.hide()

Hide vConsole panel. This method will trigger plugin event `hideConsole`.

##### Parameters:
- None

##### Return:
- None

##### Example:

```javascript
vConsole.hide();
```


[Back to Index](./a_doc_index.md)