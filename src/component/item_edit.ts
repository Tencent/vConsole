import copy from "copy-text-to-clipboard";
import tplItemEdit from "./item_edit.html";
import $ from "../lib/query";
import { VConsoleStorageItem } from "../storage/storage";
import { StorageEditor } from "../storage/editor";

export default class VConsoleItemEdit {
  private static editing = new Map<string, StorageEditor>();
  public static html = tplItemEdit;
  /**
   * Delegate copy button `onClick` event on a perent element.
   */
  public static delegate(
    $el: Element,
    getEditItem: (id: string) => StorageEditor
  ) {
    console.log("el", $el);
    $.delegate($el, "click", ".vc-item-edit", (e) => {
      const $btn = (<Element>e.target).closest(".vc-item-edit");
      const { id } = $btn.closest(".vc-item-id");
      let editor: StorageEditor;
      if (!VConsoleItemEdit.editing.has(id)) {
        editor = getEditItem(id);
        VConsoleItemEdit.editing.set(id, editor);
        editor.setEditStatus(true);
        $btn.classList.add("editing");
      } else {
        editor = VConsoleItemEdit.editing.get(id);
        if (editor.editStatus) {
          editor.submit();
          VConsoleItemEdit.editing.delete(id);
          $btn.classList.remove("editing");
        }
      }

      if (editor !== null) {
        console.log("item", editor);
      }
    });
  }

  /**
   * Copy a text to clipboard
   */
  public static copy(text: string) {
    return copy(text, { target: document.documentElement });
  }
}
