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

<div class="vc-table">
  <div class="vc-table-row">
    <div class="vc-table-col">Key</div>
    <div class="vc-table-col vc-table-col-2">Value</div>
    <div class="vc-table-col vc-table-col-1 vc-table-action" />
  </div>
  {#each storages as { name, storage }}
    {#if name === activedName}
      {#each Object.entries(storage) as [k, v], i}
        <div class="vc-table-row">
          {#if editingIdx === i}
            <input class="vc-table-col " bind:value={editingKey} />
            <input class="vc-table-col vc-table-col-2" bind:value={editingVal} />
          {:else}
            <div class="vc-table-col">{k}</div>
            <div class="vc-table-col vc-table-col-2">{properDisplay(v)}</div>
          {/if}
          <div class="vc-table-col vc-table-col-1 vc-table-action">
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
        <div class="vc-table-row">
          <div class="vc-table-col vc-table-empty">Empty</div>
        </div>
      {/each}
    {/if}
  {/each}
</div>

<style lang="less">

</style>
