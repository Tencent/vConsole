<script>
  import { getContext } from 'svelte';
  import { TABS } from './Tabs.svelte';

  const tab = {};
  const { registerTab, selectTab, selectedTab } = getContext(TABS);

  registerTab(tab);
</script>

<button class:selected={$selectedTab === tab} on:click={() => selectTab(tab)}>
  <slot />
</button>

<style lang="less">
  @import '../../styles/size.less';

  button {
    outline: none;
    flex: 1;
    background: var(--VC-BG-1);
    border: none;
    border-bottom: 1px solid var(--VC-FG-3);
    border-radius: 0;
    margin: 0;
    color: var(--VC-FG-0);
    line-height: (30em / @font);
    &:hover {
      background: var(--VC-BG-2);
    }
    &:active {
      background: var(--VC-BG-0);
    }
  }

  .selected {
    border-bottom: 1px solid var(--VC-INDIGO);
  }
</style>
