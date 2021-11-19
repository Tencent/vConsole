<script lang="ts">
  import Icon from '../component/icon.svelte';
  import IconCopy from '../component/iconCopy.svelte';
  import { VConsoleStorageModel } from './storage.model';
  import { getStringBytes, subString } from '../lib/tool';

  export let storages: ReturnType<VConsoleStorageModel["getAllStorages"]> = [];
  export let activedName = '';

  // edit state
  let editingIdx = -1;
  let editingKey = '';
  let editingVal = '';

  // force reload
  const handleRefresh = () => {
    storages = storages;
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

<div class="table">
  <div class="row">
    <div class="item item-key">Key</div>
    <div class="item item-value">Value</div>
    <div class="action" />
  </div>
  {#each storages as { name, storage }}
    {#if name === activedName}
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
      {:else}
        <div class="row row-empty">
          <div class="item">Empty</div>
        </div>
      {/each}
    {/if}
  {/each}
</div>

<style lang="less">
  @import '../styles/size.less';
  .table {
    margin: 0 8px;
    // padding-top: (30em / @font);
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
