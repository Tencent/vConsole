<svelte:options immutable/>
<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import * as tool from '../lib/tool';
  import IconCopy from '../component/icon/iconCopy.svelte';
  import LogValue from './logValue.svelte';
  import LogTree from './logTree.svelte';
  import Style from './logRow.less';
  import { VConsoleUninvocatableObject } from './logTool';
  import type { IVConsoleLog } from './log.model';

  export let log: IVConsoleLog;
  export let showTimestamps: boolean = false;
  export let groupHeader: 0 | 1 | 2 = 0;

  const dispatch = createEventDispatcher();
  let logTime: string = '';

  const pad = (num, size) => {
    const s = '000' + num;
    return s.substring(s.length - size);
  };

  $: {
    // (window as any)._vcOrigConsole.log('logRow update', log._id, ...log.data);
    if (showTimestamps) {
      const d = new Date(log.date);
      logTime = pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2) + ':' + pad(d.getSeconds(), 2) + ':' + pad(d.getMilliseconds(), 3);
    }
  }

  onMount(() => {
    Style.use();
  });

  onDestroy(() => {
    Style.unuse();
  });

  const isTree = (origData: any) => {
    return !(origData instanceof VConsoleUninvocatableObject) && (tool.isArray(origData) || tool.isObject(origData));
  };

  const onTapLogRow = () => {
    if (groupHeader > 0) {
      // (window as any)._vcOrigConsole.log('onTapLogRow', groupHeader);
      dispatch('groupCollapsed', {
        groupLabel: log.groupLabel,
        groupHeader: groupHeader === 1 ? 2 : 1,
        isGroupCollapsed: groupHeader === 1 ? true : false,
      });
    }
  };

  const onTapCopy = () => {
    const text: string[] = [];
    try {
      for (let i = 0; i < log.data.length; i++) {
        if (tool.isString(log.data[i].origData) || tool.isNumber(log.data[i].origData)) {
          text.push(log.data[i].origData);
        } else {
          // Only copy up to 10 levels of object depth and single key size up to 10KB
          text.push(tool.safeJSONStringify(log.data[i].origData, { maxDepth: 10, keyMaxLen: 10000, pretty: false, standardJSON: true }));
        }
      }
    } catch (e) {
      // do nothing
    }
    return text.join(' ');
  };
</script>

{#if log}
  <div
    class="vc-log-row vc-log-{log.type}"
    class:vc-log-input={log.cmdType === 'input'}
    class:vc-log-output={log.cmdType === 'output'}
    class:vc-log-group={groupHeader > 0}
    class:vc-toggle={groupHeader === 1}
    on:click={onTapLogRow}
  >
    {#if log.groupLevel}
      {#each new Array(log.groupLevel) as lv}
        <i class="vc-log-padding"></i>
      {/each}
    {/if}
    {#if groupHeader > 0}
      <div class="vc-log-group-toggle"></div>
    {/if}
    {#if showTimestamps}
      <div class="vc-log-time">{logTime}</div>
    {/if}
    {#if log.repeated}
      <div class="vc-log-repeat"><i>{log.repeated}</i></div>
    {/if}
    <div class="vc-log-content">
      {#each log.data as logData, i (i)}
        {#if isTree(logData.origData)}
          <LogTree origData={logData.origData} keyPath={String(i)} toggle={log.toggle} />
        {:else}
          <LogValue origData={logData.origData} style={logData.style} />
        {/if}
      {/each}
    </div>
    <div class="vc-logrow-icon">
      <IconCopy handler={onTapCopy} />
    </div>
  </div>
{/if}
