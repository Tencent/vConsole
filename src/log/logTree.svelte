<script lang="ts">
  import * as tool from '../lib/tool';
  import LogValue from './logValue.svelte';
  import { VConsoleUninvocatableObject } from './logTool';

  export let origData: any;
  export let dataKey: string = undefined;
  export let keyType: '' | 'private' | 'symbol' = '';

  const KEY_PAGE_SIZE = 50;
  let isInited: boolean = false;
  let isToggle: boolean = false;
  let isTree: boolean = false;
  let isShowProto: boolean = false;
  let childEnumKeys: string[];
  let childNonEnumKeys: string[];
  let childSymbolKeys: symbol[];
  let childEnumKeyOffset = KEY_PAGE_SIZE;
  let childNonEnumKeyOffset = KEY_PAGE_SIZE;

  $: {
    if (!isInited) {
      isTree = !(origData instanceof VConsoleUninvocatableObject) && (tool.isArray(origData) || tool.isObject(origData));
      isInited = true;
    }

    if (isTree && isToggle) {
      // keys only need to be initialized once
      childEnumKeys = childEnumKeys || tool.sortArray(tool.getEnumerableKeys(origData));
      childNonEnumKeys = childNonEnumKeys || tool.sortArray(tool.getNonEnumerableKeys(origData));
      childSymbolKeys = childSymbolKeys || tool.getSymbolKeys(origData);
      isShowProto = tool.isObject(origData) && childNonEnumKeys.indexOf('__proto__') === -1;
    }
    // (window as any)._vcOrigConsole.log('logTree update');
  }

  const loadNextPageChildKeys = (keyType: 'enum' | 'nonEnum') => {
    if (keyType === 'enum') {
      childEnumKeyOffset += KEY_PAGE_SIZE;
    } else if (keyType === 'nonEnum') {
      childNonEnumKeyOffset += KEY_PAGE_SIZE;
    }
  };
  const getLoadMoreText = (count: number) => {
    return `(...${count} key${count > 1 ? 's' : ''} left)`;
  };
  const onTapTreeNode = () => {
    isToggle = !isToggle;
  };
  const getValueByKey = (key: any) => {
    // invocate some object's property may cause error,
    // DO NOT invocate `origData[key]` directly.
    try {
      return origData[key];
    } catch (e) {
      return new VConsoleUninvocatableObject();
    }
  };
</script>

<div class="vc-log-tree" class:vc-toggle={isToggle} class:vc-is-tree={isTree}>

  <div class="vc-log-tree-node" on:click={onTapTreeNode}>
    <LogValue origData={origData} dataKey={dataKey} keyType={keyType} />
  </div>

  {#if isTree && isToggle}
    <div class="vc-log-tree-child">
      {#each childEnumKeys as key, i (key)}
        {#if i < childEnumKeyOffset}
          <svelte:self origData={getValueByKey(key)} dataKey={key} />
        {/if}
      {/each}
      {#if childEnumKeyOffset < childEnumKeys.length}
        <div class="vc-log-tree-loadmore" on:click={() => loadNextPageChildKeys('enum')}>{getLoadMoreText(childEnumKeys.length - childEnumKeyOffset)}</div>
      {/if}

      {#each childSymbolKeys as key (key)}
        <svelte:self origData={getValueByKey(key)} dataKey={String(key)} keyType="symbol" />
      {/each}

      {#each childNonEnumKeys as key, i (key)}
        {#if i < childNonEnumKeyOffset}
          <svelte:self origData={getValueByKey(key)} dataKey={key} keyType="private" />
        {/if}
      {/each}
      {#if childNonEnumKeyOffset < childNonEnumKeys.length}
        <div class="vc-log-tree-loadmore" on:click={() => loadNextPageChildKeys('nonEnum')}>{getLoadMoreText(childNonEnumKeys.length - childNonEnumKeyOffset)}</div>
      {/if}

      {#if isShowProto}
        <svelte:self origData={getValueByKey('__proto__')} dataKey="__proto__" keyType="private" />
      {/if}
    </div>
  {/if}

</div>

<style lang="less">
@import "../styles/var.less";

// tree
.vc-log-tree {
  display: block;
  overflow: auto;
  position: relative;
  -webkit-overflow-scrolling: touch;
}

// tree node
.vc-log-tree-node {
  display: block;
  font-style: italic;
  padding-left: (10em / @font);
  position: relative;
}
.vc-log-tree.vc-is-tree > .vc-log-tree-node:active {
  background-color: var(--VC-BG-COLOR-ACTIVE);
}
.vc-log-tree.vc-is-tree > .vc-log-tree-node::before {
  content: "";
  position: absolute;
  top: (4em / @font);
  left: (2em / @font);
  width: 0;
  height: 0;
  border: transparent solid (4em / @font);
  border-left-color: var(--VC-FG-1);
}
.vc-log-tree.vc-is-tree.vc-toggle > .vc-log-tree-node::before {
  top: (6em / @font);
  left: 0;
  border-top-color: var(--VC-FG-1);
  border-left-color: transparent;
}

// tree child
.vc-log-tree-child {
  margin-left: (10em / @font);
}

// load more
.vc-log-tree-loadmore {
  text-decoration: underline;
  padding-left: (20em / @font);
  position: relative;
}
.vc-log-tree-loadmore::before {
  content: "›";
  position: absolute;
  top: (-2em / @font);
  left: (10em / @font);
  font-size: (16em / @font);
  color: var(--VC-CODE-KEY-FG);
}
.vc-log-tree-loadmore:active {
  background-color: var(--VC-BG-COLOR-ACTIVE);
}
</style>
