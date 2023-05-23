<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { ResizeObserverPolyfill } from './resizeObserver';

  export let show: boolean;
  export let top: boolean;

  export let onResize: (height: number) => void = () => {};

  let item: HTMLDivElement | undefined;

  let observer: ResizeObserver | null = null;

  onMount(() => {
    if (show) {
      onResize(item.getBoundingClientRect().height);
    }
    observer = new ResizeObserverPolyfill((entries) => {
      const entry = entries[0];
      if (show) onResize(entry.contentRect.height)
    });
    observer.observe(item);
  });

  onDestroy(() => {
    observer.disconnect();
  });
</script>

<div
  bind:this={item}
  class="vc-scroller-item"
  style:display={show ? "block" : "none"}
  style:top="{top}px"
>
  <slot />
</div>
