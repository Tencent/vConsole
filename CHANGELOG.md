English | [简体中文](./CHANGELOG_CN.md)

## 3.15.1 (2023-06-01)

- `Feat(Netwrk)` Add new option `network.ignoreUrlRegExp` to skip some requests. (PR #623)
- `Fix(Core)` Fix prototype pollution in `vConsole.setOption()`. (issue #616 #621)
- `Fix(Core)` Fix plugin event `ready` triggering before its HTML finishes rendering. (issue #591)
- `Fix(Log)` Reset group state when `console.clear()` is called. (issue #611)
- `Fix(Log)` Compatible with iOS (less than 13.4) that does not support `ResizeObserver`, but there may be a potential performance issue when printing a large number of logs. (issue #610)
- `Fix(Network)` Fix possible "Cannot read property" error by `sendBeacon`. (issue #615)


## 3.15.0 (2022-11-02)

- `Feat(Log)` Add recycle scrolling to imporove performance, and add scroll to top/bottom buttons. (PR #570)
- `Feat(Log)` Add support for `console.group(), console.groupCollapsed(), console.groupEnd()`. (issue #545)
- `Feat(Network)` Add recycle scrolling to imporove performance.
- `Feat(Network)` Add "Start Time" of a request.
- `Feat(Network)` Use `curl` instead of `url` as the copy value of a request. (issue #410)
- `Fix(Storage)` Fix an event bug that overflow content cannot scroll. (issue #542)
- `Fix(Core)` Fix click event on `<select>` elements. (PR #577)


## 3.14.7 (2022-09-23)

- `Perf(Log)` Optimize rendering performance when adding logs. (PR #567)
- `Fix(Core)` Fix plugin panel sorting error when setting `pluginOrder` option. (issue #559)
- `Fix(Core)` Fix intervention error caused by `preventDefault` in `Touch` events. (issue #546)
- `Fix(Log)` Fix `window.onerror` missing line breaks.
- `Fix(Log)` Fix unclickable `vc-cmd-clear-btn` on iOS Safari. (PR #564)
- `Fix(Log)` Fix a typo that misjudged circular reference objects. (issue #566)
- `Fix(Log|Network)` Copy objects or arrays as standard JSON format. (issue #547)
- `Fix(Network)` Fix `Fetch` stays in pending status when `window` is proxied. (issue #556)
- `Fix(Storage)` Fix storage pannel sorting error when setting `storage.defaultStorages` option. (issue #560)
- `Chore` Add option `env['no-core-js']` to disable core-js polyfill. (PR #562)


## 3.14.6 (2022-04-14)

- `Fix(Log)` Fix logs lost tracking when adding a new vConsole after destroying the old one.
- `Fix(Network)` Fix `resp.body` undefined error. (issue #531)
- `Fix(Network)` Fix missing Request Headers when `xhr.setRequestHeader` is overwritten. (issue #533)
- `Chore` Update NPM dependencies.


## 3.14.5 (2022-04-06)

- `Fix(Core)` Fix unexpected error when init vConsole twice in short time. (issue #525)
- `Fix(Log)` Fix bug that `console.time | console.timeEnd` do not output log. (issue #523)
- `Fix(Element)` Fix `undefined is not an object` error when updating attributes. (issue #526)
- `Fix(Network)` Do not proxy response body reader when response is done.
- `Chore` Fix typo that Svelte is not transpiled by Babel on Windows. (PR #528)


## 3.14.4 (2022-03-31)

- `Fix(Network)` Fix CPU high load bug when response is a large string. (issue #515)
- `Fix(Network)` Fix missing Request Headers issue in XHR. (issue #522)


## 3.14.3 (2022-03-28)

- `Fix(Network)` Fix `response.size` error.


## 3.14.2 (2022-03-25)

- `Fix(Network)` Remove debugging console.log.
- `Chore` Drop `console.log` in Webpack process to ensure that no debugging logs appear in release version.
- `Chore` Add new build command to compile files in different scenarios.


## 3.14.1 (2022-03-24)

- `Fix(Network)` Fix `responseSize` error when `readyState === 3`.


## 3.14.0 (2022-03-23)

- `Feat(Core)` Add new option `pluginOrder` to adjust the order of built-in and custom plugins, see [Public Properties & Methods](./doc/public_properties_methods.md).
- `Feat(Core)` Panel will auto scroll to previous position when switching plugin panel.
- `Feat(Network)` Add response size.
- `Feat(Network)` Add support for `transfer-encoding: chunked`, now streaming response can be recorded.
- `Feat(Network)` Improve rendering performance of large Response data by cropping the displayed response content.
- `Refactor(Network)` Now network records will be more accurate by using Proxy to prevent `XMLHttpRequest | fetch` overwriting by other request libraries (like Axios).


## 3.13.0 (2022-03-15)

- `Feat(Log)` Add new option `log.showTimestamps`, see [Public Properties & Methods](./doc/public_properties_methods.md).
- `Fix(Core)` Use polyfill `click` event to prevent raw click event not working in some cases.
- `Fix(style)` Fix CSS transition failure in WeChat webview by using `bottom` instead of `transform`.
- `Fix(Core)` Fix error when calling vConsole method in `onReady` callback. (issue #516)
- `Refactor(Storage)` Improve robustness.


## 3.12.1 (2022-02-25)

- `Fix(Core)` Fix bug that `VConsole.instance` is empty when VConsole `import` as a new module.
- `Chore(Core)` Fix type declaration errors caused by vendors.


## 3.12.0 (2022-02-17)

- `Feat(Core)` Add new static property `VConsole.instance` to get the singleton instance.
- `Feat(Core)` Add new options `storage.defaultStorages`, see [Public Properties & Methods](./doc/public_properties_methods.md).
- `Feat(Core)` New way of using `vConsole.setOption()`: `setOption('log.maxLogNumber', 20)` to set `maxLogNumber` field only, and `setOption({ log: { maxLogNumber: 20 }})` to overwrite `log` object.
- `Feat(Core)` Deprecated some options, see below.
- `Fix(Plugin)` Fix the bug that event `renderTab` doesn't render plugin view.
- `Fix(Storage)` Fix cookie parse error in some bad cases. (issue #508, #509)

**Deprecated Options:**

- `maxLogNumber`: Use `option.log.maxLogNumber` instead.
- `maxNetworkNumber`: Use `option.network.maxNetworkNumber` instead.
- `onClearLog`: Removed.


## 3.11.2 (2022-01-20)

- `Feat(Storage)` Added "Clear" button to batch delete all storage items. (issue #499)
- `Fix(Storage)` Fix the issue that deleting cookies fails. (issue #499)


## 3.11.1 (2022-01-13)

- `Feat(Log)` Support for submitting command input using the enter key. (issue #498)
- `Fix(Network)` Fix `init.body` parameter problem. (issue #500)


## 3.11.0 (2021-12-30)

- `Feat(Core)` Add new option `vConsole.option.target` to specify custom mount target, see [Public Properties & Methods](./doc/public_properties_methods.md). (issue #455)
- `Feat(Log)` Add new methods: `vConsole.log.log()|info()|...`, `vConsole.log.clear()`, see [Builtin Plugin: Properties & Methods](./doc/plugin_properties_methods.md).
- `Feat(Network)` Add new methods: `vConsole.network.add()|update()`, `vConsole.network.clear()`, see [Builtin Plugin: Properties & Methods](./doc/plugin_properties_methods.md).
- `Feat(Network)` Add new option `vConsole.option.maxNetworkNumber` to limit request number, see [Public Properties & Methods](./doc/public_properties_methods.md). (issue #492)
- `Fix(Network)` Display Request Payload for all HTTP methods, not just POST. (issue #493)
- `Fix(Element)` Fix the infinite loop problem caused by the newly added Comment node. (issue #491)


## 3.10.1 (2021-12-23)

- `Feat(Network)` Pretty output format for JSON response. (issue #486)
- `Fix(Style)` Avoid panel scaling with the web page When `initial-scale !== 1`.
- `Fix(Core)` Fix the issue that clicking the panel button does not work in PC mode. (issue #487)
- `Fix(Network)` Display formatted JSON instead of `[object Object]` when Query/Payload/Headers is an object or array.
- `Fix(Network)` Avoid overwriting `onreadystatechange` of XHR objects multiple times when XHR objects are reused in some cases. (issue #214)


## 3.10.0 (2021-12-17)

> In this version, we refactored a lot of core logic, and used Svelte as the rendering engine for all views.  
> So there are some breaking changes, a small number of methods and properties are not forward compatible.  
> If you are a vConsole plugin developer, you should pay attention to these changes.

**Breaking Changes:**

- `Refactor(Core|Log|Network|Element)` Rebuild all views by using Svelte as template engine.
- `Refactor(Core)` **Remove** `vConsole.(tabList | activedTab | $dom)` properties.
- `Refactor(Plugin)` **Rename** `vConsole.showTab(pluginID)` to `vConsole.showPlugin(pluginID)`.
- `Refactor(Plugin)` **Change** callback option `{ data, onClick }` of plugin event `addTopBar`: `onClick` method will receive 2 arguments (which was 0 before): `(event: Event, data?: any) => boolean`, which `data` is the above option's `data` field.
- `Feat(Core)` **Remove** helper functions `vConsole.tool` and `vConsole.$`.

**Common Updates:**

- `Feat(Log)` Support object's `Symbol` keys.
- `Feat(Log)` Support multi-level keyword hint in Log's command line input.
- `Feat(Log)` Support string formatting `%s, %d, %o`, and better `%c` CSS styling formatting.
- `Feat(Log)` Add pagination to objects or arrays to improve rendering performance, with 50 key-values per page.
- `Feat(Network)` Add copy buttons to request attributes.
- `Feat(Element)` Improve UX, selected node will be highlighted and applied to Expand/Collapse action.
- `Feat(Style)` Style tags will be loaded into `<head>` after vConsole initialization, and removed after destruction.
- `Refactor(Storage)` Improve UX.
- `Fix(Network)` Throw error when `Fetch` get an error. (issue #458)


## 3.9.5 (2021-11-10)

- `Style(Log)` Add support for `BigInt` and update `Symbol` log style.
- `Refactor(Style)` Lazy load style tag when vConsole init.
- `Fix(Core)` Use `this || self` as `globalObject` to prevent `self is not defined` error. (issue #441)
- `Fix(Log)` Fix `Cannot convert a Symbol value to a string` error when logged a `Symbol` value.
- `Fix(Log)` Now commands and output logs can be copied.
- `Fix(Network)` Fix `URIError` when decode URI fail. (issue #470)
- `Fix(Network)` Fix potential `forEach` error. (issue #471)
- `Chore` Transform Svelte output code to ES5. (issue #468)


## 3.9.4 (2021-10-26)

- `Refactor(Core)` Add Typescript declaration to `VConsole` class.


## 3.9.3 (2021-10-22)

- `Fix(Network)` Fix `Cannot read property 'setAttribute' of null` error when call `setOption()` before init. (PR #453 by @Zhangstring)
- `Fix(Network)` Fix `Fetch` error when iOS < 11. (PR #457 by @zimv)
- `Chore` Generate `.d.ts` declarations when built. (RP #433 by @ManiaciaChao)
- `Chore` Remove `./dist` from Git tracking.


## 3.9.1 (2021-07-27)

- `Fix(Log)` Fix command input style. (PR #437 by @FredZeng)
- `Fix(Storage)` Fix `globalThis` error. (issue #438 #439)
- `Chore` Fix `const` `let` error cause by Svelte. (PR #440 by @dellyoung)


## 3.9.0 (2021-07-16)

- `Feat(Log)` Show audio loading error log. (PR #419 by @zimv)
- `Feat(Storage)` Rewrite Storage panel, supports add/edit/delete storage items. (PR #429 by @ManiaciaChao)
- `Feat(Plugin)` New third-party plugin [vite-plugin-vconsole](https://github.com/vadxq/vite-plugin-vconsole). (by @vadxq)
- `Refactor(Core)` Use Svelte as template engine. (PR #429 by @ManiaciaChao)
- `Refactor(Core|Element)` Convert core file and Element panel to `.ts` file.
- `Fix(Log)` Fix error when print object(s) with no `toJSON` method such as `Vue` instance. (PR #431 by @sillyhong)
- `Fix(Network)` Fix error when url not starts with `http`. (issue #420)
- `Fix(Network)` Fix error when using `Request` as `Fetch`'s parameter. (PR #428 by @tatsunoneko)
- `Fix(Network)` Display formatted key-value list when `POST` a JSON string. (issue #425)
- `Style` Wrap LESS math operations. (PR #426 by @ManiaciaChao)
- `Chore` Fix `yarn serve` error. (issue #424)


## 3.8.1 (2021-06-24)

- `Fix(Log)` Do not merge repeated logs with object(s) or array(s) into one line to avoid merging objects with the same structure but different values.
- `Fix(Log)` Fix the issue that log filter does not take effect after selecting the log type.
- `Fix(Network)` Fix error when url starts with `//`. (PR #414 by @kooritea)
- `Chore` Remove `exclude: node_modules` option in babel-loader to be compatible with ES5. (issue #404, #407)
- `Refactor(Log)` Convert Log & System panel to `.ts` file.


## 3.8.0 (2021-06-23)

- `Feat(Log)` Show resource (image/video/link/script) loading error log. (PR #411 by @zimv)
- `Chore` Add `target: ['web', 'es5']` to Webpack to avoid compatibility issues. (issue #404)
- `Fix(Network)` Fix error when `new URL('x', undefined)`. (PR #409 by @moonkop)


## 3.7.0 (2021-05-27)

- `Feat(Storage)` Show preview value to prevent large raw value blocking rendering. (issue #300)
- `Feat(Storage)` Add copy button and delete button.
- `Feat(Core)` Use system theme color by default when init option `theme` is empty.
- `Refactor(Storage)` Convert Storage panel to `.ts` file.
- `Fix(Network)` Use `forEach` instead of `.entries()` when traversing `headers`. (issue #404)
- `Fix(Network)` Fix error when `Content-Type` is empty.


## 3.6.1 (2021-05-24)

- `Fix(Network)` Fix "Invalid base URL" error. (PR #402)


## 3.6.0 (2021-05-21)

- `Feat(Log)` Print `unhandledrejection` log. (PR #389 by @zimv)
- `Feat(Network)` Support `navigator.sendBeacon()` in Network panel. (PR #383 by @cola119)
- `Feat(Network)` Display "Type" (Request Type) in "General", including `xhr|fetch|ping`.
- `Refactor(Core)` Use TypeScript. Now Network panel is conveted to `.ts` file.
- `Fix(Network)` Recover original `window.fetch()` method when remove Network panel.
- `Fix(Storage)` Fix issue that the cookie of the non-first-level domain cannot be deleted. (issue #398)
- `Fix(Element)` Fix issue that elements are rendered as nested when `attributes` or `characterData` changed. (issue #399)


## 3.5.2 (2021-05-13)

- `Chore(Core)` Update to Webpack5 and update all NPM packages to the latest version.
- `Fix(Core)` Fix invalid click caused by wrong `selection`.
- `Fix(Log)` Delete `cachedLogs` when reached `maxLogNumber` limit.
- `Fix(Log)` Fix XSS risk.


## 3.5.1 (2021-05-07)

- `Chore(Babel)` Fix incorrect `catch` built by babel-loader. (PR #392 by @myl0204)
- `Fix(Network)` Fix typing error. (PR #388 by @xovel)


## 3.5.0 (2021-04-28)

- `Feat(Log)` Add ability to copy a single line of logs. (by @akai)
- `Feat(Plugin)` New third-party plugin [vconsole-vue-devtools-plugin](https://github.com/Zippowxk/vue-vconsole-devtools). (by @Zippowxk)
- `Perf(System)` Rename "System" field to "Client", and add `MacOS` version.
- `Fix(Log)` Use natural sorting to sort object and array's keys. (issue #372)
- `Fix(Network)` Fix JSON parse error when `contentType` is `text/html`. (by @zimv)
- `Fix(Network)` Fix `disableLogScrolling` not working in Network panel. (issue #282, #379)


## v3.4.1 (2021-04-09)

- `Feat(Core)` Add `setSwitchPosition(x, y)` method to update the position of switch button, see [Public Properties & Methods](./doc/public_properties_methods.md) for more details.
- `Perf(Core)` Add `Symbol` polyfill. (issue #361)
- `Fix(Core)` Update theme style after `setOption()`.
- `Fix(Core)` Remove `transitionEnd` to prevent compatibility issues. (issue #364)
- `Fix(Network)` Fix `fetch` optional parameter `init`. (issue #363, #365)
- `Fix(Network)` Fix XSS risks.


## v3.4.0 (2021-01-14)

- `Feat(Core)` Add darkmode theme, see `vConsole.option.theme` in [Public Properties & Methods](./doc/public_properties_methods.md). (PR #307 by @progrape)
- `Feat(Core)` Add safe area to switch button. (issue #353)
- `Feat(Log)` Auto move input cursor to the bracket after autocomplete command. (issue #293)
- `Feat(System)` Add `Location` info to System tab. (issue #343)
- `Feat(Network)` Add `fetch` log in Network tab. (by @weiqian93)
- `Feat(Network)` Add Request Headers to Network tab.
- `Feat(Network)` Use short URL and display parameters in Network tab. (issue #291)
- `Feat(Plugin)` New third-party plugin [vconsole-stats-plugin](https://github.com/smackgg/vConsole-Stats). (by @smackgg)
- `Fix(Core)` The position of the switch button will be reset by mistake when clicked.
- `Fix(Core)` Fix `document.documentElement.offsetHeight|offsetWidth` is unreliable in newer browsers. (PR #314 by @littlee)
- `Fix(Core)` Prevent dispatchEvent for disabled or readOnly elements. (PR #314 by @norux)
- `Fix(Core)` Fix nonce searching problem. (by @sunderls)
- `Fix(Core)` Fix security issues. (#345 by @QiAnXinCodeSafe)
- `Fix(Core)` Prevent "webkitStorageInfo deprecation" warning.
- `Perf(Core)` Remove `Symbol`, `Array.from` polyfill. (issue #325, #275)
- `Perf(Core)` Show all enumerable and unenumerable properties. (issue #327)
- `Chore` Update Webpack DevServer option. (by @QinZhen001)


## v3.3.4 (2019-08-19)

- `Feat(Log)` Add `%c` log format to support custom log style, see [Tutorial](./doc/tutorial.md) for more details.
- `Feat(Plugin)` Add `VConsole.VConsoleLogPlugin` (`VConsole.VConsole*` plugins etc.) to `VConsole` class.
- `Fix(Core)` Fix a few minor issues. (#267 by @Molunerfinn, #272 by @domom)
- `Fix(Storage)` Fix remove cookie fail when it is set path=/ or top domain. (#264 by @qianxinfeng)
- `Perf(Core)` Display vConsole on `window DOMContentLoaded` instead of `window load`.


## v3.3.2 (2019-07-04)

- `Feat(Core)` Add TypeScript definition file. (by @jas0ncn)
- `Fix(Log)` Avoid scrolling to bottom when away from bottom edge. (by @ele828)
- `Fix(Core)` Fix switch button position issue. (by @rexschuang)
- `Fix(Core)` Fix a few minor issues. (by @stenders)


## v3.3.0 (2019-02-02)

- `Feat(Log)` Add the ability to collapse the same log.
- `Fix(Log)` Fix issue which formatted log (like `console.log('[foo]', 'bar')`) will not display in Log tab.


## v3.2.2 (2019-01-17)

- `Feat` Add console command prompt. (by @65147400)
- `Feat` Add SessionStorage support in Storage tab. (by @hkc452)
- `Fix` Fix `JSON.stringify` function which was incorrectly rewritten.
- `Fix` Fix `logNumber` bug which was not reset when clear logs. (by @liuyuekeng)
- `Fix` Fix unencoded HTML tag in Network tab. (by @mokang)
- `Fix` Fix possible crash when decode content in Storage tab. (by @wolfsilver)
- `Fix` Fix CSP buy cause by `nonce` attribute. (by @scotthuang)
- `Perf` Add bottom safe area to adapt to full screen such as iPhone X. (by @dingyi1993)


## v3.2.0 (2018-04-10)

- `Feat` Support `console.time()` and `console.timeEnd()`.
- `Feat` Add `disableLogScrolling` (in `vConsole.option`).
- `Fix` Fix `setOption()` error.
- `Fix` Fix cookies' value wrong display.
- `Fix` Fix "Uncaught InvalidStateError". (by @fireyy)


## v3.1.0 (2017-12-27)

- `Feat` Add `vConsole.showSwitch()` and `vConsole.hideSwitch()` methods, see [Public Properties & Methods](./doc/public_properties_methods.md).
- `Feat` Add `onReady` and `onClearLog` callback function to `vConsole.option`.
- `Feat` Auto clear logs when `console.clear()` is called.
- `Fix` Fix `\r` error when build in Windows.
- `Fix` Fix `Symbol` error in iOS8 or other old OS.


## v3.0.0 (2017-09-27)

Basic:

- `Feat` Require manual init vConsole `var vConsole = new VConsole(option)`.
- `Feat` Add configuaration `vConsole.option`, which can be set when `new VConsole` or `setOption(key, value)`.
- `Feat` Support for custom loading of default built-in plugins by using `defaultPlugins` in the above option.
- `Feat` Add `setOption(key, value)` method.
- `Perf` Support CSP rule `unsafe-eval` and `unsafe-inline`.
- `Perf` Optimize `font-size` when `initial-scale < 1`.

Log plugin:

- `Feat` Support `maxLogNumber` option to limit maximum log number.
- `Fix` Fix the crash caused by printing large objects.
- `Perf` Only the logs written as `console.log('[system]', xxx)` will be shown in System tab, so `console.log('[system] xxx')` will be shown in default log tab.

Network plugin:

- `Feat` Support `Query String Parameters` and `Form Data`.
- `Perf` Auto format JSON response.
- `Fix` Fix bug that XHR status is always "Pending" when using 3rd HTTP libraries.

Plugins:

- `Feat` Plugins can get vConsole instance by `this.vConsole` on/after `init` event is called.
- `Feat` Add `updateOption` event to detect `vConsole.option` changes.
- `Feat` Add Element tab as a built-in plugin.
- `Feat` Add Storage tab as a built-in plugin.



## v2.x.x

## v2.5.2 (2016-12-27)

- `Fix` Catch errors when eval custom commands in Log tab.


## v2.5.1 (2016-10-18)

- `Fix` Fix `scrollHeight` error in some cases.
- `Fix` Fix flex layout in iOS 8 devices.
- `Perf` Performance enhancement.


## v2.5.0 (2016-09-28)

- `Feat` Add `vConsole.removePlugin()` method, see [Public Properties & Methods](./doc/public_properties_methods.md).
- `Feat` Add `remove` plugin event, see [Plugin: Event List](./doc/plugin_event_list.md).
- `Perf` Disable page scrolling while vConsole is scrolling.
- `Fix` Fix `window.onerror()` typo.


## v2.4.0 (2016-08-31)

- `Feat` Add `addTopBar` plugin event, see [Plugin: Event List](./doc/plugin_event_list.md).
- `Feat` Add log type filter to Log & System tab.
- `Perf` Log list will not automatically scroll to bottom while printing new logs if the viewport is not at the end of list.
- `Perf` Fix UI bugs.
- `Fix` Fix XSS issue when print object logs.
- `Fix` Switch button will not be positioned out of edges in some special cases.


## v2.3.1 (2016-08-16)

- `Fix` Replace custom `tap` event (in V2.3.0) with `click` event (still support fast response) to prevent conflicts.
- `Perf` Remove `now` item and add `navigationStart` time in System tab.


## v2.3.0 (2016-08-15)

- `Feat` Objects or Arrays can be expended layer by layer.
- `Feat` All object's properties, including private properties, can be enumerable now.
- `Perf` Support `tap` event within vConsole's DOM container to speed up `click` event.


## v2.2.1 (2016-08-08)

- `Perf` Add complete performance timing log to System tab.
- `Feat` Add third-party plugin list to README.


## v2.2.0 (2016-07-13)

- `Feat` Add `vConsole.version` property.
- `Feat` Add `xhr._noVConsole` property to `XMLHttpRequest` objects to customize whether a XHR should display in Network tab.


## v2.1.0 (2016-06-29)

- `Feat` Add `vConsole.tool` & `vConsole.$` helper functions, see [Helper Functions](./doc/helper_functions.md).
- `Feat` Public properties & methods of vConsole are available, see [Public Properties & Methods](./doc/public_properties_methods.md).
- `Fix` Fix issue that `error` in `window.onerror()` may be undefined.
- `Fix` Fix error that `xhr.status` may be unavailable when `xhr.readyState < 4`.


## v2.0.1 (2016-06-16)

- `Fix` Fix error that vConsole may not work at X5 browser engine.
- `Fix` Fix error that `localStorage` is null in some kind of devices.
- `Fix` Fix boolean display error in Log tab.
- `Perf` Improve UI in Android.


## v2.0.0 (2016-06-05)

- `Feat` Rebuild completely, support custom plugin, see [Plugin: Getting Started](./doc/plugin_getting_started.md).
- `Feat` Support execute JS command line in Log tab.
- `Feat` Support circular structure object in Log and System tab.
- `Feat` Support viewing request headers and response in Network tab.
- `Perf` Switch button will not be dragged out of screen.
- `Perf` Auto print User Agent in System tab.
- `Perf` Show log's time in Log and System tab.
- `Fix` Fix issue that getDate() returns a wrong date.
- `Fix` Fix issue that sync AJAX becomes async AJAX.



# v1.x.x

## v1.3.0 (2016-05-20)

- `Feat` Support Drag and Drop switch button.
- `Fix` Fix initialization failure when loaded asynchronously.


## v1.2.1 (2016-05-16)

- `Fix` Fix data lost when sending a POST request.


## v1.2.0 (2016-05-11)

- `Feat` Add network panel.
- `Feat` Deprecate `vConsole.ready()` method.
- `Perf` Display formatted Object & Array variable.
- `Perf` Add English README and CHANGELOG.
- `Perf` Improve UI.


## v1.1.0 (2016-05-06)

- `Feat` Support `window.onerror()` to catch exceptions and errors.
- `Feat` Support `[default|system|...]` string to print logs to specific panel.


## v1.0.5 (2016-04-29)

- `Fix` Fix webpack compilation.
- `Fix` Fix XSS when printing HTML string.


## v1.0.4 (2016-04-28)

- `Fix` Fix the `main` path in `package.json`.
- `Perf` Update demo pages.


## v1.0.2 (2016-04-27)

- Initial release.