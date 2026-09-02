Public Properties & Methods
==============================

Some useful vConsole properties and methods are available for plugin development.

---
## Static Properties

---

### VConsole.instance

Get the current vConsole instance, which is a singleton instance. Returns `undefined` if it has not been instantiated.

---

### VConsole.VConsolePlugin

The prototype of custom plugin. See [Plugin: Getting Started](./plugin_getting_started.md) for details.

---

## Instance Properties

---

### vConsole.version

The current version of vConsole.

- Readonly
- Type: string

Example:

```javascript
vConsole.version // => "3.11.0"
```

---

### vConsole.option

A configuration object.

- Writable
- Type: `VConsoleOptions`

TypeScript users can import the type directly:

```typescript
import type { VConsoleOptions } from 'vconsole';
```

Available sub-types: `VConsoleLogOptions`, `VConsoleNetworkOptions`, `VConsoleStorageOptions`, `VConsoleAvailableStorage`, `VConsoleMCPOptions`.

Key                   | Type     | Optional | Default value                               | Description
--------------------- | -------- | -------- | ------------------------------------------- | -------------------
defaultPlugins        | Array(String) | true     | ['system', 'network', 'element', 'storage', 'mcp'] | Listed built-in plugins will be inited and loaded into vConsole.
pluginOrder           | Array(String) | true | [] | Plugin panels will be sorted as this list. Plugin not listed will be put last.
onReady               | Function | true     |                                             | Trigger after vConsole is inited and default plugins is loaded.
disableLogScrolling   | Boolean  | true     |                                             | If `false`, panel will not scroll to bottom while printing new logs.
theme                 | String   | true     | 'light'                                     | Theme mode, 'light' | 'dark'.
target                | String, HTMLElement | true | `document.documentElement`           | An HTMLElement or CSS selector string to render to.
log.maxLogNumber      | Number   | true     | 1000                                        | Overflow logs will be removed from log panels.
log.showTimestamps    | Boolean  | true     | false                                       | Display timestamps of logs.
network.maxNetworkNumber | Number | true    | 1000                                        | Overflow requests will be removed from Netowrk panel.
network.ignoreUrlRegExp | RegExp | true     |                                              | Skip the requests which url match the RegExp.
storage.defaultStorages  | Array  | true    | ['cookies', 'localStorage', 'sessionStorage'] | Listed storage(s) will be available in Storage panel.
mcp.endpoint           | String   | true     |                                             | WebSocket endpoint of a vConsole MCP server.
mcp.token              | String   | true     |                                             | Optional pairing token configured by the MCP server.
mcp.autoConnect        | Boolean  | true     | true                                        | Connect automatically after vConsole is ready when an endpoint is set.
mcp.reconnectInterval  | Number   | true     | 2000                                        | Delay in milliseconds before reconnecting.
mcp.allowJavaScriptExecution | Boolean | true | false                                       | Allow an MCP client to execute JavaScript in the page.

Example:

```javascript
// get
vConsole.option // => {...}
// set single key only
vConsole.setOption('log.maxLogNumber', 5000);
// overwrite 'log' object
vConsole.setOption({ log: { maxLogNumber: 5000 } });
```

---

## Methods

---

### vConsole.setOption(keyOrObj[, value])

Update `vConsole.option`.

##### Parameters:
- (required) keyOrObj: The key of option, or a key-value object.
- (optional) value: The value of an option.

##### Return:
- None

##### Example:

```javascript
vConsole.setOption('maxLogNumber', 5000);
// or:
vConsole.setOption({maxLogNumber: 5000});
```

---

### vConsole.setSwitchPosition(x, y)

Update the position of switch button.

##### Parameters:
- (required) x: X coordinate, the origin of the coordinate is at the bottom right corner of the screen.
- (required) y: Y coordinate, the origin of the coordinate is at the bottom right corner of the screen.

##### Return:
- None

##### Example:

```javascript
vConsole.setSwitchPosition(20, 20);
```

---

### vConsole.mcp

The built-in MCP panel lets users enter the computer host, port, and optional pairing token, then connect or disconnect from its toolbar. It remembers the settings and automatically reconnects after a connection is enabled.

The connection can also be configured programmatically:

```javascript
var vConsole = new VConsole({
  mcp: {
    endpoint: 'ws://192.168.1.100:8765',
    token: 'your-development-token',
    autoConnect: true,
    allowJavaScriptExecution: false,
  },
});

vConsole.mcp.connect('ws://192.168.1.100:8765');
vConsole.mcp.disconnect();
vConsole.mcp.state; // 'closed' | 'connecting' | 'open'
```

Console logs and Network records are always available as read-only requests. JavaScript execution is denied by default and can be enabled for the current page from the MCP panel or with `mcp.allowJavaScriptExecution: true`. Enabled scripts run with the page's full origin privileges, so use a pairing token and only enable execution on trusted development pages.

The connection uses the browser's original WebSocket implementation and is not included in the Network panel.

---

### vConsole.destroy()

Destroy an vConsole instance object and remove vConsole panel from document.

##### Parameters:
- None

##### Return:
- None

##### Example:

```javascript
var vConsole = new VConsole();
// ... do something
vConsole.destroy();
```

---

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

---

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

---

### vConsole.showPlugin(pluginID)

Activating a panel according to its plugin id.

Plugin event `hide` will be triggered for previous actived panel, and `show` for current actived panel.

##### Parameters:
- (required) pluginID: A string, panel's plugin id.

##### Return:
- None

##### Example:

```javascript
vConsole.showPlugin("system"); // show System panel
```

---

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

---

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

---

### vConsole.showSwitch()

Show vConsole switch button.

##### Parameters:
- None

##### Return:
- None

##### Example:

```javascript
vConsole.showSwitch();
```

---

### vConsole.hideSwitch()

Hide vConsole switch button. 

After the button is hidden, the user will not be able to call vConsole manually. The button or panel must be shown programmably via `vConsole.showSwitch()` or `vConsole.show()`.

##### Parameters:
- None

##### Return:
- None

##### Example:

```javascript
vConsole.hideSwitch();
```

---

[Back to Index](./a_doc_index.md)
