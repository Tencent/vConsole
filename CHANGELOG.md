English | [简体中文](./CHANGELOG_CN.md)

#### V3.3.0 (2019-02-02)

- [FEATURE] Add the ability to collapse the same log.
- [FIX] Fix issue which formatted log (like `console.log('[foo]', 'bar')`) will not display in Log tab.


#### V3.2.2 (2019-01-17)

- [FEATURE] Add console command prompt. (by @65147400)
- [FEATURE] Add SessionStorage support in Storage tab. (by @hkc452)
- [FIX] Fix `JSON.stringify` function which was incorrectly rewritten.
- [FIX] Fix `logNumber` bug which was not reset when clear logs. (by @liuyuekeng)
- [FIX] Fix unencoded HTML tag in Network tab. (by @mokang)
- [FIX] Fix possible crash when decode content in Storage tab. (by @wolfsilver)
- [FIX] Fix CSP buy cause by `nonce` attribute. (by @scotthuang)
- [IMPROVE] Add bottom safe area to adapt to full screen such as iPhone X. (by @dingyi1993)


#### V3.2.0 (2018-04-10)

- [FEATURE] Support `console.time()` and `console.timeEnd()`.
- [FEATRUE] Add `disableLogScrolling` (in `vConsole.option`).
- [FIX] Fix `setOption()` error.
- [FIX] Fix cookies' value wrong display.
- [FIX] Fix "Uncaught InvalidStateError". (by @fireyy)


#### V3.1.0 (2017-12-27)

- [FEATURE] Add `vConsole.showSwitch()` and `vConsole.hideSwitch()` methods, see [Public Properties & Methods](./doc/public_properties_methods.md).
- [FEATURE] Add `onReady` and `onClearLog` callback function to `vConsole.option`.
- [FEATURE] Auto clear logs when `console.clear()` is called.
- [FIX] Fix `\r` error when build in Windows.
- [FIX] Fix `Symbol` error in iOS8 or other old OS.


#### V3.0.0 (2017-09-27)

Basic:

- [FEATRUE] Require manual init vConsole `var vConsole = new VConsole(option)`.
- [FEATRUE] Add configuaration `vConsole.option`, which can be set when `new VConsole` or `setOption(key, value)`.
- [FEATURE] Support for custom loading of default built-in plugins by using `defaultPlugins` in the above option.
- [FEATURE] Add `setOption(key, value)` method.
- [IMPROVE] Support CSP rule `unsafe-eval` and `unsafe-inline`.
- [IMPROVE] Optimize `font-size` when `initial-scale < 1`.

Log plugin:

- [FEATURE] Support `maxLogNumber` option to limit maximum log number.
- [FIX] Fix the crash caused by printing large objects.
- [IMPROVE] Only the logs written as `console.log('[system]', xxx)` will be shown in System tab, so `console.log('[system] xxx')` will be shown in default log tab.

Network plugin:

- [FEATURE] Support `Query String Parameters` and `Form Data`.
- [IMPROVE] Auto format JSON response.
- [FIX] Fix bug that XHR status is always "Pending" when using 3rd HTTP libraries.

Plugins:

- [FEATURE] Plugins can get vConsole instance by `this.vConsole` on/after `init` event is called.
- [FEATURE] Add `updateOption` event to detect `vConsole.option` changes.
- [FEATURE] Add Element tab as a built-in plugin.
- [FEATURE] Add Storage tab as a built-in plugin.



## V2.x.x

#### V2.5.2 (2016-12-27)

- [FIX] Catch errors when eval custom commands in Log tab.


#### V2.5.1 (2016-10-18)

- [FIX] Fix `scrollHeight` error in some cases.
- [FIX] Fix flex layout in iOS 8 devices.
- [IMPROVE] Performance enhancement.


#### V2.5.0 (2016-09-28)

- [FEATURE] Add `vConsole.removePlugin()` method, see [Public Properties & Methods](./doc/public_properties_methods.md).
- [FEATURE] Add `remove` plugin event, see [Plugin: Event List](./doc/plugin_event_list.md).
- [IMPROVE] Disable page scrolling while vConsole is scrolling.
- [FIX] Fix `window.onerror()` typo.


#### V2.4.0 (2016-08-31)

- [FEATURE] Add `addTopBar` plugin event, see [Plugin: Event List](./doc/plugin_event_list.md).
- [FEATURE] Add log type filter to Log & System tab.
- [IMPROVE] Log list will not automatically scroll to bottom while printing new logs if the viewport is not at the end of list.
- [IMPROVE] Fix UI bugs.
- [FIX] Fix XSS issue when print object logs.
- [FIX] Switch button will not be positioned out of edges in some special cases.


#### V2.3.1 (2016-08-16)

- [FIX] Replace custom `tap` event (in V2.3.0) with `click` event (still support fast response) to prevent conflicts.
- [IMPROVE] Remove `now` item and add `navigationStart` time in System tab.


#### V2.3.0 (2016-08-15)

- [FEATURE] Objects or Arrays can be expended layer by layer.
- [FEATURE] All object's properties, including private properties, can be enumerable now.
- [IMPROVE] Support `tap` event within vConsole's DOM container to speed up `click` event.


#### V2.2.1 (2016-08-08)

- [IMPROVE] Add complete performance timing log to System tab.
- [ADD] Add third-party plugin list to README.


#### V2.2.0 (2016-07-13)

- [FEATURE] Add `vConsole.version` property.
- [FEATURE] Add `xhr._noVConsole` property to `XMLHttpRequest` objects to customize whether a XHR should display in Network tab.


#### V2.1.0 (2016-06-29)

- [FEATURE] Add `vConsole.tool` & `vConsole.$` helper functions, see [Helper Functions](./doc/helper_functions.md).
- [FEATURE] Public properties & methods of vConsole are available, see [Public Properties & Methods](./doc/public_properties_methods.md).
- [FIX] Fix issue that `error` in `window.onerror()` may be undefined.
- [FIX] Fix error that `xhr.status` may be unavailable when `xhr.readyState < 4`.


#### v2.0.1 (2016-06-16)

- [FIX] Fix error that vConsole may not work at X5 browser engine.
- [FIX] Fix error that `localStorage` is null in some kind of devices.
- [FIX] Fix boolean display error in Log tab.
- [IMPROVE] Improve UI in Android.


#### v2.0.0 (2016-06-05)

- [FEATURE] Rebuild completely, support custom plugin, see [Plugin: Getting Started](./doc/plugin_getting_started.md).
- [FEATURE] Support execute JS command line in Log tab.
- [FEATURE] Support circular structure object in Log and System tab.
- [FEATURE] Support viewing request headers and response in Network tab.
- [IMPROVE] Switch button will not be dragged out of screen.
- [IMPROVE] Auto print User Agent in System tab.
- [IMPROVE] Show log's time in Log and System tab.
- [FIX] Fix issue that getDate() returns a wrong date.
- [FIX] Fix issue that sync AJAX becomes async AJAX.



# v1.x.x

#### v1.3.0 (2016-05-20)

- [ADD] Support Drag and Drop switch button.
- [FIX] Fix initialization failure when loaded asynchronously.


#### v1.2.1 (2016-05-16)

- [FIX] Fix data lost when sending a POST request.


#### v1.2.0 (2016-05-11)

- [ADD] Add network panel.
- [DELELE] Deprecate `vConsole.ready()` method.
- [IMPROVE] Display formatted Object & Array variable.
- [IMPROVE] Add English README and CHANGELOG.
- [IMPROVE] Improve UI.


#### v1.1.0 (2016-05-06)

- [ADD] Support `window.onerror()` to catch exceptions and errors.
- [ADD] Support `[default|system|...]` string to print logs to specific panel.


#### v1.0.5 (2016-04-29)

- [FIX] Fix webpack compilation.
- [FIX] Fix XSS when printing HTML string.


#### v1.0.4 (2016-04-28)

- [FIX] Fix the `main` path in `package.json`.
- [IMPROVE] Update demo pages.


#### v1.0.2 (2016-04-27)

- Initial release.