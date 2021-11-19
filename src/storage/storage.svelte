<script lang="ts">
  import { Tabs, TabList, TabPanel, Tab } from '../components/Tab';
  import { Btn } from '../components/Button';
  import Icon from '../component/icon.svelte';
  import IconCopy from '../component/iconCopy.svelte';
  import { VConsoleStorageModel } from './storage.model';
  import { getStringBytes, subString } from '../lib/tool';

  const storageModel = VConsoleStorageModel.getSingleton(VConsoleStorageModel);
  let storages = storageModel.getAllStorages();

  // edit state
  let editingIdx = -1;
  let editingKey = '';
  let editingVal = '';

  // force reload
  const handleRefresh = () => {
    storages = storages;
  };

  const onTapAdd = (storage: Storage) => {
    storage.setItem(`new_item_${Date.now()}`, 'new_value');
    handleRefresh();
  };

  const onTapDelete = (storage: Storage, idx: number) => {
    storage.removeItem(storage.key(idx) ?? '');
    handleRefresh();
  };
  const handleEditOrSave = (
    storage: Storage,
    key: string,
    value: string,
    i: number
  ) => {
    const save = editingIdx === i;
    if (save) {
      if (editingKey !== key) storage.removeItem(key); // dirty key
      storage.setItem(editingKey, editingVal); // set value anyway
      editingIdx = -1; // reset editing status
      handleRefresh();
    } else {
      editingKey = key;
      editingVal = value;
      editingIdx = i;
    }
  };
  const onTapCancelEdit = () => {
    editingIdx = -1;
  }
  const BYTES_LIMIT = 1024;
  const properDisplay = (str: string) => {
    const overlength = getStringBytes(str) > BYTES_LIMIT;
    return overlength ? subString(str, BYTES_LIMIT) : str;
  };
</script>

<Tabs>
  <div class="tab-list">
    <TabList>
      {#each storages as { name }}
        <Tab>{name}</Tab>
      {/each}
    </TabList>
  </div>

  {#each storages as { storage }}
    <TabPanel>
      <div class="table">
        <div class="row">
          <div class="item item-key">Key</div>
          <div class="item item-value">Value</div>
          <div class="action" />
        </div>
        {#if storage.length === 0}
          <div class="row row-empty">
            <div class="item">Empty</div>
          </div>
        {:else}
          {#each Object.entries(storage) as [k, v], i}
            <div class="row">
              {#if editingIdx === i}
                <input class="item item-key" bind:value={editingKey} />
                <input class="item item-value" bind:value={editingVal} />
              {:else}
                <div class="item item-key">{k}</div>
                <div class="item item-value">{properDisplay(v)}</div>
              {/if}
              <div class="action">
                {#if editingIdx === i}
                  <Icon name="cancel" on:click={onTapCancelEdit} />
                  <Icon name="done" on:click={() => handleEditOrSave(storage, k, v, i)} />
                {:else}
                  <Icon name="delete" on:click={() => onTapDelete(storage, i)} />
                  <IconCopy content={[k, v].join('=')} />
                  <Icon name="edit" on:click={() => handleEditOrSave(storage, k, v, i)} />
                {/if}
              </div>
            </div>
          {/each}
        {/if}
        <div class="row">
          <Btn class="item btn" on:click={() => onTapAdd(storage)}>
            <Icon name="add" />
            Add Item
          </Btn>
          <Btn class="item btn" on:click={() => handleRefresh()}>
            <Icon name="refresh" />
            Refresh
          </Btn>
        </div>
      </div>
    </TabPanel>
  {/each}
</Tabs>

<style lang="less">
  @import '../styles/size.less';
  .tab-list {
    position: fixed;
    width: 100%;
  }

  .table {
    margin: 0 8px;
    padding-top: (30em / @font);
  }
  .row {
    display: flex;
    :global(.item),
    :global(.action) {
      line-height: 2;
      border: 1px solid var(--VC-FG-3);
    }
    :global(.item) {
      flex: 2;
      overflow-x: hidden;
      text-overflow: ellipsis;
      :global(&.btn) {
        text-align: center;
      }
    }
    :global(.item-key) {
      flex: 1;
    }
    .action {
      flex: 1;
      display: flex;
      justify-content: space-evenly;
      :global(.vc-icon) {
        flex: 1;
        text-align: center;
        display: block;
        &:hover {
          background: var(--VC-BG-3);
        }
        &:active {
          background: var(--VC-BG-1);
        }
      }
    }
  }
  .row-empty {
    text-align: center;
  }
</style>
