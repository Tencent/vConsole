<script lang="ts">
  import { logListMap } from './log.model';
  import LogRow from './logRow.svelte';
  import LogCommand from './logCommand.svelte';

  export let pluginId: string = 'default';
  export let showCmd: boolean = false;

</script>

<div class:vc-log-has-cmd={showCmd}>
  {#each $logListMap[pluginId] as log}
    <LogRow log={log} />
  {/each}

  {#if showCmd}
    <LogCommand />
  {/if}

</div>

<style lang="less">
@import "../styles/var.less";

.vc-log-has-cmd {
  padding-bottom: (80em / @font);
}
</style>
