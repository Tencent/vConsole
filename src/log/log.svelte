<script lang="ts">
  import { logListMap } from './log.model';
  import LogRow from './logRow.svelte';
  import LogCommand from './logCommand.svelte';

  export let pluginId: string = 'default';
  export let showCmd: boolean = false;

</script>

<div class="vc-logs" class:vc-log-has-cmd={showCmd}>
  {#each $logListMap[pluginId] as log}
    <LogRow log={log} />
  {:else}
    <div class="vs-logs-empty"></div>
  {/each}

  {#if showCmd}
    <LogCommand />
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
