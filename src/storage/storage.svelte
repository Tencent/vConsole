<script lang="ts">
  import Icon from '../component/icon/icon.svelte';
  import IconCopy from '../component/icon/iconCopy.svelte';
  import { VConsoleStorageModel, storageStore } from './storage.model';
  import { getStringWithinLength } from '../lib/tool';

  // export let storages: ReturnType<VConsoleStorageModel['getAllStorages']> = [];
  // export let activedName = '';

  const model = VConsoleStorageModel.getSingleton(VConsoleStorageModel, 'VConsoleStorageModel');
  const { updateTime } = storageStore;

  const LEN_LIMIT = 1024;
  let storageData: [string, string][] = [];
  // edit state
  let editingIdx = -1;
  let editingKey = '';
  let editingVal = '';

  $: {
    if ($updateTime) {
      refreshData();
    }
  }

  const refreshData = async () => {
    // console.log('refreshData', $updateTime);
    resetEditState();
    storageData = await model.getEntries();
  };
  const resetEditState = () => {
    editingIdx = -1;
    editingKey = '';
    editingVal = '';
  };
  const properDisplay = (str: string) => {
    return getStringWithinLength(str, LEN_LIMIT);
  };

  const onTapDelete = async (key: string) => {
    await model.removeItem(key);
  };
  const onTapSave = async (key: string) => {
    if (editingKey !== key) {
      await model.removeItem(key); // dirty key
    }
    model.setItem(editingKey, editingVal); // set value anyway
    resetEditState(); // reset editing status
  };
  const onTapEdit = async (key: string, value: string, i: number) => {
    editingKey = key;
    editingVal = value;
    editingIdx = i;
  };
  const onTapCancelEdit = () => {
    resetEditState();
  };
</script>

<div class="vc-table">
  <div class="vc-table-row">
    <div class="vc-table-col">Key</div>
    <div class="vc-table-col vc-table-col-2">Value</div>
    <div class="vc-table-col vc-table-col-1 vc-table-action" />
  </div>
      {#each storageData as [k, v], i}
        <div class="vc-table-row">

          {#if editingIdx === i}
            <div class="vc-table-col">
              <textarea class="vc-table-input" bind:value={editingKey}></textarea>
            </div>
            <div class="vc-table-col vc-table-col-2">
              <textarea class="vc-table-input" bind:value={editingVal}></textarea>
            </div>
          {:else}
            <div class="vc-table-col">{k}</div>
            <div class="vc-table-col vc-table-col-2">{properDisplay(v)}</div>
          {/if}
          
          <div class="vc-table-col vc-table-col-1 vc-table-action">
            {#if editingIdx === i}
              <Icon name="cancel" on:click={onTapCancelEdit} />
              <Icon name="done" on:click={() => onTapSave(k)} />
            {:else}
              <Icon name="delete" on:click={() => onTapDelete(k)} />
              <IconCopy content={[k, v].join('=')} />
              <Icon name="edit" on:click={() => onTapEdit(k, v, i)} />
            {/if}
          </div>
        </div>
      {:else}
        <div class="vc-plugin-empty">Empty</div>
      {/each}
</div>
