import { get } from 'svelte/store';
import { isArray } from '../lib/tool';
import { VConsoleSveltePlugin } from '../lib/sveltePlugin';
import { VConsoleStorageModel, storageStore } from './storage.model';
import { default as StorageComp } from './storage.svelte';

export class VConsoleStoragePlugin extends VConsoleSveltePlugin {
  protected model = VConsoleStorageModel.getSingleton(VConsoleStorageModel, 'VConsoleStorageModel');
  protected onAddTopBarCallback: Function;

  constructor(id: string, name: string, renderProps = { }) {
    super(id, name, StorageComp, renderProps);
  }

  public onReady() {
    super.onReady();
    this.onUpdateOption();
  }

  public onShow() {
    this.model.refresh();
  }

  public onAddTopBar(callback: Function) {
    this.onAddTopBarCallback = callback;
    this.updateTopBar();
  }

  public onAddTool(callback: Function) {
    const btnList = [
      {
        name: 'Add',
        global: false,
        onClick: () => {
          this.model.setItem(`new_${Date.now()}`, 'new_value');
        },
      },
      {
        name: 'Refresh',
        global: false,
        onClick: () => {
          this.model.refresh();
        },
      },
      {
        name: 'Clear',
        global: false,
        onClick: () => {
          this.model.clear();
        },
      },
    ];
    callback(btnList);
  }

  public onUpdateOption() {
    let defaultStorages = this.vConsole.option.storage?.defaultStorages;
    if (isArray(defaultStorages)) {
      defaultStorages = defaultStorages.length > 0 ? defaultStorages : ['cookies'];
      if (defaultStorages !== get(storageStore.defaultStorages)) {
        storageStore.defaultStorages.set(defaultStorages);
        storageStore.activedName.set(defaultStorages[0]);
        this.updateTopBar();
      }
    }
  }

  protected updateTopBar() {
    if (typeof this.onAddTopBarCallback !== 'function') {
      return;
    }
    const defaultStorages = get(storageStore.defaultStorages);
    
    const btnList = [];
    for (let i = 0; i < defaultStorages.length; i++) {
      const name = defaultStorages[i];
      btnList.push({
        name: name[0].toUpperCase() + name.substring(1),
        data: {
          name: name,
        },
        actived: name === get(storageStore.activedName),
        onClick: (e: PointerEvent, data: { name: string }) => {
          const activedName = get(storageStore.activedName);
          if (data.name === activedName) {
            return false;
          }
          storageStore.activedName.set(<typeof activedName>data.name);
          this.model.refresh();
        }
      });
    }
    this.onAddTopBarCallback(btnList);
  }
}
