import { VConsoleSveltePlugin } from '../lib/sveltePlugin';
import { VConsoleStorageModel } from './storage.model';
import { default as StorageComp } from './storage.svelte';

export class VConsoleStoragePlugin extends VConsoleSveltePlugin {
  protected model = VConsoleStorageModel.getSingleton(VConsoleStorageModel);

  constructor(id: string, name: string, renderProps = { }) {
    super(id, name, StorageComp, renderProps);
  }

  onShow() {
    this.compInstance.storages = this.model.getAllStorages();
    if (!this.compInstance.activedName) {
      this.compInstance.activedName = this.compInstance.storages[0].name;
    }
  }

  onAddTopBar(callback: Function) {
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
    btnList[0].className = 'vc-actived';
    callback(btnList);
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
    ];
    callback(btnList);
  }
}
