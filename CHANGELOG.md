English | [简体中文](./CHANGELOG_CN.md)

#### V3.4.1 (2021-04-09)

- `Feature(General)` Add `setSwitchPosition(x, y)` method to update the position of switch button, see [Public Properties & Methods](./doc/public_properties_methods.md) for more details.
- `Perf(General)` Add `Symbol` polyfill. (issue #361)
- `Fix(General)` Update theme style after `setOption()`.
- `Fix(General)` Remove `transitionEnd` to prevent compatibility issues. (issue #364)
- `Fix(Network)` Fix `fetch` optional parameter `init`. (issue #363, #365)
- `Fix(Network)` Fix XSS risks.


#### V3.4.0 (2021-01-14)

- `Feature(General)` Add darkmode theme, see `vConsole.option.theme` in [Public Properties & Methods](./doc/public_properties_methods.md). (by @progrape)
- `Feature(General)` Add safe area to switch button. (issue #353)
- `Feature(Log)` Auto move input cursor to the bracket after autocomplete command. (issue #293)
- `Feature(System)` Add `Location` info to System tab. (issue #343)
- `Feature(Network)` Add `fetch` log in Network tab. (by @weiqian93)
- `Feature(Network)` Add Request Headers to Network tab.
- `Feature(Network)` Use short URL and display parameters in Network tab. (issue #291)
- `Feature(Plugin)` New plugin [vconsole-stats-plugin](https://github.com/smackgg/vConsole-Stats). (by @smackgg)
- `Fix(General)` The position of the switch button will be reset by mistake when clicked.
- `Fix(General)` Fix `document.documentElement.offsetHeight|offsetWidth` is unreliable in newer browsers. (by @littlee)
- `Fix(General)` Prevent dispatchEvent for disabled or readOnly elements. (by @norux)
- `Fix(General)` Fix nonce searching problem. (by @sunderls)
- `Fix(General)` Fix security issues. (#345 by @QiAnXinCodeSafe)
- `Fix(General)` Prevent "webkitStorageInfo deprecation" warning.
- `Perf(General)` Remove `Symbol`, `Array.from` polyfill. (issue #325, #275)
- `Perf(General)` Show all enumerable and unenumerable properties. (issue #327)
- `Chore` Update Webpack DevServer option. (by @QinZhen001)


#### V3.3.4 (2019-08-19)

- `Feature(Log)` Add `%c` log format to support custom log style, see [Tutorial](./doc/tutorial.md) for more details.
- `Feature(Plugin)` Add `VConsole.VConsoleLogPlugin` (`VConsole.VConsole*` plugins etc.) to `VConsole` class.
- `Fix(General)` Fix a few minor issues. (#267 by @Molunerfinn, #272 by @domom)
- `Fix(Storage)` Fix remove cookie fail when it is set path=/ or top domain. (#264 by @qianxinfeng)
- `Perf(General)` Display vConsole on `window DOMContentLoaded` instead of `window load`.


#### V3.3.2 (2019-07-04)

- `Feature(General)` Add TypeScript definition file. (by @jas0ncn)
- `Fix(Log)` Avoid scrolling to bottom when away from bottom edge. (by @ele828)
- `Fix(General)` Fix switch button position issue. (by @rexschuang)
- `Fix(General)` Fix a few minor issues. (by @stenders)


#### V3.3.0 (2019-02-02)

- `Feature(Log)` Add the ability to collapse the same log.
- `Fix(Log)` Fix issue which formatted log (like `console.log('[foo]', 'bar')`) will not display in Log tab.


#### V3.2.2 (2019-01-17)

- `Feature` Add console command prompt. (by @65147400)
- `Feature` Add SessionStorage support in Storage tab. (by @hkc452)
- `Fix` Fix `JSON.stringify` function which was incorrectly rewritten.
- `Fix` Fix `logNumber` bug which was not reset when clear logs. (by @liuyuekeng)
- `Fix` Fix unencoded HTML tag in Network tab. (by @mokang)
- `Fix` Fix possible crash when decode content in Storage tab. (by @wolfsilver)
- `Fix` Fix CSP buy cause by `nonce` attribute. (by @scotthuang)
- `Perf` Add bottom safe area to adapt to full screen such as iPhone X. (by @dingyi1993)


#### V3.2.0 (2018-04-10)

- `Feature` Support `console.time()` and `console.timeEnd()`.
- `Feature` Add `disableLogScrolling` (in `vConsole.option`).
- `Fix` Fix `setOption()` error.
- `Fix` Fix cookies' value wrong display.
- `Fix` Fix "Uncaught InvalidStateError". (by @fireyy)


#### V3.1.0 (2017-12-27)

- `Feature` Add `vConsole.showSwitch()` and `vConsole.hideSwitch()` methods, see [Public Properties & Methods](./doc/public_properties_methods.md).
- `Feature` Add `onReady` and `onClearLog` callback function to `vConsole.option`.
- `Feature` Auto clear logs when `console.clear()` is called.
- `Fix` Fix `\r` error when build in Windows.
- `Fix` Fix `Symbol` error in iOS8 or other old OS.


#### V3.0.0 (2017-09-27)

Basic:

- `Feature` Require manual init vConsole `var vConsole = new VConsole(option)`.
- `Feature` Add configuaration `vConsole.option`, which can be set when `new VConsole` or `setOption(key, value)`.
- `Feature` Support for custom loading of default built-in plugins by using `defaultPlugins` in the above option.
- `Feature` Add `setOption(key, value)` method.
- `Perf` Support CSP rule `unsafe-eval` and `unsafe-inline`.
- `Perf` Optimize `font-size` when `initial-scale < 1`.

Log plugin:

- `Feature` Support `maxLogNumber` option to limit maximum log number.
- `Fix` Fix the crash caused by printing large objects.
- `Perf` Only the logs written as `console.log('[system]', xxx)` will be shown in System tab, so `console.log('[system] xxx')` will be shown in default log tab.

Network plugin:

- `Feature` Support `Query String Parameters` and `Form Data`.
- `Perf` Auto format JSON response.
- `Fix` Fix bug that XHR status is always "Pending" when using 3rd HTTP libraries.

Plugins:

- `Feature` Plugins can get vConsole instance by `this.vConsole` on/after `init` event is called.
- `Feature` Add `updateOption` event to detect `vConsole.option` changes.
- `Feature` Add Element tab as a built-in plugin.
- `Feature` Add Storage tab as a built-in plugin.



## V2.x.x

#### V2.5.2 (2016-12-27)

- `Fix` Catch errors when eval custom commands in Log tab.


#### V2.5.1 (2016-10-18)

- `Fix` Fix `scrollHeight` error in some cases.
- `Fix` Fix flex layout in iOS 8 devices.
- `Perf` Performance enhancement.


#### V2.5.0 (2016-09-28)

- `Feature` Add `vConsole.removePlugin()` method, see [Public Properties & Methods](./doc/public_properties_methods.md).
- `Feature` Add `remove` plugin event, see [Plugin: Event List](./doc/plugin_event_list.md).
- `Perf` Disable page scrolling while vConsole is scrolling.
- `Fix` Fix `window.onerror()` typo.


#### V2.4.0 (2016-08-31)

- `Feature` Add `addTopBar` plugin event, see [Plugin: Event List](./doc/plugin_event_list.md).
- `Feature` Add log type filter to Log & System tab.
- `Perf` Log list will not automatically scroll to bottom while printing new logs if the viewport is not at the end of list.
- `Perf` Fix UI bugs.
- `Fix` Fix XSS issue when print object logs.
- `Fix` Switch button will not be positioned out of edges in some special cases.


#### V2.3.1 (2016-08-16)

- `Fix` Replace custom `tap` event (in V2.3.0) with `click` event (still support fast response) to prevent conflicts.
- `Perf` Remove `now` item and add `navigationStart` time in System tab.


#### V2.3.0 (2016-08-15)

- `Feature` Objects or Arrays can be expended layer by layer.
- `Feature` All object's properties, including private properties, can be enumerable now.
- `Perf` Support `tap` event within vConsole's DOM container to speed up `click` event.


#### V2.2.1 (2016-08-08)

- `Perf` Add complete performance timing log to System tab.
- `Feature` Add third-party plugin list to README.


#### V2.2.0 (2016-07-13)

- `Feature` Add `vConsole.version` property.
- `Feature` Add `xhr._noVConsole` property to `XMLHttpRequest` objects to customize whether a XHR should display in Network tab.


#### V2.1.0 (2016-06-29)

- `Feature` Add `vConsole.tool` & `vConsole.$` helper functions, see [Helper Functions](./doc/helper_functions.md).
- `Feature` Public properties & methods of vConsole are available, see [Public Properties & Methods](./doc/public_properties_methods.md).
- `Fix` Fix issue that `error` in `window.onerror()` may be undefined.
- `Fix` Fix error that `xhr.status` may be unavailable when `xhr.readyState < 4`.


#### v2.0.1 (2016-06-16)

- `Fix` Fix error that vConsole may not work at X5 browser engine.
- `Fix` Fix error that `localStorage` is null in some kind of devices.
- `Fix` Fix boolean display error in Log tab.
- `Perf` Improve UI in Android.


#### v2.0.0 (2016-06-05)

- `Feature` Rebuild completely, support custom plugin, see [Plugin: Getting Started](./doc/plugin_getting_started.md).
- `Feature` Support execute JS command line in Log tab.
- `Feature` Support circular structure object in Log and System tab.
- `Feature` Support viewing request headers and response in Network tab.
- `Perf` Switch button will not be dragged out of screen.
- `Perf` Auto print User Agent in System tab.
- `Perf` Show log's time in Log and System tab.
- `Fix` Fix issue that getDate() returns a wrong date.
- `Fix` Fix issue that sync AJAX becomes async AJAX.



# v1.x.x

#### v1.3.0 (2016-05-20)

- `Feature` Support Drag and Drop switch button.
- `Fix` Fix initialization failure when loaded asynchronously.


#### v1.2.1 (2016-05-16)

- `Fix` Fix data lost when sending a POST request.


#### v1.2.0 (2016-05-11)

- `Feature` Add network panel.
- `Feature` Deprecate `vConsole.ready()` method.
- `Perf` Display formatted Object & Array variable.
- `Perf` Add English README and CHANGELOG.
- `Perf` Improve UI.


#### v1.1.0 (2016-05-06)

- `Feature` Support `window.onerror()` to catch exceptions and errors.
- `Feature` Support `[default|system|...]` string to print logs to specific panel.


#### v1.0.5 (2016-04-29)

- `Fix` Fix webpack compilation.
- `Fix` Fix XSS when printing HTML string.


#### v1.0.4 (2016-04-28)

- `Fix` Fix the `main` path in `package.json`.
- `Perf` Update demo pages.


#### v1.0.2 (2016-04-27)

- Initial release.