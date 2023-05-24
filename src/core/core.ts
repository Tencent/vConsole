/*
Tencent is pleased to support the open source community by making vConsole available.

Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.

Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://opensource.org/licenses/MIT

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * vConsole core class
 */

import type { SvelteComponent } from 'svelte';
import type { VConsoleOptions } from './options.interface';

// helper
import * as tool from '../lib/tool';
import $ from '../lib/query';

// component
import { default as CoreCompClass } from './core.svelte';

// built-in plugins
import type { IVConsoleTopbarOptions, IVConsolePluginEventName } from '../lib/plugin';
import { VConsolePlugin } from '../lib/plugin';
import { VConsoleLogPlugin } from '../log/log';
import { VConsoleDefaultPlugin } from '../log/default';
import { VConsoleSystemPlugin } from '../log/system';
import { VConsoleNetworkPlugin } from '../network/network';
import { VConsoleElementPlugin } from '../element/element';
import { VConsoleStoragePlugin } from '../storage/storage';

// built-in plugin exporters
import { VConsoleLogExporter } from '../log/log.exporter';
import { VConsoleNetworkExporter } from '../network/network.exporter';

const VCONSOLE_ID = '#__vconsole';

export class VConsole {
  public version: string = __VERSION__;
  public isInited: boolean = false;
  public option: VConsoleOptions = {};

  protected compInstance: SvelteComponent;
  protected pluginList: { [id: string]: VConsolePlugin } = {}; // plugin instance

  // Export plugin methods
  public log: VConsoleLogExporter;
  public system: VConsoleLogExporter;
  public network: VConsoleNetworkExporter;

  // Export static classes
  public static VConsolePlugin: typeof VConsolePlugin;
  public static VConsoleLogPlugin: typeof VConsoleLogPlugin;
  public static VConsoleDefaultPlugin: typeof VConsoleDefaultPlugin;
  public static VConsoleSystemPlugin: typeof VConsoleSystemPlugin;
  public static VConsoleNetworkPlugin: typeof VConsoleNetworkPlugin;
  public static VConsoleElementPlugin: typeof VConsoleElementPlugin;
  public static VConsoleStoragePlugin: typeof VConsoleStoragePlugin;

  constructor(opt?: VConsoleOptions) {
    if (!!VConsole.instance && VConsole.instance instanceof VConsole) {
      console.debug('[vConsole] vConsole is already exists.');
      return VConsole.instance;
    }
    VConsole.instance = this;

    this.isInited = false;
    this.option = {
      defaultPlugins: ['system', 'network', 'element', 'storage'],
      log: {},
      network: {},
      storage: {},
    };

    // merge options
    if (tool.isObject(opt)) {
      for (let key in opt) {
        this.option[key] = opt[key];
      }
    }

    // check deprecated options
    if (typeof this.option.maxLogNumber !== 'undefined') {
      this.option.log.maxLogNumber = this.option.maxLogNumber;
      console.debug('[vConsole] Deprecated option: `maxLogNumber`, use `log.maxLogNumber` instead.');
    }
    if (typeof this.option.onClearLog !== 'undefined') {
      console.debug('[vConsole] Deprecated option: `onClearLog`.');
    }
    if (typeof this.option.maxNetworkNumber !== 'undefined') {
      this.option.network.maxNetworkNumber = this.option.maxNetworkNumber;
      console.debug('[vConsole] Deprecated option: `maxNetworkNumber`, use `network.maxNetworkNumber` instead.');
    }

    // add built-in plugins
    this._addBuiltInPlugins();

    // try to init
    const _onload = () => {
      if (this.isInited) {
        return;
      }
      this._initComponent();
      this._autoRun();
    };
    if (document !== undefined) {
      if (document.readyState === 'loading') {
        $.bind(<any>window, 'DOMContentLoaded', _onload);
      } else {
        _onload();
      }
    } else {
      // if document does not exist, wait for it
      let _timer;
      const _pollingDocument = () => {
        if (!!document && document.readyState == 'complete') {
          _timer && clearTimeout(_timer);
          _onload();
        } else {
          _timer = setTimeout(_pollingDocument, 1);
        }
      };
      _timer = setTimeout(_pollingDocument, 1);
    }
  }

  /**
   * Get singleton instance.
   **/
  public static get instance() {
    return (<any>window).__VCONSOLE_INSTANCE;
  }

  /**
   * Set singleton instance.
   **/
  public static set instance(value: VConsole | undefined) {
    if (value !== undefined && !(value instanceof VConsole)) {
      console.debug('[vConsole] Cannot set `VConsole.instance` because the value is not the instance of VConsole.');
      return;
    }
    (<any>window).__VCONSOLE_INSTANCE = value;
  }

  /**
   * Add built-in plugins.
   */
  private _addBuiltInPlugins() {
    // add default log plugin
    this.addPlugin(new VConsoleDefaultPlugin('default', 'Log'));

    // add other built-in plugins according to user's config
    const list = this.option.defaultPlugins;
    const plugins = {
      // 'default': { proto: VConsoleSystemPlugin, name: 'Log' },
      'system': { proto: VConsoleSystemPlugin, name: 'System' },
    };
    if (__TARGET__ === 'web') {
      plugins['network'] = { proto: VConsoleNetworkPlugin, name: 'Network' };
      plugins['element'] = { proto: VConsoleElementPlugin, name: 'Element' };
      plugins['storage'] = { proto: VConsoleStoragePlugin, name: 'Storage' };
    }
    if (!!list && tool.isArray(list)) {
      for (let i = 0; i < list.length; i++) {
        const pluginConf = plugins[list[i]];
        if (!!pluginConf) {
          this.addPlugin(new pluginConf.proto(list[i], pluginConf.name));
        } else {
          console.debug('[vConsole] Unrecognized default plugin ID:', list[i]);
        }
      }
    }
  }

  /**
   * Init svelte component.
   */
  private _initComponent() {
    if (! $.one(VCONSOLE_ID)) {
      const switchX = <any>tool.getStorage('switch_x') * 1;
      const switchY = <any>tool.getStorage('switch_y') * 1;

      let target: HTMLElement;
      if (typeof this.option.target === 'string') {
        target = document.querySelector(this.option.target);
      } else if (this.option.target instanceof HTMLElement) {
        target = this.option.target;
      }
      if (! (target instanceof HTMLElement)) {
        target = document.documentElement;
      }
      this.compInstance = new CoreCompClass({
        target,
        props: {
          switchButtonPosition: {
            x: switchX,
            y: switchY,
          },
        },
      });

      // bind events
      this.compInstance.$on('show', (e) => {
        if (e.detail.show) {
          this.show();
        } else {
          this.hide();
        }
      });
      this.compInstance.$on('changePanel', (e) => {
        const pluginId = e.detail.pluginId;
        this.showPlugin(pluginId);
      });
    }

    // set options into component
    this._updateComponentByOptions();
  }

  private _updateComponentByOptions() {
    if (!this.compInstance) {
      return;
    }

    if (this.compInstance.theme !== this.option.theme) {
      let theme = this.option.theme;
      theme = theme !== 'light' && theme !== 'dark' ? '' : theme; // empty string = use system theme
      this.compInstance.theme = theme;
    }

    if (this.compInstance.disableScrolling !== this.option.disableLogScrolling) {
      this.compInstance.disableScrolling = !!this.option.disableLogScrolling;
    }
  }

  /**
   * Update the position of Switch button.
   */
  public setSwitchPosition(x: number, y: number) {
    this.compInstance.switchButtonPosition = { x, y };
  }

  /**
   * Auto run after initialization.
   * @private
   */
  private _autoRun() {
    this.isInited = true;

    // init plugins
    for (let id in this.pluginList) {
      this._initPlugin(this.pluginList[id]);
    }

    // show first plugin
    this._showFirstPluginWhenEmpty();

    this.triggerEvent('ready');
  }

  private _showFirstPluginWhenEmpty() {
    const pluginIds = Object.keys(this.pluginList);
    if (this.compInstance.activedPluginId === '' && pluginIds.length > 0) {
      this.showPlugin(pluginIds[0]);
    }
  }

  /**
   * Trigger a `vConsole.option` event.
   */
  public triggerEvent(eventName: string, param?: any) {
    eventName = 'on' + eventName.charAt(0).toUpperCase() + eventName.slice(1);
    if (tool.isFunction(this.option[eventName])) {
      setTimeout(() => {
        this.option[eventName].apply(this, param);
      }, 0);
    }
  }

  /**
   * Init a plugin.
   */
  private _initPlugin<T extends VConsolePlugin>(plugin: T) {
    plugin.vConsole = this;
    this.compInstance.pluginList[plugin.id] = {
      id: plugin.id,
      name: plugin.name,
      hasTabPanel: false,
      tabOptions: undefined,
      topbarList: [],
      toolbarList: [],
      content: undefined,
      contentContainer: undefined,
    };
    this.compInstance.pluginList = this._reorderPluginList(this.compInstance.pluginList);
    // start init
    plugin.trigger('init');
    // render tab (if it is a tab plugin then it should has tab-related events)
    plugin.trigger('renderTab', (tabboxHTML, options = {}) => {
      // render tabbar
      const pluginInfo = this.compInstance.pluginList[plugin.id]
      pluginInfo.hasTabPanel = true;
      pluginInfo.tabOptions = options;
      // render tabbox
      if (!!tabboxHTML) {
        this.compInstance.pluginList[plugin.id].content = tabboxHTML;
      }
      this.compInstance.pluginList = this.compInstance.pluginList;
    });
    // render top bar
    plugin.trigger('addTopBar', (btnList: IVConsoleTopbarOptions[]) => {
      if (!btnList) { return; }
      const topbarList = [];
      for (let i = 0; i < btnList.length; i++) {
        const item = btnList[i];
        topbarList.push({
          name: item.name || 'Undefined',
          className: item.className || '',
          actived: !!item.actived,
          data: item.data,
          onClick: item.onClick,
        });
      }
      this.compInstance.pluginList[plugin.id].topbarList = topbarList;
      this.compInstance.pluginList = this.compInstance.pluginList;
    });
    // render tool bar
    plugin.trigger('addTool', (toolList) => {
      if (!toolList) { return; }
      const list = [];
      for (let i = 0; i < toolList.length; i++) {
        const item = toolList[i];
        list.push({
          name: item.name || 'Undefined',
          global: !!item.global,
          data: item.data,
          onClick: item.onClick,
        });
      }
      this.compInstance.pluginList[plugin.id].toolbarList = list;
      this.compInstance.pluginList = this.compInstance.pluginList;
    });
    // end init
    plugin.isReady = true;
    plugin.trigger('ready');
  }

  /**
   * Trigger an event for each plugin.
   */
  private _triggerPluginsEvent(eventName: IVConsolePluginEventName) {
    for (let id in this.pluginList) {
      if (this.pluginList[id].isReady) {
        this.pluginList[id].trigger(eventName);
      }
    }
  }

  /**
   * Trigger an event by plugin's id.
   * @private
   */
  private _triggerPluginEvent(pluginId: string, eventName: IVConsolePluginEventName) {
    const plugin = this.pluginList[pluginId];
    if (!!plugin && plugin.isReady) {
      plugin.trigger(eventName);
    }
  }

  /**
   * Sorting plugin list by option `pluginOrder`.
   * Plugin not listed in `pluginOrder` will be put last.
   */
  private _reorderPluginList(pluginList: { [pluginID: string]: any }) {
    if (!tool.isArray(this.option.pluginOrder)) {
      return pluginList;
    }
    const keys = Object.keys(pluginList).sort((a, b) => {
      const ia = this.option.pluginOrder.indexOf(a);
      const ib = this.option.pluginOrder.indexOf(b);
      if (ia === ib) { return 0; }
      if (ia === -1) { return 1; }
      if (ib === -1) { return -1; }
      return ia - ib;
    });
    const newList: typeof pluginList = {};
    for (let i = 0; i < keys.length; i++) {
      newList[keys[i]] = pluginList[keys[i]];
    }
    return newList;
  }

  /**
   * Add a new plugin.
   */
  public addPlugin(plugin: VConsolePlugin) {
    // ignore this plugin if it has already been installed
    if (this.pluginList[plugin.id] !== undefined) {
      console.debug('[vConsole] Plugin `' + plugin.id + '` has already been added.');
      return false;
    }
    this.pluginList[plugin.id] = plugin;
    // init plugin only if vConsole is ready
    if (this.isInited) {
      this._initPlugin(plugin);
      // if it's the only plugin, show it by default
      this._showFirstPluginWhenEmpty();
    }
    return true;
  }

  /**
   * Remove a plugin.
   */
  public removePlugin(pluginID: string) {
    pluginID = (pluginID + '').toLowerCase();
    const plugin = this.pluginList[pluginID];
    // skip if is has not been installed
    if (plugin === undefined) {
      console.debug('[vConsole] Plugin `' + pluginID + '` does not exist.');
      return false;
    }
    // trigger `remove` event before uninstall
    plugin.trigger('remove');
    try {
      delete this.pluginList[pluginID];
      delete this.compInstance.pluginList[pluginID];
    } catch (e) {
      this.pluginList[pluginID] = undefined;
      this.compInstance.pluginList[pluginID] = undefined;
    }
    this.compInstance.pluginList = this.compInstance.pluginList;
    // show the first plugin by default
    if (this.compInstance.activedPluginId == pluginID) {
      this.compInstance.activedPluginId = '';
      this._showFirstPluginWhenEmpty();
    }
    return true;
  }

  /**
   * Show console panel.
   */
  public show() {
    if (!this.isInited) {
      return;
    }
    this.compInstance.show = true;
    this._triggerPluginsEvent('showConsole');
  }

  /**
   * Hide console panel.
   */
  public hide() {
    if (!this.isInited) {
      return;
    }
    this.compInstance.show = false;
    this._triggerPluginsEvent('hideConsole');
  }

  /**
   * Show switch button
   */
  public showSwitch() {
    if (!this.isInited) {
      return;
    }
    this.compInstance.showSwitchButton = true;
  }

  /**
   * Hide switch button.
   */
  public hideSwitch() {
    if (!this.isInited) {
      return;
    }
    this.compInstance.showSwitchButton = false;
  }

  /**
   * Show a plugin panel.
   */
  public showPlugin(pluginId: string) {
    if (!this.isInited) {
      return;
    }
    if (!this.pluginList[pluginId]) {
      console.debug('[vConsole] Plugin `' + pluginId + '` does not exist.');
    }
    // trigger plugin event
    this.compInstance.activedPluginId && this._triggerPluginEvent(this.compInstance.activedPluginId, 'hide');
    this.compInstance.activedPluginId = pluginId;
    this._triggerPluginEvent(this.compInstance.activedPluginId, 'show');
  }

  /**
   * Update option(s).
   * @example `setOption('log.maxLogNumber', 20)`: set 'maxLogNumber' field only.
   * @example `setOption({ log: { maxLogNumber: 20 }})`: overwrite 'log' object.
   */
  public setOption(keyOrObj: any, value?: any) {
    
    if (typeof keyOrObj === 'string') {
      // parse `a.b = val` to `a: { b: val }`
      const keys = keyOrObj.split('.');
      let opt: any = this.option;
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] === '__proto__' || keys[i] === 'constructor' || keys[i] === 'prototype') {
          console.debug(`[vConsole] Cannot set \`${keys[i]}\` in \`vConsole.setOption()\`.`);
          return;
        }
        if (opt[keys[i]] === undefined) {
          opt[keys[i]] = {};
        }
        if (i === keys.length - 1) {
          opt[keys[i]] = value;
        }
        opt = opt[keys[i]];
      }
      this._triggerPluginsEvent('updateOption');
      this._updateComponentByOptions();
    } else if (tool.isObject(keyOrObj)) {
      for (let k in keyOrObj) {
        if (k === '__proto__' || k === 'constructor' || k === 'prototype') {
          console.debug(`[vConsole] Cannot set \`${k}\` in \`vConsole.setOption()\`.`);
          continue;
        }
        this.option[k] = keyOrObj[k];
      }
      this._triggerPluginsEvent('updateOption');
      this._updateComponentByOptions();
    } else {
      console.debug('[vConsole] The first parameter of `vConsole.setOption()` must be a string or an object.');
    }
  }

  /**
   * Remove vConsole.
   */
  public destroy() {
    if (!this.isInited) {
      return;
    }
    // reverse isInited when destroyed
    this.isInited = false;
    VConsole.instance = undefined;

    // remove plugins
    const pluginIds = Object.keys(this.pluginList);
    for (let i = pluginIds.length - 1; i >= 0; i--) {
      this.removePlugin(pluginIds[i]);
    }
    // remove component
    this.compInstance.$destroy();
  }

} // END class


// Export built-in plugins
VConsole.VConsolePlugin = VConsolePlugin;
VConsole.VConsoleLogPlugin = VConsoleLogPlugin;
VConsole.VConsoleDefaultPlugin = VConsoleDefaultPlugin;
VConsole.VConsoleSystemPlugin = VConsoleSystemPlugin;

// for tree shaking
if (__TARGET__ === 'web') {
  VConsole.VConsoleNetworkPlugin = VConsoleNetworkPlugin;
  VConsole.VConsoleElementPlugin = VConsoleElementPlugin;
  VConsole.VConsoleStoragePlugin = VConsoleStoragePlugin;
}
