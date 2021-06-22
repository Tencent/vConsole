import { VConsoleStorageItem } from "./storage";
import $ from "../lib/query";
import VConsoleItemEdit from "../component/item_edit";

export abstract class BaseEditor {
  //   protected type: "storage" | "cookie";
  $dom: HTMLElement;
  item: VConsoleStorageItem;
  cleaners: Function[] = [];
  private editing = false;
  public setEditStatus(val: boolean) {
    return (this.editing = val);
  }
  get editStatus() {
    return this.editing;
  }
  destroy() {
    this.cleaners.forEach((cleaner) => cleaner());
  }

  protected bindDomWithData = (
    $dom: HTMLElement,
    key: "name" | "value",
    cb?: (value: string) => void
  ) => {
    // const prevContentEditable = $dom.contentEditable;
    $dom.contentEditable = "true";
    const handler = ({ isComposing }: InputEvent) => {
      if (!isComposing) {
        const data = $dom.innerText;
        this.item[key] = data;
        cb?.(data);
      }
    };
    $dom.addEventListener("input", handler);
    this.cleaners.push(() => {
      $dom.contentEditable = "false";
      $dom.removeEventListener("input", handler);
    });
    return $dom.innerText;
  };

  constructor(item: VConsoleStorageItem) {
    this.item = item;
    this.$dom = $.one(`#${item.id}`);
    this.init();
  }

  private originKey = "";
  private originValue = "";

  protected init() {
    const [$key, $value] = $.all(".vc-table-col-value", this.$dom);
    this.originKey = this.bindDomWithData($key, "name");
    this.originValue = this.bindDomWithData($value, "value");
  }
  submit() {
    if (!this.editStatus) return;
    this.setEditStatus(false);
    this.destroy();
    const { name: key, value } = this.item;
    const keyDirty = key !== this.originKey;
    const valueDirty = value !== this.originValue;
    if (keyDirty) this.removeItem(this.originKey);
    this.setItem(key, value);
    this.afterSubmit();
  }

  abstract afterSubmit();

  abstract removeItem(key: string);
  abstract setItem(key: string, value: string);
}

export class StorageEditor extends BaseEditor {
  private storage: Storage;
  constructor(item: VConsoleStorageItem, storage: Storage) {
    super(item);
    this.storage = storage;
    this.init();
  }
  removeItem(key: string) {
    this.storage.removeItem(key);
  }
  setItem(key: string, value: string) {
    console.log("set", key, value);
    this.storage.setItem(key, value);
  }
  afterSubmit() {}
}

// export class CookieEditor extends BaseEditor {
//   items: VConsoleStorageItem[];
//   refresh: Function;
//   constructor(
//     item: VConsoleStorageItem,
//     items: VConsoleStorageItem[],
//     refresh: Function
//   ) {
//     super(item);
//     this.items = items;
//     this.refresh = refresh;
//   }
//   serilizeItem({ name, value } = this.item) {
//     return `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
//   }
//   syncCookie(items = this.items) {
//     console.log(items.map(this.serilizeItem).join("; "));
//     document.cookie = items.map(this.serilizeItem).join("; ");
//     this.refresh();
//   }
//   removeItem(key: string) {
//     this.items = this.items.filter((item) => item.name !== key);
//   }
//   setItem(key: string, value: string) {
//     let item = this.items.find((item) => item.name === key);
//     if (item) {
//       item.value = value;
//     } else {
//       this.items.push({ ...this.item, name: key, value });
//     }
//   }
//   afterSubmit() {
//     this.syncCookie();
//   }
// }
