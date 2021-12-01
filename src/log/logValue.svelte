<script lang="ts">
  import * as tool from '../lib/tool';
  import { getValueTextAndType } from './log.model';
  import type { IVConsoleLogData } from './log.model';

  export let origData: any;
  export let dataKey: string = undefined;
  export let keyType: '' | 'private' | 'symbol' = '';

  let dataValue: string = '';
  let valueType: string = '';
  let isInTree: boolean = false;

  $: {
    // the value is NOT in a tree when key is undefined
    isInTree = dataKey !== undefined;
    
    const ret = getValueTextAndType(origData, isInTree);
    valueType = ret.valueType;
    dataValue = ret.text;

    if (!isInTree && valueType === 'string') {
      // convert string
      dataValue = tool.htmlEncode(dataValue.replace('\\n', '\n').replace('\\t', '\t'));
    }
  }
</script>

{#if dataKey !== undefined}<i class="vc-log-key" class:vc-log-key-symbol={keyType === 'symbol'} class:vc-log-key-private={keyType === 'private'}>{dataKey}</i>:{/if} <i class="vc-log-val vc-log-val-{valueType}" class:vc-log-val-haskey={dataKey !== undefined}>
  {#if !isInTree && valueType === 'string'}
    {@html dataValue}
  {:else}
    {dataValue}
  {/if}
</i>

<style lang="less">
// keys
.vc-log-key {
  color: var(--VC-CODE-KEY-FG);
}
.vc-log-key-private {
  color: var(--VC-CODE-PRIVATE-KEY-FG);
}

// values
.vc-log-val {
  white-space: pre-line;
}
.vc-log-val-function {
  color: var(--VC-CODE-FUNC-FG);
  font-style: italic !important;
}
.vc-log-val-bigint {
  color: var(--VC-CODE-FUNC-FG);
}
.vc-log-val-number,
.vc-log-val-boolean {
  color: var(--VC-CODE-NUMBER-FG);
}
.vc-log-val-string.vc-log-val-haskey {
  color: var(--VC-CODE-STR-FG);
  white-space: normal;
}
.vc-log-val-null,
.vc-log-val-undefined {
  color: var(--VC-CODE-NULL-FG);
}
.vc-log-val-symbol {
  color: var(--VC-CODE-STR-FG);
}
</style>
