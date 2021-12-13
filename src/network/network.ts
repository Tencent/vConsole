import $ from '../lib/query';
import { VConsoleSveltePlugin } from '../lib/sveltePlugin';
import NetworkComp from './network.svelte';
import { requestList, VConsoleNetworkModel } from './network.model';

export class VConsoleNetworkPlugin extends VConsoleSveltePlugin {
  protected module: VConsoleNetworkModel = VConsoleNetworkModel.getSingleton(VConsoleNetworkModel, 'VConsoleNetworkModel');
  protected storeUnsubscribe: ReturnType<typeof requestList.subscribe>;
  protected isShow: boolean = false;
  protected isInBottom: boolean = true; // whether the panel is in the bottom

  constructor(id: string, name: string, renderProps = { }) {
    super(id, name, NetworkComp, renderProps);

    this.storeUnsubscribe = requestList.subscribe((value) => {
      // scroll to bottom
      if (this.isInBottom && this.isShow) {
        this.autoScrollToBottom();
      }
    });
  }

  onReady() {
    const $content = $.one('.vc-content');
    $.bind($content, 'scroll', (e) => {
      if (!this.isShow) {
        return;
      }
      if ($content.scrollTop + $content.offsetHeight >= $content.scrollHeight) {
        this.isInBottom = true;
      } else {
        this.isInBottom = false;
      }
    });
  }

  onAddTool(callback) {
    const toolList = [{
      name: 'Clear',
      global: false,
      onClick: (e) => {
        this.module.clearLog();
      }
    }];
    callback(toolList);
  }

  onShowConsole() {
    if (this.isInBottom == true) {
      this.autoScrollToBottom();
    }
  }

  onRemove() {
    super.onRemove();
    if (this.module) {
      this.module.unMock();
    }
    if (typeof this.storeUnsubscribe === 'function') {
      this.storeUnsubscribe();
    }
  }

  onShow() {
    this.isShow = true;
    if (this.isInBottom == true) {
      this.autoScrollToBottom();
    }
  }

  onHide() {
    this.isShow = false;
  }

  autoScrollToBottom() {
    if (!this.vConsole.option.disableLogScrolling) {
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    const $box = $.one('.vc-content');
    $box.scrollTop = $box.scrollHeight - $box.offsetHeight;
  }
}
