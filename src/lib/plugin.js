/*
Tencent is pleased to support the open source community by making vConsole available.

Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.

Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://opensource.org/licenses/MIT

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * vConsole Plugin Class
 */

class VConsolePlugin {
  
  constructor(id, name = 'newPlugin') {
    this.id = id;
    this.name = name;
    this.isReady = false;
    
    this.eventList = {};
  }

  get id() {
    return this._id;
  }
  set id(value) {
    if (!value) {
      throw 'Plugin ID cannot be empty';
    }
    this._id = value.toLowerCase();
  }

  get name() {
    return this._name;
  }
  set name(value) {
    if (!value) {
      throw 'Plugin name cannot be empty';
    }
    this._name = value;
  }

  get vConsole() {
    return this._vConsole || undefined;
  }
  set vConsole(value) {
    if (!value) {
      throw 'vConsole cannot be empty';
    }
    this._vConsole = value;
  }

  /**
   * register an event
   * @public
   * @param string
   * @param function
   */
  on(eventName, callback) {
    this.eventList[eventName] = callback;
    return this;
  }

  /**
   * trigger an event
   * @public
   * @param string
   * @param mixed
   */
  trigger(eventName, data) {
    if (typeof this.eventList[eventName] === 'function') {
      // registered by `.on()` method
      this.eventList[eventName].call(this, data);
    } else {
      // registered by `.onXxx()` method
      let method = 'on' + eventName.charAt(0).toUpperCase() + eventName.slice(1);
      if (typeof this[method] === 'function') {
        this[method].call(this, data);
      }
    }
    return this;
  }

} // END class

export default VConsolePlugin;