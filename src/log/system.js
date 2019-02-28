/*
Tencent is pleased to support the open source community by making vConsole available.

Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.

Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://opensource.org/licenses/MIT

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * vConsole System Tab
 */

import VConsoleLogTab from './log.js';
import tplTabbox from './tabbox_system.html';

class VConsoleSystemTab extends VConsoleLogTab {

  constructor(...args) {
    super(...args);
    this.tplTabbox = tplTabbox;
    this.allowUnformattedLog = false; // only logs begin with `[system]` can be displayed
  }

  onInit() {
    super.onInit();
    this.printSystemInfo();
  }

  printSystemInfo() {
  	// print system info
    let ua = navigator.userAgent,
      logMsg = '';

    // device & system
    let ipod = ua.match(/(ipod).*\s([\d_]+)/i),
      ipad = ua.match(/(ipad).*\s([\d_]+)/i),
      iphone = ua.match(/(iphone)\sos\s([\d_]+)/i),
      android = ua.match(/(android)\s([\d\.]+)/i);
    
    logMsg = 'Unknown';
    if (android) {
      logMsg = 'Android ' + android[2];
    } else if (iphone) {
      logMsg = 'iPhone, iOS ' + iphone[2].replace(/_/g,'.');
    } else if (ipad) {
      logMsg = 'iPad, iOS ' + ipad[2].replace(/_/g, '.');
    } else if (ipod) {
      logMsg = 'iPod, iOS ' + ipod[2].replace(/_/g, '.');
    }
    let templogMsg = logMsg;
    // wechat client version
    let version = ua.match(/MicroMessenger\/([\d\.]+)/i);
    logMsg = 'Unknown';
    if (version && version[1]) {
      logMsg = version[1];
      templogMsg += (', WeChat ' + logMsg);
      console.info('[system]', 'System:', templogMsg);
    } else {
      console.info('[system]', 'System:', templogMsg);
    }

    // HTTP protocol
    logMsg = 'Unknown';
    if (location.protocol == 'https:') {
      logMsg = 'HTTPS';
    } else if (location.protocol == 'http:') {
      logMsg = 'HTTP';
    } else {
      logMsg = location.protocol.replace(':', '');
    }
    templogMsg = logMsg;
    // network type
    let network = ua.toLowerCase().match(/ nettype\/([^ ]+)/g);
    logMsg = 'Unknown';
    if (network && network[0]) {
      network = network[0].split('/');
      logMsg = network[1];
      templogMsg += (', ' + logMsg);
      console.info('[system]', 'Network:', templogMsg);
    } else {
      console.info('[system]', 'Protocol:', templogMsg);
    }

    // User Agent
    console.info('[system]', 'UA:', ua);
    

    // performance related
    // use `setTimeout` to make sure all timing points are available
    setTimeout(function() {
      let performance = window.performance || window.msPerformance || window.webkitPerformance;

      // timing
      if (performance && performance.timing) {
        let t = performance.timing;
        if (t.navigationStart) {
          console.info('[system]', 'navigationStart:', t.navigationStart);
        }
        if (t.navigationStart && t.domainLookupStart) {
          console.info('[system]', 'navigation:', (t.domainLookupStart - t.navigationStart)+'ms');
        }
        if (t.domainLookupEnd && t.domainLookupStart) {
          console.info('[system]', 'dns:', (t.domainLookupEnd - t.domainLookupStart)+'ms');
        }
        if (t.connectEnd && t.connectStart) {
          if (t.connectEnd && t.secureConnectionStart) {
            console.info('[system]', 'tcp (ssl):', (t.connectEnd - t.connectStart)+'ms ('+(t.connectEnd - t.secureConnectionStart)+'ms)');
          } else {
            console.info('[system]', 'tcp:', (t.connectEnd - t.connectStart)+'ms');
          }
        }
        if (t.responseStart && t.requestStart) {
          console.info('[system]', 'request:', (t.responseStart - t.requestStart)+'ms');
        }
        if (t.responseEnd && t.responseStart) {
          console.info('[system]', 'response:', (t.responseEnd - t.responseStart)+'ms');
        }
        if (t.domComplete && t.domLoading) {
          if (t.domContentLoadedEventStart && t.domLoading) {
            console.info('[system]', 'domComplete (domLoaded):', (t.domComplete - t.domLoading)+'ms ('+(t.domContentLoadedEventStart - t.domLoading)+'ms)');
          } else {
            console.info('[system]', 'domComplete:', (t.domComplete - t.domLoading)+'ms');
          }
        }
        if (t.loadEventEnd && t.loadEventStart) {
          console.info('[system]', 'loadEvent:', (t.loadEventEnd - t.loadEventStart)+'ms');
        }
        if (t.navigationStart && t.loadEventEnd) {
          console.info('[system]', 'total (DOM):', (t.loadEventEnd - t.navigationStart)+'ms ('+(t.domComplete - t.navigationStart)+'ms)');
        }
      }
    }, 0);
  }

} // END class

export default VConsoleSystemTab;