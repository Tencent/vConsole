内置插件：属性及方法
==============================

一些内置插件会对外暴露一些公共方法，以便特殊用途。例如：

```javascript
vConsole.log.info()
```

如果未加载插件，那么其实例对象及方法都会是 `undefined`，使用前需要注意：

```javascript
vConsole = new VConsole({ defaultPlugins: ['system'] }); // 未加载 network 插件
vConsole.network.clear(); // Error: network is undefined
```

---


## Log 面板

---

### vConsole.log.log()

如同 `console.log()` 系列方法，可用的有：

```javascript
vConsole.log.log(...)
vConsole.log.info(...)
vConsole.log.debug(...)
vConsole.log.warn(...)
vConsole.log.error(...)
```

与直接调用 `console.log()` 不同，日志仅会输出到 Log 面板，而不会输出到原始的浏览器 console 里。


---


### vConsole.log.clear()

清空 Log 面板的所有日志，类似 `console.clear()`。

#### 参数

无。

#### 返回值

`void`


---


## System 面板

---

### vConsole.system.log() | info() | debug() | warn() | error()

与 `vConsole.log.log()` 一致，只不过日志会输出到 System 面板。

---

### vConsole.system.clear()

清空 System 面板的所有日志。

#### 参数

无。

#### 返回值

`void`


---


## Network 面板

---

### vConsole.network.add()

输出一个自定义 request 请求到 Network 面板。

```javascript
vConsole.network.add(item: VConsoleNetworkRequestItem): VConsoleNetworkRequestItemProxy
```

#### 参数

- `item: VConsoleNetworkRequestItem`: 自定义的 Request 对象。

```javascript
interface VConsoleNetworkRequestItem {
  // HTTP method
  method: '' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';
  // 完整的 URL，如： https://www.abc.com/foo?a=b
  url: string;
  // HTTP 状态码，如： 200
  status: number | string;
  // XMLHttpRequest.readyState
  readyState?: XMLHttpRequest['readyState'];
  // Response header， KV 键值对
  header: { [key: string]: string };
  // XMLHttpRequest.responseType
  responseType?: XMLHttpRequest['responseType'];
  // 'xhr': XMLHttpRequest, 'custom': 自定义请求
  requestType: 'xhr' | 'fetch' | 'ping' | 'custom';
  // 对应 `XMLHttpRequest.setRequestHeader()` 或 fetch 的 headers
  requestHeader?: HeadersInit;
  // 回包的内容
  response: any;
  // 时间戳
  startTime: number;
  // 时间戳
  endTime: number;
  // Query string parameters，KV 键值对或 JSON 字符串
  getData?: { [key: string]: string } | null;
  // Request payload，KV 键值对或 JSON 字符串
  postData?: { [key: string]: string } | string | null;
}
```


#### 返回值

`VConsoleNetworkRequestItemProxy`

调用 `add()` 方法后，会返回一个新的对象，其内容继承于刚刚传入的 `VConsoleNetworkRequestItem` 对象，并且会增改部分属性值。

```javascript
interface VConsoleNetworkRequestItemProxy extends VConsoleNetworkRequestItem {
  // 内部 id，用于后续 update() 方法
  id: string;
  // 原始 response 会被尝试转成 JSON 字符串，若不成功则保持为原始值
  response: string | any;
  // 耗时，等于 endTime - startTime
  costTime?: number;
}
```

---


### vConsole.network.update()

更新一个自定义请求。

```javascript
vConsole.network.update(id: string, item: VConsoleNetworkRequestItem | VConsoleNetworkRequestItemProxy)
```

#### 参数

- `id: string`: 内部 id，可通过 `vConsole.network.add()` 的返回值获取。
- `item: VConsoleNetworkRequestItem | VConsoleNetworkRequestItemProxy`: 自定义的 Request 对象。


#### 返回值

`void`


**注意：**

直接修改 `VConsoleNetworkRequestItemProxy.response` 的属性值将不会奏效。  
如果你想更新 `response` 的内容，需要重新赋值整个对象。

```javascript
const item = vConsole.network.add({
  response: { foo: 'bar' },
  ... // 其他字段
});

item.response.foo = 'newbar'; // 不生效，response 不会有变化
item.response = { foo: 'newbar' }; // 有效
vConsole.network.update(item.id, item);
```

---


### vConsole.network.clear()

清空 Network 面板的所有记录。


#### 参数

无。

#### 返回值

`void`

