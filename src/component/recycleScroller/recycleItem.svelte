<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { useResizeObserver, hasResizeObserver } from './resizeObserver';

  export let show: boolean = !hasResizeObserver();
  export let top: boolean;
  export let onResize: (height: number) => void = () => {};

  let item: HTMLDivElement | undefined;
  let observer: ResizeObserver | null = null;
  let isObservable = hasResizeObserver();

  onMount(() => {
    if (show) {
      onResize(item.getBoundingClientRect().height);
    }
    if (isObservable) {
      const ResizeObserverPolyfill = useResizeObserver();
      observer = new ResizeObserverPolyfill((entries) => {
        const entry = entries[0];
        if (show) onResize(entry.contentRect.height)
      });
      observer.observe(item);
    }
  });

  onDestroy(() => {
    if (isObservable) {
      observer.disconnect();
    }
  });
</script>

<div
  bind:this={item}
  class="vc-scroller-item"
  style:display={show ? 'block' : 'none'}
  style:top="{isObservable ? top + 'px' : 'auto'}"
>
  <slot />
</div>
