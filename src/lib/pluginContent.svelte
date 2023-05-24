<script lang="ts">
  import { onMount } from 'svelte';
  import { isElement, isString } from './tool';

  /*************************************
   * Public properties
   *************************************/

  export let pluginId = '';
  export let fixedHeight = false;
  export let actived = false;
  export let content: HTMLElement | string = undefined;

  
  /*************************************
   * Inner properties
   *************************************/
  
  let container: HTMLElement = undefined;
  let previousId = undefined;

  $: {
    if (previousId !== pluginId && content && container) {
      // console.log('pluginContent onChange', pluginId, previousId)
      previousId = pluginId;
      container.innerHTML = '';
      if (isString(content)) {
        container.innerHTML = <string>content;
      } else if (isElement(content)) {
        container.appendChild(<HTMLElement>content);
      }
    }
  }

  /*************************************
   * Lifecycle
   *************************************/

  // onMount(() => {
  //   console.log('pluginContent onMount', pluginId)
  // });
</script>

<div
  bind:this={container}
  id="__vc_plug_{pluginId}"
  class="vc-plugin-box"
  class:vc-fixed-height="{fixedHeight}"
  class:vc-actived="{actived}"
>
</div>