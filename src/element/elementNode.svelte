<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { IVConsoleNode, activedNode } from './element.model';

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

<style lang="less">
/* color */
.vcelm-node {
  color: var(--VC-DOM-TAG-NAME-COLOR);
}
.vcelm-k {
  color: var(--VC-DOM-ATTRIBUTE-NAME-COLOR);
}
.vcelm-v {
  color: var(--VC-DOM-ATTRIBUTE-VALUE-COLOR);
}
.vcelm-l.vc-actived > .vcelm-node {
  background-color: var(--VC-FG-3);
}

/* layout */
.vcelm-l {
  padding-left: 8px;
  position: relative;
  word-wrap: break-word;
  line-height: 1.2;
}
/*.vcelm-l.vcelm-noc {
  padding-left: 0;
}*/
// .vcelm-l.vc-toggle > .vcelm-node {
//   display: block;
// }
.vcelm-l .vcelm-node:active {
  background-color: var(--VC-BG-COLOR-ACTIVE);
}
.vcelm-l.vcelm-noc .vcelm-node:active {
  background-color: transparent;
}
.vcelm-t {
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* level */
// .vcelm-l .vcelm-l {
//   display: none;
// }
// .vcelm-l.vc-toggle > .vcelm-l {
//   margin-left: 4px;
//   display: block;
// }


/* arrow */
.vcelm-l:before {
  content: "";
  display: block;
  position: absolute;
  top: 6px;
  left: 3px;
  width: 0;
  height: 0;
  border: transparent solid 3px;
  border-left-color: var(--VC-FG-1);
}
.vcelm-l.vc-toggle:before {
  display: block;
  top: 6px;
  left: 0;
  border-top-color: var(--VC-FG-1);
  border-left-color: transparent;
}
.vcelm-l.vcelm-noc:before {
  display: none;
}
</style>
