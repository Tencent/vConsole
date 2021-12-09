<script lang="ts">
  // import { onMount, onDestroy } from 'svelte';
  import { isMatchedFilterText } from './logTool';
  // import { logStore } from './log.store';
  import { VConsoleLogStore as Store } from './log.store';
  import LogRow from './logRow.svelte';
  import LogCommand from './logCommand.svelte';
  import type { IConsoleLogMethod, IVConsoleLog } from './log.model';

  export let pluginId: string = 'default';
  export let showCmd: boolean = false;
  export let filterType: 'all' | IConsoleLogMethod = 'all';

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

  const onFilterText = (e) => {
    filterText = e.detail.filterText || '';
  };
</script>

<div class="vc-logs" class:vc-log-has-cmd={showCmd}>
  {#if $store && $store.logList.length > 0}
    {#each $store.logList as log (log._id)}
      {#if (
        // filterType
        filterType === 'all' || filterType === log.type)
        &&
        // filterText
        (filterText === '' || isMatchedFilterText(log, filterText)
      )}
        <LogRow log={log} />
      {/if}
    {/each}
  {:else}
    <div class="vs-logs-empty"></div>
  {/if}

  {#if showCmd}
    <LogCommand on:filterText={onFilterText} />
  {/if}

</div>

<style lang="less">
@import "../styles/var.less";

.vs-logs-empty:before {
  content: "Empty";
  color: var(--VC-FG-1);
  position: absolute;
  top: 45%;
  left: 0;
  right: 0;
  bottom: 0;
  font-size: (15em / @font);
  text-align: center;
}

.vc-log-has-cmd {
  padding-bottom: (80em / @font);
}
</style>
