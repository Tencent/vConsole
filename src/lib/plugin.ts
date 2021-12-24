/*
Tencent is pleased to support the open source community by making vConsole available.

Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.

Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://opensource.org/licenses/MIT

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
import { getUniqueID } from '../lib/tool';

export type IVConsolePluginEvent = (data?: any) => void;
export type IVConsolePluginEventName = 'init' | 'renderTab' | 'addTopBar' | 'addTool' | 'ready' | 'remove' | 'updateOption' | 'showConsole' | 'hideConsole' | 'show' | 'hide';

export interface IVConsoleTopbarOptions {
  name: string;
  className: string;
  actived?: boolean;
  data?: { [key: string]: string };
  onClick?: (e: Event, data?: any) => any;
}

export interface IVConsoleToolbarOptions {
  name: string;
  global?: boolean;
  data?: { [key: string]: string };
  onClick?: (e: Event, data?: any) => any;
}

/**
 * vConsole Plugin Base Class
 */
export class VConsolePlugin {
  public isReady: boolean = false;
  public eventMap: Map<IVConsolePluginEventName, IVConsolePluginEvent> = new Map();
  protected _id: string;
  protected _name: string;
  protected _vConsole: any;
  
  constructor(...args);
  constructor(id: string, name = 'newPlugin') {
    this.id = id;
    this.name = name;
    this.isReady = false;
  }

  get id() {
    return this._id;
  }
  set id(value: string) {
    if (typeof value !== 'string') {
      throw '[vConsole] Plugin ID must be a string.';
    } else if (!value) {
      throw '[vConsole] Plugin ID cannot be empty.';
    }
    this._id = value.toLowerCase();
  }

  get name() {
    return this._name;
  }
  set name(value: string) {
    if (typeof value !== 'string') {
      throw '[vConsole] Plugin name must be a string.';
    } else if (!value) {
      throw '[vConsole] Plugin name cannot be empty.';
    }
    this._name = value;
  }

  get vConsole() {
    return this._vConsole || undefined;
  }
  set vConsole(value) {
    if (!value) {
      throw '[vConsole] vConsole cannot be empty';
    }
    this._vConsole = value;
  }

  /**
   * Register an event
   * @public
   * @param IVConsolePluginEventName
   * @param IVConsolePluginEvent
   */
  public on(eventName: IVConsolePluginEventName, callback: IVConsolePluginEvent) {
    this.eventMap.set(eventName, callback);
    return this;
  }

  /**
   * Trigger an event.
   */
  public trigger(eventName: IVConsolePluginEventName, data?: any) {
    const targetEvent = this.eventMap.get(eventName);
    if (typeof targetEvent === 'function') {
      // registered by `.on()` method
      targetEvent.call(this, data);
    } else {
      // registered by `.onXxx()` method
      const method = 'on' + eventName.charAt(0).toUpperCase() + eventName.slice(1);
      if (typeof this[method] === 'function') {
        this[method].call(this, data);
      }
    }
    return this;
  }

  protected getUniqueID(prefix: string = '') {
    return getUniqueID(prefix);
  }

} // END class

export default VConsolePlugin;
