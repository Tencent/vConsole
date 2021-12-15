<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { activedNode } from './element.model';
  import type { IVConsoleNode } from './element.model';
  import Style from './elementNode.less';
  
  /*************************************
   * Public properties
   *************************************/

  export let node: IVConsoleNode;


  /*************************************
   * Inner properties and methods
   *************************************/

	const dispatch = createEventDispatcher();
  const trim = (str: string) => {
    return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };

  // Is `<link/>` or `<link></link>` ?
  const _nullEndTags = ['br', 'hr', 'img', 'input', 'link', 'meta'];
  const isNullEndTag = (node: IVConsoleNode) => {
    return _nullEndTags.indexOf(node.nodeName) > -1 ? true : false;
  };

  $: {
    if (node) {
      // console.log(node);
      node._isActived = node === $activedNode;
      node._isNullEndTag = isNullEndTag(node);
      node._isSingleLine = node.childNodes.length === 0 ? true : node._isNullEndTag;
    }
  }


  /*************************************
   * Lifecycle
   *************************************/

  onMount(() => {
    Style.use();
  });

  onDestroy(() => {
    Style.unuse();
  });


  /*************************************
   * Events
   *************************************/

  const onTapNode = () => {
    if (node._isNullEndTag) {
      return;
    }
    node._isExpand = !node._isExpand;
    dispatch('toggleNode', { node });
  };
</script>

{#if (node)}
  <div class="vcelm-l" class:vc-actived={node._isActived} class:vc-toggle={node._isExpand} class:vcelm-noc={node._isSingleLine}>
    {#if node.nodeType === Node['ELEMENT_NODE']}
      <span class="vcelm-node" on:click={onTapNode}>
        &lt;{node.nodeName}{#if (node.className || node.attributes.length)}
        <i class="vcelm-k">
          {#each node.attributes as attr}&nbsp;
            {#if (attr.value !== '')}
              {attr.name}="<i class="vcelm-v">{attr.value}</i>"{:else}{attr.name}{/if}{/each}</i>{/if}{#if node._isNullEndTag}/{/if}&gt;</span>{#if node.childNodes.length > 0}{#if !node._isExpand}...{:else}{#each node.childNodes as childNode}
        <svelte:self node={childNode} on:toggleNode />
      {/each}{/if}{/if}{#if !node._isNullEndTag}<span class="vcelm-node">&lt;/{node.nodeName}&gt;</span>{/if}
    {/if}
    {#if node.nodeType === Node['TEXT_NODE']}
      <span class="vcelm-t vcelm-noc">{trim(node.textContent)}</span>
    {/if}
  </div>
{/if}
