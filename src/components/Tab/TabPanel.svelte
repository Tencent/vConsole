<script>
  import { getContext } from 'svelte';
  import { TabsContext } from './index';

  const panel = {};
  const { registerPanel, selectedPanel } = getContext(TabsContext);

  registerPanel(panel);
</script>

{#if $selectedPanel === panel}
  <slot />
{/if}
