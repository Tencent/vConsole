<script lang="ts">
  import copy from 'copy-text-to-clipboard';
  import * as tool from '../../lib/tool';
  import Icon from './icon.svelte';

  export let content: any = '';
  export let handler: (content: any) => string = undefined;

  const copyOptions = { target: document.documentElement };
  let showSuc = false;

  const onTapIcon = async (e) => {
    let text = content;
    if (tool.isFunction(handler)) {
      text = handler(content) || '';
    } else {
      if (tool.isObject(content) || tool.isArray(content)) {
        text = tool.safeJSONStringify(content, {
          maxDepth: 10,
          keyMaxLen: 10000,
          pretty: false,
          standardJSON: true,
        });
      } else {
        text = content;
      }
    }
    if (
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {}
    } else {
      copy(text, copyOptions);
    }
    showSuc = true;
    setTimeout(() => {
      showSuc = false;
    }, 600);
  };
</script>

<Icon name="{showSuc ? 'success' : 'copy'}" on:click={onTapIcon}/>
