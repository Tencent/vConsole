import copy from 'copy-text-to-clipboard';
import tplItemCopy from './item_copy.html';
import $ from '../lib/query';

export default class VConsoleItemCopy {
  public static html = tplItemCopy;
  
  /**
   * Delegate copy button `onClick` event on a perent element.
   */
  public static delegate($el: Element, getCopyText: (id: string) => string) {
    $.delegate($el, 'click', '.vc-item-copy', (e) => {
      const $btn = (<Element>e.target).closest('.vc-item-copy');
      const { id } = $btn.closest('.vc-item-id');
      const text = getCopyText(id);

      if (text !== null && this.copy(text)) {
        $btn.classList.add('vc-item-copy-success');

        setTimeout(() => {
          $btn.classList.remove('vc-item-copy-success');
        }, 600);
      };
    });
  }

  /**
   * Copy a text to clipboard
   */
  public static copy(text: string) {
    return copy(text, { target: document.documentElement });
  }
}
