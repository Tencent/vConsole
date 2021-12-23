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

  // $: {
  //   (window as any)._vcOrigConsole.log('logRow update', log._id, ...log.data);
  // }

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
    <div class="vc-logrow-icon">
      <IconCopy handler={onTapCopy} />
    </div>
    {#if log.repeated}
      <div class="vc-log-repeat">{log.repeated}</div>
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
  </div>
{/if}
