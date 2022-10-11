<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { isMatchedFilterText } from './logTool';
  import { VConsoleLogStore as Store } from './log.store';
  import LogRow from './logRow.svelte';
  import LogCommand from './logCommand.svelte';
  import Style from './log.less';
  import type { IConsoleLogMethod, IVConsoleLog } from './log.model';
  import RecycleScroller from '../component/recycleScroller/recycleScroller.svelte';

  export let pluginId: string = 'default';
  export let showCmd: boolean = false;
  export let filterType: 'all' | IConsoleLogMethod = 'all';
  export let showTimestamps: boolean = false;

  let isInited: boolean = false;
  let filterText: string = '';
  let store: ReturnType<typeof Store.get>;
  let scrollerHandler

  $: {
    if (!isInited) {
      store = Store.get(pluginId);
      isInited = true;
      // (window as any)._vcOrigConsole.log('log.svelte update', pluginId);
    }
  }

  let logList: IVConsoleLog[] = []

  $: {
    logList = $store.logList.filter(log =>
      // filterType
      (filterType === 'all' || filterType === log.type)
      &&
      // filterText
      (filterText === '' || isMatchedFilterText(log, filterText))
    )
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

  export const scrollToTop = () => {
    scrollerHandler.scrollTo(0, 500)
  }

  export const scrollToBottom = () => {
    scrollerHandler.scrollTo(logList.length - 1, 500)
  }
</script>

<div class="vc-plugin-content" class:vc-logs-has-cmd={showCmd}>
  <RecycleScroller items={logList} itemHeight={30} buffer={100} stickToBottom bind:handler={scrollerHandler}>
    <div slot="empty" class="vc-plugin-empty">Empty</div>
    <LogRow slot="item" let:item={log} log={log} showTimestamps={showTimestamps} />
    <svelte:fragment slot="footer">
      {#if showCmd}
        <LogCommand on:filterText={onFilterText} />
      {/if}
    </svelte:fragment>
  </RecycleScroller>
</div>
