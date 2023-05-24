<script lang='ts'>
  import { onMount, onDestroy } from 'svelte';
  import { isMatchedFilterText } from './logTool';
  import { VConsoleLogStore as Store } from './log.store';
  import LogRow from './logRow.svelte';
  import LogCommand from './logCommand.svelte';
  import Style from './log.less';
  import type { IConsoleLogMethod, IVConsoleLog } from './log.model';
  import RecycleScroller from '../component/recycleScroller/recycleScroller.svelte';
  import type { IVConsoleTabOptions } from '../lib/plugin';

  export let pluginId: string = 'default';
  export let showCmd: boolean = false;
  export let filterType: 'all' | IConsoleLogMethod = 'all';
  export let showTimestamps: boolean = false;

  let isInited: boolean = false;
  let filterText: string = '';
  let store: ReturnType<typeof Store.get>;
  let scrollerHandler;
  let logList: IVConsoleLog[] = [];

  $: {
    if (!isInited) {
      store = Store.get(pluginId);
      isInited = true;
      // (window as any)._vcOrigConsole.log('log.svelte init update', pluginId);
    }

    // (window as any)._vcOrigConsole.log('log.svelte update', pluginId);
    logList = $store.logList.filter((log) => {
      let ret = 
        // filterType
        (filterType === 'all' || filterType === log.type) &&
        // filterText
        (filterText === '' || isMatchedFilterText(log, filterText)) &&
        // group
        !log.groupCollapsed;
      return ret;
    });
  }

  onMount(() => {
    Style.use();
  });

  onDestroy(() => {
    Style.unuse();
  });

  const onFilterText = (e) => {
    filterText = e.detail.filterText || "";
  };

  const onGroupCollapsed = (e) => {
    const groupLabel = e.detail.groupLabel;
    const groupHeader = e.detail.groupHeader;
    const isGroupCollapsed = e.detail.isGroupCollapsed;
    // (window as any)._vcOrigConsole.log('log.svelte onGroupCollapsed', e.detail);
    store.update((st) => {
      st.logList.forEach((log) => {
        if (log.groupLabel === groupLabel) {
          if (log.groupHeader > 0) {
            // (window as any)._vcOrigConsole.log('log.svelte foreach', log);
            log.groupHeader = groupHeader;
          } else {
            log.groupCollapsed = isGroupCollapsed;
          }
        }
      });
      return st;
    });
    
  };

  export const scrollToTop = () => {
    scrollerHandler.scrollTo(0);
  };

  export const scrollToBottom = () => {
    scrollerHandler.scrollTo(logList.length - 1);
  };

  export const options: IVConsoleTabOptions = {
    fixedHeight: true,
  };
</script>

<div class="vc-plugin-content" class:vc-logs-has-cmd={showCmd}>
  <RecycleScroller
    items={logList}
    itemKey="_id"
    itemHeight={30}
    buffer={100}
    stickToBottom
    scrollbar
    bind:handler={scrollerHandler}
  >
    <div slot="empty" class="vc-plugin-empty">Empty</div>
    <LogRow
      slot="item"
      let:item={log}
      log={log}
      showTimestamps={showTimestamps}
      groupHeader={log.groupHeader}
      on:groupCollapsed={onGroupCollapsed}
    />
    <svelte:fragment slot="footer">
      {#if showCmd}
        <LogCommand on:filterText={onFilterText} />
      {/if}
    </svelte:fragment>
  </RecycleScroller>
</div>
