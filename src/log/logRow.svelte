<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as tool from '../lib/tool';
  import IconCopy from '../component/iconCopy.svelte';
  import LogValue from './logValue.svelte';
  import LogTree from './logTree.svelte';
  import Style from './logRow.less';
  import { VConsoleUninvocatableObject } from './logTool';
  import type { IVConsoleLog } from './log.model';

  export let log: IVConsoleLog;
  export let showTimestamps: boolean = false;

  let isInited: boolean = false;
  let logTime: string = '';

  const pad = (num, size) => {
    const s = '000' + num;
    return s.substring(s.length - size);
  };

  $: {
    // (window as any)._vcOrigConsole.log('logRow update', log._id, ...log.data);
    if (!isInited) {
      isInited = true;
    }

    if (showTimestamps && logTime === '') {
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
  
  const onTapCopy = () => {
    const text: string[] = [];
    try {
      for (let i = 0; i < log.data.length; i++) {
        // Only copy up to 10 levels of object depth and single key size up to 10KB
        text.push(tool.safeJSONStringify(log.data[i].origData, { maxDepth: 10, keyMaxLen: 10000, pretty: false }));
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
  >
    {#if showTimestamps}
      <div class="vc-log-time">{logTime}</div>
    {/if}
    {#if log.repeated}
      <div class="vc-log-repeat"><i>{log.repeated}</i></div>
    {/if}
    <div class="vc-log-content">
      {#each log.data as logData, i (i)}
        {#if isTree(logData.origData)}
          <LogTree origData={logData.origData} />
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
