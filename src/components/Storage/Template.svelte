<script lang="ts">
  import { Tabs, TabList, TabPanel, Tab } from "../Tab";
  import { cookiesStorage } from "../../lib/cookiesStorage";
  import copy from "copy-text-to-clipboard";
  import Fa from "svelte-fa";
  import {
    faCopy,
    faTrash,
    faEdit,
    faSave,
    faPlus,
  } from "@fortawesome/free-solid-svg-icons";

  interface IStorageItem {
    name: string;
    storage: Storage;
  }

  let storages: IStorageItem[] = [{ name: "cookies", storage: cookiesStorage }];
  if (globalThis.localStorage)
    storages.push({ name: "localStorage", storage: localStorage });
  if (globalThis.sessionStorage)
    storages.push({ name: "sessionStorage", storage: sessionStorage });

  let editIdx = -1;
  let editKey = "";
  let editValue = "";

  const handleAdd = (storage: Storage) => {
    const newIdx = storage.length + 1;
    storage.setItem(`new_item_${newIdx}`, "new_value");
    storages = storages;
  };

  const handleDel = (storage: Storage, idx: number) => {
    storage.removeItem(storage.key(idx) ?? "");
    storages = storages;
  };
  const handleCopy = (key: string, value: string) => {
    const text = [key, value].join("=");
    copy(text);
  };
  const handleEditOrSave = (
    storage: Storage,
    key: string,
    value: string,
    i: number
  ) => {
    const save = editIdx === i;
    if (save) {
      if (editKey !== key) {
        storage.removeItem(key);
      }
      storage.setItem(editKey, editValue);
      editIdx = -1;
      storages = storages;
    } else {
      editKey = key;
      editValue = value;
      editIdx = i;
    }
  };
</script>

<Tabs>
  <TabList>
    {#each storages as { name, storage }}
      <Tab>{name}</Tab>
    {/each}
  </TabList>

  {#each storages as { storage }}
    <TabPanel>
      <div class="table">
        {#each Object.entries(storage) as [k, v], i}
          <div class="row">
            {#if editIdx === i}
              <input class="item" bind:value={editKey} />
              <input class="item" bind:value={editValue} />
            {:else}
              <div class="item">{k}</div>
              <div class="item">{v}</div>
            {/if}

            <div class="action">
              <div on:click={() => handleDel(storage, i)}>
                <Fa icon={faTrash} />
              </div>
              <div on:click={() => handleCopy(k, v)}>
                <Fa icon={faCopy} />
              </div>
              <div on:click={() => handleEditOrSave(storage, k, v, i)}>
                <Fa icon={editIdx === i ? faSave : faEdit} />
              </div>
            </div>
          </div>
        {/each}
        <div class="row">
          <div class="item add" on:click={() => handleAdd(storage)}>
            <Fa icon={faPlus} />
            Add Item
          </div>
        </div>
      </div>
    </TabPanel>
  {/each}
</Tabs>

<style lang="less">
  .table {
    width: 100%;
    padding: 8px;
  }
  .row {
    display: flex;
    .item,
    .action {
      line-height: 2;
      border: 1px solid var(--VC-FG-3);
    }
    .item {
      flex: 2;
      &.add {
        text-align: center;
      }
    }
    .action {
      flex: 1;
      display: flex;
      justify-content: space-evenly;
      div {
        flex: 1;
        filter: invert(0.5);
        text-align: center;
        &:hover {
          filter: none;
        }
      }
    }
  }
</style>
