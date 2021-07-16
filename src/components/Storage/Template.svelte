<script lang="ts">
  import { Tabs, TabList, TabPanel, Tab } from '../Tab';
  import copy from 'copy-text-to-clipboard';
  import Fa from 'svelte-fa';
  import {
    faCopy,
    faTrash,
    faEdit,
    faSave,
    faPlus,
    faSync,
  } from '@fortawesome/free-solid-svg-icons';
  import { Btn } from '../Button';
  import { getAllStorages } from './utils';
  import { getStringBytes, subString } from '../../lib/tool';

  let storages = getAllStorages();

  // edit state
  let editingIdx = -1;
  let editingKey = '';
  let editingVal = '';

  // force reload
  const handleRefresh = () => {
    storages = storages;
  };

  const handleAdd = (storage: Storage) => {
    storage.setItem(`new_item_${Date.now()}`, 'new_value');
    handleRefresh();
  };

  const handleDel = (storage: Storage, idx: number) => {
    storage.removeItem(storage.key(idx) ?? '');
    handleRefresh();
  };
  const handleCopy = (key: string, value: string) => {
    const text = [key, value].join('=');
    copy(text);
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
                <div on:click={() => handleDel(storage, i)}>
                  <Fa icon={faTrash} />
                </div>
                <div on:click={() => handleCopy(k, v)}>
                  <Fa icon={faCopy} />
                </div>
                <div on:click={() => handleEditOrSave(storage, k, v, i)}>
                  <Fa icon={editingIdx === i ? faSave : faEdit} />
                </div>
              </div>
            </div>
          {/each}
        {/if}
        <div class="row">
          <Btn class="item btn" on:click={() => handleAdd(storage)}>
            <Fa icon={faPlus} />
            Add Item
          </Btn>
          <Btn class="item btn" on:click={() => handleRefresh()}>
            <Fa icon={faSync} />
            Refresh
          </Btn>
        </div>
      </div>
    </TabPanel>
  {/each}
</Tabs>

<style lang="less">
  @import '../../styles/size.less';
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
      div {
        flex: 1;
        text-align: center;
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
