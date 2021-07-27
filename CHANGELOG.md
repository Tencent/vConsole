English | [简体中文](./CHANGELOG_CN.md)

#### 3.9.1 (2021-07-27)

- `Fix(Log)` Fix command input style. (PR #437 by @FredZeng)
- `Fix(Storage)` Fix `globalThis` error. (issue #438 #439)
- `Chore` Fix `const` `let` error cause by Svelte. (PR #440 by @dellyoung)


#### 3.9.0 (2021-07-16)

- `Feat(Log)` Show audio loading error log. (PR #419 by @zimv)
- `Feat(Storage)` Rewrite Storage panel, supports add/edit/delete storage items. (PR #429 by @ManiaciaChao)
- `Feat(Plugin)` New third-party plugin [vite-plugin-vconsole](https://github.com/vadxq/vite-plugin-vconsole). (by @vadxq)
- `Refactor(Global)` Use Svelte as template engine. (PR #429 by @ManiaciaChao)
- `Refactor(Core|Element)` Convert core file and Element panel to `.ts` file.
- `Fix(Log)` Fix error when print object(s) with no `toJSON` method such as `Vue` instance. (PR #431 by @sillyhong)
- `Fix(Network)` Fix error when url not starts with `http`. (issue #420)
- `Fix(Network)` Fix error when using `Request` as `Fetch`'s parameter. (PR #428 by @tatsunoneko)
- `Fix(Network)` Display formatted key-value list when `POST` a JSON string. (issue #425)
- `style` Wrap LESS math operations. (PR #426 by @ManiaciaChao)
- `Chore` Fix `yarn serve` error. (issue #424)


#### 3.8.1 (2021-06-24)

- `Fix(Log)` Do not merge repeated logs with object(s) or array(s) into one line to avoid merging objects with the same structure but different values.
- `Fix(Log)` Fix the issue that log filter does not take effect after selecting the log type.
- `Fix(Network)` Fix error when url starts with `//`. (PR #414 by @kooritea)
- `Chore` Remove `exclude: node_modules` option in babel-loader to be compatible with ES5. (issue #404, #407)
- `Refactor(Log)` Convert Log & System panel to `.ts` file.


#### 3.8.0 (2021-06-23)

- `Feat(Log)` Show resource (image/video/link/script) loading error log. (PR #411 by @zimv)
- `Chore` Add `target: ['web', 'es5']` to Webpack to avoid compatibility issues. (issue #404)
- `Fix(Network)` Fix error when `new URL('x', undefined)`. (PR #409 by @moonkop)


#### 3.7.0 (2021-05-27)

- `Feat(Storage)` Show preview value to prevent large raw value blocking rendering. (issue #300)
- `Feat(Storage)` Add copy button and delete button.
- `Feat(Global)` Use system theme color by default when init option `theme` is empty.
- `Refactor(Storage)` Convert Storage panel to `.ts` file.
- `Fix(Network)` Use `forEach` instead of `.entries()` when traversing `headers`. (issue #404)
- `Fix(Network)` Fix error when `Content-Type` is empty.


#### 3.6.1 (2021-05-24)

- `Fix(Network)` Fix "Invalid base URL" error. (PR #402)


#### 3.6.0 (2021-05-21)

- `Feat(Log)` Print `unhandledrejection` log. (PR #389 by @zimv)
- `Feat(Network)` Support `navigator.sendBeacon()` in Network panel. (PR #383 by @cola119)
- `Feat(Network)` Display "Type" (Request Type) in "General", including `xhr|fetch|ping`.
- `Refactor(Global)` Use TypeScript. Now Network panel is conveted to `.ts` file.
- `Fix(Network)` Recover original `window.fetch()` method when remove Network panel.
- `Fix(Storage)` Fix issue that the cookie of the non-first-level domain cannot be deleted. (issue #398)
- `Fix(Element)` Fix issue that elements are rendered as nested when `attributes` or `characterData` changed. (issue #399)


#### 3.5.2 (2021-05-13)

- `Chore(Global)` Update to Webpack5 and update all NPM packages to the latest version.
- `Fix(Global)` Fix invalid click caused by wrong `selection`.
- `Fix(Log)` Delete `cachedLogs` when reached `maxLogNumber` limit.
- `Fix(Log)` Fix XSS risk.


#### 3.5.1 (2021-05-07)

- `Chore(Babel)` Fix incorrect `catch` built by babel-loader. (PR #392 by @myl0204)
- `Fix(Network)` Fix typing error. (PR #388 by @xovel)


#### 3.5.0 (2021-04-28)

- `Feature(Log)` Add ability to copy a single line of logs. (by @akai)
- `Feature(Plugin)` New third-party plugin [vconsole-vue-devtools-plugin](https://github.com/Zippowxk/vue-vconsole-devtools). (by @Zippowxk)
- `Perf(System)` Rename "System" field to "Client", and add `MacOS` version.
- `Fix(Log)` Use natural sorting to sort object and array's keys. (issue #372)
- `Fix(Network)` Fix JSON parse error when `contentType` is `text/html`. (by @zimv)
- `Fix(Network)` Fix `disableLogScrolling` not working in Network panel. (issue #282, #379)


#### V3.4.1 (2021-04-09)

- `Feature(Global)` Add `setSwitchPosition(x, y)` method to update the position of switch button, see [Public Properties & Methods](./doc/public_properties_methods.md) for more details.
- `Perf(Global)` Add `Symbol` polyfill. (issue #361)
- `Fix(Global)` Update theme style after `setOption()`.
- `Fix(Global)` Remove `transitionEnd` to prevent compatibility issues. (issue #364)
- `Fix(Network)` Fix `fetch` optional parameter `init`. (issue #363, #365)
- `Fix(Network)` Fix XSS risks.


#### V3.4.0 (2021-01-14)

- `Feature(Global)` Add darkmode theme, see `vConsole.option.theme` in [Public Properties & Methods](./doc/public_properties_methods.md). (PR #307 by @progrape)
- `Feature(Global)` Add safe area to switch button. (issue #353)
- `Feature(Log)` Auto move input cursor to the bracket after autocomplete command. (issue #293)
- `Feature(System)` Add `Location` info to System tab. (issue #343)
- `Feature(Network)` Add `fetch` log in Network tab. (by @weiqian93)
- `Feature(Network)` Add Request Headers to Network tab.
- `Feature(Network)` Use short URL and display parameters in Network tab. (issue #291)
- `Feature(Plugin)` New third-party plugin [vconsole-stats-plugin](https://github.com/smackgg/vConsole-Stats). (by @smackgg)
- `Fix(Global)` The position of the switch button will be reset by mistake when clicked.
- `Fix(Global)` Fix `document.documentElement.offsetHeight|offsetWidth` is unreliable in newer browsers. (PR #314 by @littlee)
- `Fix(Global)` Prevent dispatchEvent for disabled or readOnly elements. (PR #314 by @norux)
- `Fix(Global)` Fix nonce searching problem. (by @sunderls)
- `Fix(Global)` Fix security issues. (#345 by @QiAnXinCodeSafe)
- `Fix(Global)` Prevent "webkitStorageInfo deprecation" warning.
- `Perf(Global)` Remove `Symbol`, `Array.from` polyfill. (issue #325, #275)
- `Perf(Global)` Show all enumerable and unenumerable properties. (issue #327)
- `Chore` Update Webpack DevServer option. (by @QinZhen001)


#### V3.3.4 (2019-08-19)

- `Feature(Log)` Add `%c` log format to support custom log style, see [Tutorial](./doc/tutorial.md) for more details.
- `Feature(Plugin)` Add `VConsole.VConsoleLogPlugin` (`VConsole.VConsole*` plugins etc.) to `VConsole` class.
- `Fix(Global)` Fix a few minor issues. (#267 by @Molunerfinn, #272 by @domom)
- `Fix(Storage)` Fix remove cookie fail when it is set path=/ or top domain. (#264 by @qianxinfeng)
- `Perf(Global)` Display vConsole on `window DOMContentLoaded` instead of `window load`.


#### V3.3.2 (2019-07-04)

- `Feature(Global)` Add TypeScript definition file. (by @jas0ncn)
- `Fix(Log)` Avoid scrolling to bottom when away from bottom edge. (by @ele828)
- `Fix(Global)` Fix switch button position issue. (by @rexschuang)
- `Fix(Global)` Fix a few minor issues. (by @stenders)


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