/**
 * vConsole System Tab
 *
 * @author WechatFE
 */

import * as tool from '../lib/tool.js';
import VConsoleLogTab from './log.js';
import tplTabbox from './tabbox_system.html';

class VConsoleDefaultTab extends VConsoleLogTab {

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
    
    // current time
    let d = tool.getDate();
    console.info('[system]', 'Now:', d.year+'-'+d.month+'-'+d.day+' '+d.hour+':'+d.minute+':'+d.second+'.'+d.millisecond);

    // device & system
    logMsg = 'Unknown';
    let ipod = ua.match(/(ipod).*\s([\d_]+)/i),
      ipad = ua.match(/(ipad).*\s([\d_]+)/i),
      iphone = ua.match(/(iphone)\sos\s([\d_]+)/i),
      android = ua.match(/(android)\s([\d\.]+)/i);
    if (android) {
      logMsg = 'Android ' + android[2];
    } else if (iphone) {
      logMsg = 'iPhone, iOS ' + iphone[2].replace(/_/g,'.');
    } else if (ipad) {
      logMsg = 'iPad, iOS ' + ipad[2].replace(/_/g, '.');
    } else if (ipod) {
      logMsg = 'iPod, iOS ' + ipod[2].replace(/_/g, '.');
    }
    console.info('[system]', 'System:', logMsg);

    // wechat app version
    let version = ua.match(/MicroMessenger\/([\d\.]+)/i);
    logMsg = 'Unknown';
    if (version && version[1]) {
      logMsg = version[1];
      console.info('[system]', 'WeChat:', logMsg);
    }

    // network type
    let network = ua.toLowerCase().match(/ nettype\/([^ ]+)/g);
    logMsg = 'Unknown';
    if (network && network[0]) {
      network = network[0].split('/');
      logMsg = network[1];
      console.info('[system]', 'Network:', logMsg);
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
    console.info('[system]', 'Protocol:', logMsg);

    // performance related
    let performance = window.performance || window.msPerformance || window.webkitPerformance;

    // timing
    if (performance && performance.timing) {
      let t = performance.timing,
        start = t.navigationStart;
      // console.info('[system]', 'debug', 'domainLookupEnd:', (t.domainLookupEnd - start)+'ms');
      console.info('[system]', 'connectEndTime:', (t.connectEnd - start)+'ms');
      console.info('[system]', 'responseEndTime:', (t.responseEnd - start)+'ms');
      // console.info('[system]', 'domComplete:', (t.domComplete - start)+'ms');
      // console.info('[system]', 'beforeReqTime:', (t.requestStart - start)+'ms');
      if (t.secureConnectionStart > 0) {
        console.info('[system]', 'SSL Cost:', (t.connectEnd - t.secureConnectionStart)+'ms');
      }
      // console.info('system', 'req&RespTime:', (t.responseEnd - t.requestStart)+'ms');
      console.info('[system]', 'DomRenderCost:', (t.domComplete - t.domLoading)+'ms');
    }

    // User Agent
    console.info('[system]', 'UA:', ua);
  }

} // END class

const tab = new VConsoleDefaultTab('system', 'System');

export default tab;