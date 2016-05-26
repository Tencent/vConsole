/**
 * vConsole Default Tab
 *
 * @author WechatFE
 */

import VConsoleLogTab from './log.js';
import tplTabbox from './tabbox_default.html';

class VConsoleDefaultTab extends VConsoleLogTab {

  constructor(...args) {
    super(...args);
    this.tplTabbox = tplTabbox;
  }

} // END class

const tab = new VConsoleDefaultTab('default', 'Log');

// when plugin is added to vConsole, 
// this event will be triggered immediately (but vConsole may be not ready yet)
tab.on('add', tab.onAdd);

// when vConsole is ready, 
// this event will be triggered (after 'add' event)
tab.on('init', tab.onInit);

// add this event then this plugin will be registered as a tab
tab.on('renderTab', tab.onRenderTab);

// after init
tab.on('finishInit', tab.onFinishInit);

export default tab;