import { VConsoleSveltePlugin } from '../lib/sveltePlugin';
import { VConsoleStorageModel } from './storage.model';
import { default as StorageComp } from './storage.svelte';

export class VConsoleStoragePlugin extends VConsoleSveltePlugin {
  protected model = VConsoleStorageModel.getSingleton(VConsoleStorageModel, 'VConsoleStorageModel');
  protected onAddTopBarCallback: Function;

  constructor(id: string, name: string, renderProps = { }) {
    super(id, name, StorageComp, renderProps);
  }

  onInit() {
    this.onUpdateOption();
  }

  onShow() {
    this.compInstance.storages = this.model.getAllStorages();
    if (!this.compInstance.activedName) {
      this.setDefaultActivedName();
    }
  }

  onAddTopBar(callback: Function) {
    this.onAddTopBarCallback = callback;
    this.updateTopBar();
  }

  onAddTool(callback: Function) {
    const btnList = [
      {
        name: 'Add',
        global: false,
        onClick: () => {
          const storages = this.model.getAllStorages();
          for (const item of storages) {
            if (item.name === this.compInstance.activedName) {
              item.storage.setItem(`new_${Date.now()}`, 'new_value');
              this.compInstance.storages = this.compInstance.storages;
              break;
            }
          }
        },
      },
      {
        name: 'Refresh',
        global: false,
        onClick: () => {
          this.compInstance.storages = this.model.getAllStorages();
        },
      },
      {
        name: 'Clear',
        global: false,
        onClick: () => {
          const storages = this.model.getAllStorages();
          for (const item of storages) {
            if (item.name === this.compInstance.activedName) {
              item.storage.clear();
              this.compInstance.storages = this.compInstance.storages;
              break;
            }
          }
        },
      },
    ];
    callback(btnList);
  }

  public onUpdateOption() {
    if (typeof this.vConsole.option.storage?.defaultStorages !== 'undefined' && this.vConsole.option.storage?.defaultStorages !== this.model.defaultStorages) {
      this.model.defaultStorages = this.vConsole.option.storage?.defaultStorages || [];
      this.model.updateEnabledStorages();
      this.updateTopBar();
      if (!!this.compInstance.activedName && this.model.defaultStorages.indexOf(this.compInstance.activedName) === -1) {
        this.setDefaultActivedName();
      }
    }
  }

  protected setDefaultActivedName() {
    this.compInstance.activedName = this.compInstance.storages[0]?.name || '';
  }

  protected updateTopBar() {
    if (typeof this.onAddTopBarCallback !== 'function') {
      return;
    }
    const storages = this.model.getAllStorages();
    
    const btnList = [];
    for (let i = 0; i < storages.length; i++) {
      const name = storages[i].name;
      btnList.push({
        name: name[0].toUpperCase() + name.substring(1),
        data: {
          name: name,
        },
        actived: i === 0,
        onClick: (e: PointerEvent, data: { name: string }) => {
          if (data.name === this.compInstance.activedName) {
            return false;
          }
          this.compInstance.activedName = data.name;
        }
      });
    }
    this.onAddTopBarCallback(btnList);
  }
}
