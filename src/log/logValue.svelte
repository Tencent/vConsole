<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as tool from '../lib/tool';
  import { getValueTextAndType } from './logTool';
  import Style from './logValue.less';

  export let origData: any;
  export let style: string = '';
  export let dataKey: string = undefined;
  export let keyType: '' | 'private' | 'symbol' = '';

  let dataValue: string = '';
  let valueType: string = '';
  let isInited: boolean = false;
  let isInTree: boolean = false;

  $: {
    if (!isInited) {
      // the value is NOT in a tree when key is undefined
      isInTree = dataKey !== undefined;

      const ret = getValueTextAndType(origData, isInTree);
      valueType = ret.valueType;
      dataValue = ret.text;

      if (!isInTree && valueType === 'string') {
        // convert string
        dataValue = tool.htmlEncode(dataValue.replace(/\\n/g, '\n').replace(/\\t/g, '    '));
      }

      // (window as any)._vcOrigConsole.log('logValue update', origData);
      isInited = true;
    }
  }

  onMount(() => {
    Style.use();
  });

  onDestroy(() => {
    Style.unuse();
  });
</script>

{#if dataKey !== undefined}<i class="vc-log-key" class:vc-log-key-symbol={keyType === 'symbol'} class:vc-log-key-private={keyType === 'private'}>{tool.getVisibleText(dataKey)}</i>:{/if} <i class="vc-log-val vc-log-val-{valueType}" class:vc-log-val-haskey={dataKey !== undefined} style="{style}">
  {#if !isInTree && valueType === 'string'}
    {@html dataValue}
  {:else}
    {dataValue}
  {/if}
</i>
