Buitin Plugin: Properties & Methods
==============================

Some built-in plugins will export some public methods for special needs, E.g: 

```javascript
vConsole.log.info()
```

If a plugin is not added, its instance and methods will be `undefined`, E.g:

```javascript
vConsole = new VConsole({ defaultPlugins: ['system'] }); // network plugin is not added
vConsole.network.clear(); // Error: network is undefined
```

---


## Log Panel

---

### vConsole.log.log()

The same as `console.log()` series method. All available methods:

```javascript
vConsole.log.log(...)
vConsole.log.info(...)
vConsole.log.debug(...)
vConsole.log.warn(...)
vConsole.log.error(...)
```

By calling this method, logs will only be output to vConsole Log panel instead of browser console.


---


### vConsole.log.clear()

Remove all logs of Log panel. Similar to `console.clear()`.

#### Parameters

None.

#### Return value

`void`


---


## System Panel

---

### vConsole.system.log() | info() | debug() | warn() | error()

The same as `vConsole.log.log()`, but the logs will be output to System panel.

---

### vConsole.system.clear()

Remove all logs of System panel.

#### Parameters

None.

#### Return value

`void`


---


## Network Panel

---

### vConsole.network.add()

Add a custom request to Network panel.

```javascript
vConsole.network.add(item: VConsoleNetworkRequestItem): VConsoleNetworkRequestItemProxy
```

#### Parameters

- `item: VConsoleNetworkRequestItem`: The custom request object.

```javascript
interface VConsoleNetworkRequestItem {
  // HTTP method
  method: '' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';
  // Full URL, E.g: https://www.abc.com/foo?a=b
  url: string;
  // HTTP status code, E.g: 200
  status: number | string;
  // XMLHttpRequest.readyState
  readyState?: XMLHttpRequest['readyState'];
  // Response header, key-value pairs
  header: { [key: string]: string };
  // XMLHttpRequest.responseType
  responseType?: XMLHttpRequest['responseType'];
  // 'xhr': XMLHttpRequest, 'custom': custom request
  requestType: 'xhr' | 'fetch' | 'ping' | 'custom';
  // Correspond `XMLHttpRequest.setRequestHeader()` or fetch's headers
  requestHeader?: HeadersInit;
  // The body of response
  response: any;
  // Timestamp
  startTime: number;
  // Timestamp
  endTime: number;
  // Query string parameters, key-value pairs or JSON string
  getData?: { [key: string]: string } | null;
  // Request payload, key-value pairs or JSON string
  postData?: { [key: string]: string } | string | null;
}
```


#### Return value

`VConsoleNetworkRequestItemProxy`

Once a custom request is added, a new object pointing to this request will be returned.

The properties of the return object is extended by `VConsoleNetworkRequestItem`.

```javascript
interface VConsoleNetworkRequestItemProxy extends VConsoleNetworkRequestItem {
  // The internal id of the request
  id: string;
  // If possible, response will be parsed to JSON string, otherwise original value
  response: string | any;
  // endTime - startTime
  costTime?: number;
}
```

---


### vConsole.network.update()

Update a custom request.

```javascript
vConsole.network.update(id: string, item: VConsoleNetworkRequestItem | VConsoleNetworkRequestItemProxy)
```

#### Parameters

- `id: string`: The internal id of the custom request. Can get it in the return value of `vConsole.network.add()`.
- `item: VConsoleNetworkRequestItem | VConsoleNetworkRequestItemProxy`: The custom request object.


#### Return value

`void`


**Notice:**

Modify the properties of `VConsoleNetworkRequestItemProxy.response` will not work.  
If you want to update `response`, you must re-assign the entire object.

```javascript
const item = vConsole.network.add({
  response: { foo: 'bar' },
  ... // other request properties
});

item.response.foo = 'newbar'; // will not work, response will not be changed
item.response = { foo: 'newbar' }; // it works
vConsole.network.update(item.id, item);
```

---


### vConsole.network.clear()

Remove all requests from Network panel.


#### Parameters

None.

#### Return value

`void`

