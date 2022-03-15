<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { isMatchedFilterText } from './logTool';
  import { VConsoleLogStore as Store } from './log.store';
  import LogRow from './logRow.svelte';
  import LogCommand from './logCommand.svelte';
  import Style from './log.less';
  import type { IConsoleLogMethod } from './log.model';

  export let pluginId: string = 'default';
  export let showCmd: boolean = false;
  export let filterType: 'all' | IConsoleLogMethod = 'all';
  export let showTimestamps: boolean = false;

  let isInited: boolean = false;
  let filterText: string = '';
  let store: ReturnType<typeof Store.get>;

  $: {
    if (!isInited) {
      store = Store.get(pluginId);
      isInited = true;
      // (window as any)._vcOrigConsole.log('log.svelte update', pluginId);
    }
  }

  onMount(() => {
    Style.use();
  });

  onDestroy(() => {
    Style.unuse();
  });

  const onFilterText = (e) => {
    filterText = e.detail.filterText || '';
  };
</script>

<div class="vc-plugin-content" class:vc-logs-has-cmd={showCmd}>
  {#if $store && $store.logList.length > 0}
    {#each $store.logList as log (log._id)}
      {#if (
        // filterType
        filterType === 'all' || filterType === log.type)
        &&
        // filterText
        (filterText === '' || isMatchedFilterText(log, filterText)
      )}
        <LogRow log={log} showTimestamps={showTimestamps} />
      {/if}
    {/each}
  {:else}
    <div class="vc-plugin-empty"></div>
  {/if}

  {#if showCmd}
    <LogCommand on:filterText={onFilterText} />
  {/if}

</div>
