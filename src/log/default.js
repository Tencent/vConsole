/**
 * vConsole Default Tab
 *
 * @author WechatFE
 */

import $ from '../lib/query.js';
import * as tool from '../lib/tool.js';
import VConsoleLogTab from './log.js';
import tplTabbox from './tabbox_default.html';
import tplItemCode from './item_code.html';

class VConsoleDefaultTab extends VConsoleLogTab {

  constructor(...args) {
    super(...args);
    this.tplTabbox = tplTabbox;
  }

  onFinishInit() {
    let that = this;
    super.onFinishInit();

    $.bind($.one('.vc-cmd', this.$tabbox), 'submit', function(e) {
      e.preventDefault();
      let $input = $.one('.vc-cmd-input', e.target),
        cmd = $input.value;
      $input.value = '';
      that.evalCommand(cmd);
    });
  }

  /**
   * 
   * @private
   */
  evalCommand(cmd) {
    // print command to console
    let date = tool.getDate(+new Date());
    this.renderLog({
      meta: date.hour + ':' + date.minute + ':' + date.second,
      content: $.render(tplItemCode, {content: cmd, type: 'input'}, true)
    });
    // eval
    let result = eval(cmd);
    // print result to console
    this.renderLog({
      meta: '',
      content: $.render(tplItemCode, {content: result, type: 'output'}, true)
    });
  }

} // END class

const tab = new VConsoleDefaultTab('default', 'Log');

export default tab;