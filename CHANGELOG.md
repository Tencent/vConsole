English | [简体中文](./CHANGELOG_CN.md)

#### V2.1.0 (2016-06-29)

- [FEATURE] Add `vConsole.tool` & `vConsole.$` helper functions, see [Helper Functions](./doc/helper_functions.md).
- [FEATURE] Public properties & methods of vConsole are available, see [Public Properties & Methods](./doc/public_properties_methods.md).
- [FIX] Fix issue that `error` in `window.onerror()` may be undefined.
- [FIX] Fix error that `xhr.status` may be unavailable when `xhr.readyState < 4`.


#### v2.0.1 (2016-06-16)

- [FIX] Fix error that vConsole may not work at X5 browser engine
- [FIX] Fix error that `localStorage` is null in some kind of devices
- [FIX] Fix boolean display error in Log tab
- [IMPROVE] Improve UI in Android


#### v2.0.0 (2016-06-05)

- [FEATURE] Rebuild completely, support custom plugin, see [Plugin: Getting Started](./doc/plugin_getting_started.md).
- [FEATURE] Support execute JS command line in Log tab
- [FEATURE] Support circular structure object in Log and System tab
- [FEATURE] Support viewing request headers and response in Network tab
- [IMPROVE] Switch button will not be dragged out of screen
- [IMPROVE] Auto print User Agent in System tab
- [IMPROVE] Show log's time in Log and System tab
- [FIX] Fix issue that getDate() returns a wrong date
- [FIX] Fix issue that sync AJAX becomes async AJAX



# v1.x.x

#### v1.3.0 (2016-05-20)

- [ADD] Support Drag and Drop switch button
- [FIX] Fix initialization failure when loaded asynchronously


#### v1.2.1 (2016-05-16)

- [FIX] Fix data lost when sending a POST request


#### v1.2.0 (2016-05-11)

- [ADD] Add network panel
- [DELELE] Deprecate `vConsole.ready()` method
- [IMPROVE] Display formatted Object & Array variable
- [IMPROVE] Add English README and CHANGELOG
- [IMPROVE] Improve UI


#### v1.1.0 (2016-05-06)

- [ADD] Support `window.onerror()` to catch exceptions and errors
- [ADD] Support `[default|system|...]` string to print logs to specific panel


#### v1.0.5 (2016-04-29)

- [FIX] Fix webpack compilation
- [FIX] Fix XSS when printing HTML string


#### v1.0.4 (2016-04-28)

- [FIX] Fix the `main` path in `package.json`
- [IMPROVE] Update demo pages


#### v1.0.2 (2016-04-27)

- Initial release