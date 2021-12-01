<script lang="ts">
  import { logListMap } from './log.model';
  import LogRow from './logRow.svelte';

  export let pluginId: string = 'default';

</script>

<div>
  {#each $logListMap[pluginId] as log}
    <LogRow log={log} />
  {/each}
</div>
