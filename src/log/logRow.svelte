<script lang="ts">
  import * as tool from '../lib/tool';
  import IconCopy from '../component/iconCopy.svelte';
  import LogValue from './logValue.svelte';
  import LogTree from './logTree.svelte';
  import type { IVConsoleLog } from './log.model';

  export let log: IVConsoleLog;
  
  const onTapCopy = () => {
    let text: string[] = [];
    try {
      for (let i = 0; i < log.data.length; i++) {
        // Only copy up to 10 levels of object depth and single key size up to 10KB
        text.push(tool.safeJSONStringify(log.data[i].origData, 10, 10000));
      }
    } catch (e) {
      // do nothing
    }
    return text.join(' ');
  };
</script>

{#if log}
  <div id="{log._id}" class="vc-log-row vc-log-{log.type}">
    <div class="vc-logrow-icon">
      <IconCopy handler={onTapCopy} />
    </div>
    <div class="vc-log-content">
      {#each log.data as logData}
        {#if logData.isTree}
          <LogTree origData={logData.origData} />
        {:else}
          <LogValue origData={logData.origData} />
        {/if}
      {/each}
    </div>
  </div>
{/if}

<style lang="less">
@import "../styles/var.less";

.vc-log-row {
  margin: 0;
  padding: (6em / @font) (8em / @font);
  overflow: hidden;
  line-height: 1.3;
  border-bottom: 1px solid var(--VC-FG-3);
  word-break: break-word;
}
.vc-log-info {
  color: var(--VC-PURPLE);
}
.vc-log-debug {
  color: var(--VC-YELLOW);
}
.vc-log-warn {
  color: var(--VC-ORANGE);
  border-color: var(--VC-WARN-BORDER);
  background-color: var(--VC-WARN-BG);
}
.vc-log-error {
  color: var(--VC-RED);
  border-color: var(--VC-ERROR-BORDER);
  background-color: var(--VC-ERROR-BG);
}

.vc-logrow-icon {
  float: right;
}
</style>
