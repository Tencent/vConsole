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

import { SvelteComponent } from 'svelte';

import * as tool from '../lib/tool';
import $ from '../lib/query';

import Style from './core.less';

import { default as CoreCompClass } from './core.svelte';

// built-in plugins
import { VConsolePlugin, IVConsoleTopbarOptions } from '../lib/plugin';
import { VConsoleLogPlugin } from '../log/log';
import { VConsoleDefaultPlugin } from '../log/default';
import { VConsoleSystemPlugin } from '../log/system';
import { VConsoleNetworkPlugin } from '../network/network';
import { VConsoleElementPlugin } from '../element/element';
import { VConsoleStoragePlugin } from '../storage/storage';

declare interface VConsoleOptions {
  defaultPlugins?: ('system' | 'network' | 'element' | 'storage')[];
  maxLogNumber?: number;
  theme?: '' | 'dark' | 'light';
  disableLogScrolling?: boolean;
  onReady?: () => void;
  onClearLog?: () => void;
}

const VCONSOLE_ID = '#__vconsole';

class VConsole {
  // @ts-ignore
  public version: string = __VERSION__;
  public isInited: boolean;
  public option: VConsoleOptions = {};

  protected compInstance: SvelteComponent;
  protected pluginList: { [id: string]: VConsolePlugin } = {}; // plugin instance

  // export helper functions to public
  public tool = tool;
  public $ = $;

  // export static class
  public static VConsolePlugin = VConsolePlugin;
  public static VConsoleLogPlugin = VConsoleLogPlugin;
  public static VConsoleDefaultPlugin = VConsoleDefaultPlugin;
  public static VConsoleSystemPlugin = VConsoleSystemPlugin;
  public static VConsoleNetworkPlugin = VConsoleNetworkPlugin;
  public static VConsoleElementPlugin = VConsoleElementPlugin;
  public static VConsoleStoragePlugin = VConsoleStoragePlugin;

  constructor(opt?: VConsoleOptions) {
    if (!!$.one(VCONSOLE_ID)) {
      console.debug('vConsole is already exists.');
      return;
    }

    // create style tag
    Style.use();

    this.isInited = false;
    this.option = {
      defaultPlugins: ['system', 'network', 'element', 'storage']
    };

    // export helper functions to public
    this.tool = tool;
    this.$ = $;

    // merge options
    if (tool.isObject(opt)) {
      for (let key in opt) {
        this.option[key] = opt[key];
      }
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
  * add built-in plugins
  * @private
  */
  private _addBuiltInPlugins() {
    // add default log plugin
    this.addPlugin(new VConsoleDefaultPlugin('default', 'Log'));

    // add other built-in plugins according to user's config
    const list = this.option.defaultPlugins;
    const plugins = {
      // 'default': {proto: VConsoleSystemPlugin, name: 'Log'},
      'system': {proto: VConsoleSystemPlugin, name: 'System'},
      'network': {proto: VConsoleNetworkPlugin, name: 'Network'},
      'element': {proto: VConsoleElementPlugin, name: 'Element'},
      'storage': {proto: VConsoleStoragePlugin, name: 'Storage'}
    };
    if (!!list && tool.isArray(list)) {
      for (let i=0; i<list.length; i++) {
        let tab = plugins[list[i]];
        if (!!tab) {
          this.addPlugin(new tab.proto(list[i], tab.name));
        } else {
          console.debug('Unrecognized default plugin ID:', list[i]);
        }
      }
    }
  }

  /**
  * init view component
  * @private
  */
  private _initComponent() {
    if (! $.one(VCONSOLE_ID)) {
      const switchX = <any>tool.getStorage('switch_x') * 1;
      const switchY = <any>tool.getStorage('switch_y') * 1;

      this.compInstance = new CoreCompClass({
        target: document.documentElement,
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

    // set theme
    this._updateTheme();
  }

  /**
  * Update theme
  * @private
  */
  private _updateTheme() {
    if (!this.compInstance) {
      return;
    }
    let theme = this.option.theme;
    if (theme !== 'light' && theme !== 'dark') {
      theme = ''; // use system theme
    }
    this.compInstance.theme = theme;
  }

  /**
   * Update the position of Switch button.
   */
  public setSwitchPosition(x: number, y: number) {
    this.compInstance.switchButtonPosition = { x, y };
  }

  /**
  * auto run after initialization
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
  * trigger a vConsole.option event
  */
  public triggerEvent(eventName: string, param?: any) {
    eventName = 'on' + eventName.charAt(0).toUpperCase() + eventName.slice(1);
    if (tool.isFunction(this.option[eventName])) {
      this.option[eventName].apply(this, param);
    }
  }

  /**
  * init a plugin
  * @private
  */
  private _initPlugin<T extends VConsolePlugin>(plugin: T) {
    plugin.vConsole = this;
    this.compInstance.pluginList[plugin.id] = {
      id: plugin.id,
      name: plugin.name,
      hasTabPanel: false,
      topbarList: [],
      toolbarList: [],
    };
    this.compInstance.pluginList = this.compInstance.pluginList;
    // start init
    plugin.trigger('init');
    // render tab (if it is a tab plugin then it should has tab-related events)
    plugin.trigger('renderTab', (tabboxHTML) => {
      // render tabbar
      this.compInstance.pluginList[plugin.id].hasTabPanel = true;
      // render tabbox
      if (!!tabboxHTML) {
        if (tool.isString(tabboxHTML)) {
          this.compInstance.divContentInner.innerHTML += tabboxHTML;
        } else if (tool.isFunction(tabboxHTML.appendTo)) {
          tabboxHTML.appendTo(this.compInstance.divContentInner);
        } else if (tool.isElement(tabboxHTML)) {
          this.compInstance.divContentInner.insertAdjacentElement('beforeend', tabboxHTML);
        }
      }
    });
    // render top bar
    plugin.trigger('addTopBar', (btnList: IVConsoleTopbarOptions[]) => {
      if (!btnList) { return; }
      for (let i = 0; i < btnList.length; i++) {
        const item = btnList[i];
        this.compInstance.pluginList[plugin.id].topbarList.push({
          name: item.name || 'Undefined',
          className: item.className || '',
          actived: !!item.actived,
          data: item.data,
          onClick: item.onClick,
        });
      }
    });
    // render tool bar
    plugin.trigger('addTool', (toolList) => {
      if (!toolList) { return; }
      for (let i = 0; i<  toolList.length; i++) {
        const item = toolList[i];
        this.compInstance.pluginList[plugin.id].toolbarList.push({
          name: item.name || 'Undefined',
          global: !!item.global,
          data: item.data,
          onClick: item.onClick,
        });
      }
    });
    // end init
    plugin.isReady = true;
    plugin.trigger('ready');
  }

  /**
  * trigger an event for each plugin
  * @private
  */
  private _triggerPluginsEvent(eventName: string) {
    for (let id in this.pluginList) {
      if (this.pluginList[id].isReady) {
        this.pluginList[id].trigger(eventName);
      }
    }
  }

  /**
  * trigger an event by plugin's id
  * @private
  */
  private _triggerPluginEvent(pluginId: string, eventName: string) {
    const plugin = this.pluginList[pluginId];
    if (!!plugin && plugin.isReady) {
      plugin.trigger(eventName);
    }
  }

  /**
  * add a new plugin
  * @public
  * @param object VConsolePlugin object
  * @return boolean
  */
  public addPlugin(plugin: VConsolePlugin) {
    // ignore this plugin if it has already been installed
    if (this.pluginList[plugin.id] !== undefined) {
      console.debug('Plugin `' + plugin.id + '` has already been added.');
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
  * remove a plugin
  * @public
  * @param string pluginID
  * @return boolean
  */
  public removePlugin(pluginID: string) {
    pluginID = (pluginID + '').toLowerCase();
    const plugin = this.pluginList[pluginID];
    // skip if is has not been installed
    if (plugin === undefined) {
      console.debug('Plugin `' + pluginID + '` does not exist.');
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
  * show console panel
  * @public
  */
  public show() {
    if (!this.isInited) {
      return;
    }
    this.compInstance.show = true;
    this._triggerPluginsEvent('showConsole');
  }

  /**
  * hide console panel
  * @public
  */
  public hide() {
    if (!this.isInited) {
      return;
    }
    this.compInstance.show = false;
    this._triggerPluginsEvent('hideConsole');
  }

  /**
  * show switch button
  * @public
  */
  public showSwitch() {
    if (!this.isInited) {
      return;
    }
    this.compInstance.showSwitchButton = true;
  }

  /**
  * hide switch button
  */
  public hideSwitch() {
    if (!this.isInited) {
      return;
    }
    this.compInstance.showSwitchButton = false;
  }

  /**
  * show a plugin panel
  * @public
  */
  public showPlugin(pluginId: string) {
    if (!this.isInited) {
      return;
    }
    // trigger plugin event
    this.compInstance.activedPluginId && this._triggerPluginEvent(this.compInstance.activedPluginId, 'hide');
    this.compInstance.activedPluginId = pluginId;
    this._triggerPluginEvent(this.compInstance.activedPluginId, 'show');
  }

  /**
  * update option(s)
  * @public
  */
  public setOption(keyOrObj: any, value?: any) {
    if (tool.isString(keyOrObj)) {
      this.option[keyOrObj] = value;
      this._triggerPluginsEvent('updateOption');
      this._updateTheme();
    } else if (tool.isObject(keyOrObj)) {
      for (let k in keyOrObj) {
        this.option[k] = keyOrObj[k];
      }
      this._triggerPluginsEvent('updateOption');
      this._updateTheme();
    } else {
      console.debug('The first parameter of vConsole.setOption() must be a string or an object.');
    }
  }

  /**
  * uninstall vConsole
  * @public
  */
  public destroy() {
    if (!this.isInited) {
      return;
    }
    // remove plugins
    const pluginIds = Object.keys(this.pluginList);
    for (let i = pluginIds.length - 1; i >= 0; i--) {
      this.removePlugin(pluginIds[i]);
    }
    // remove component
    this.compInstance.$destroy();

    // reverse isInited when destroyed
    this.isInited = false;
  }

} // END class

export default VConsole;
