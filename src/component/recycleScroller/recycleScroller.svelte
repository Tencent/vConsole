<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import RecycleItem from './recycleItem.svelte';
  import ScrollHandler from './scroll/scrollHandler';
  import TouchTracker from './scroll/touchTracker';
  import Style from './recycleScroller.less';
  import { useResizeObserver, hasResizeObserver } from './resizeObserver';
  import createRecycleManager from './recycleManager';

  // props
  export let items: any[];
  export let itemKey: string | undefined = undefined;
  export let itemHeight = undefined;
  export let buffer = 200;
  export let stickToBottom = false;
  export let scrollbar = false;

  // read-only, but visible to consumers via bind:start
  export let start = 0;
  export let end = 0;

  // local state
  let header: HTMLElement | undefined;
  let footer: HTMLElement | undefined;
  let viewport: HTMLElement | undefined;
  let contents: HTMLElement | undefined;
  let frame: HTMLElement | undefined;

  let headerHeight = 0;
  let footerHeight = 0;
  let viewportHeight = 0;
  let frameHeight = 0;

  let scrollbarThumbHeight = 100;
  let scrollbarThumbPos = 0;

  const heightMap = [];
  const topMap = [];
  // sort by key
  let visible: { key: number; index: number; show: boolean }[] = [];

  const updateVisible = createRecycleManager();
  const getScrollExtent = () => {
    return Math.max(0, frameHeight + headerHeight + footerHeight - viewportHeight);
  };
  const emptyEvent = () => {};

  let isOnBottom = true;
  let avoidRefresh = false;

  let oldItems = [];
  let isMounted = false;
  let isInited = false;
  let isObservable = hasResizeObserver();
  let scrollHandler: ScrollHandler;
  let touchTracker: TouchTracker;

  const registerHeightObserver = (
    getElem: () => HTMLElement | null,
    heightUpdater: (height: number) => void
  ) => {
    let observer: ResizeObserver | null;

    onMount(() => {
      const elem = getElem();
      if (elem) {
        heightUpdater(elem.getBoundingClientRect().height);
        if (observer) observer.disconnect();
        const ResizeObserverPolyfill = useResizeObserver();
        observer = new ResizeObserverPolyfill((entries) => {
          const entry = entries[0];
          heightUpdater(entry.contentRect.height);
        });

        observer.observe(elem);
      } else {
        heightUpdater(0);
        if (observer) {
          observer.disconnect();
          observer = null;
        }
      }
    });

    onDestroy(() => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    });
  };

  const initHandler = () => {
    if (!isObservable) { return; }
    scrollHandler = scrollHandler || new ScrollHandler(getScrollExtent, async (pos) => {
      // if (pos < 0) {
      //   ;(window as any)._vcOrigConsole.error('invalid pos', pos, new Error().stack);
      //   debugger
      // }
      const scrollExtent = getScrollExtent();
      isOnBottom = Math.abs(pos - scrollExtent) <= 1;

      contents.style.transform = `translateY(${-pos}px) translateZ(0)`;
      // (window as any)._vcOrigConsole.log('pos', pos);
      refreshScrollbar();

      if (avoidRefresh) {
        avoidRefresh = false;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 0));

        refresh(items, pos, viewportHeight);
      }
    });

    touchTracker = touchTracker || new TouchTracker(scrollHandler);
  };

  const initRegisterHeightObserver = () => {
    if (isInited || !isObservable) { return; }
    
    registerHeightObserver(
      () => viewport,
      async (height) => {
        if (viewportHeight === height) return;
        // (window as any)._vcOrigConsole.log("viewport height resize", height);
        viewportHeight = height;

        let y = 0
        for (let i = 0; i < items.length; i += 1) {
          y += heightMap[i];
        }
        frameHeight = Math.max(y, viewportHeight - footerHeight);
        frame.style.height = `${frameHeight}px`;

        // setTimeout to avoid ResizeObserver loop limit exceeded error
        await new Promise((resolve) => setTimeout(resolve, 0));

        initItems(items);
        refresh(items, scrollHandler.getPosition(), viewportHeight);
        if (viewportHeight !== 0) scrollToBottom(isOnBottom && stickToBottom);
        refreshScrollbar();
      }
    );

    registerHeightObserver(
      () => footer,
      (height) => {
        if (footerHeight === height) return;
        // ;(window as any)._vcOrigConsole.log('footer height resize', height);
        // no need to fresh
        footerHeight = height;

        let y = 0
        for (let i = 0; i < items.length; i += 1) {
          y += heightMap[i];
        }
        frameHeight = Math.max(y, viewportHeight - headerHeight - footerHeight);
        frame.style.height = `${frameHeight}px`;

        if (viewportHeight !== 0) scrollToBottom(isOnBottom && stickToBottom);
        refreshScrollbar();
      }
    );

    registerHeightObserver(
      () => header,
      (height) => {
        if (headerHeight === height) return;
        // ;(window as any)._vcOrigConsole.log('header height resize', height);
        // no need to fresh
        headerHeight = height;
        initItems(items);
        refreshScrollbar();
      }
    );
  };

  const refreshScrollbar = () => {
    const pos = scrollHandler.getPosition();
    const fac = 100 / (frameHeight + headerHeight + footerHeight);
    scrollbarThumbPos = pos * fac;
    scrollbarThumbHeight = viewportHeight * fac;
  };

  const scrollToBottom = (force?: boolean) => {
    const maxScrollHeight = getScrollExtent();
    if (force || scrollHandler.getPosition() > maxScrollHeight) {
      // (window as any)._vcOrigConsole.log(
      //   "scrollToBottom",
      //   force,
      //   scrollHandler.getPosition() > maxScrollHeight,
      //   maxScrollHeight
      // );
      scrollHandler.updatePosition(maxScrollHeight);
    }
  };

  const initItems = (items) => {
    init(items, viewportHeight, itemHeight);
  };

  // whenever `items` or `itemHeight` changes, refresh the viewport
  $: {
    if (isMounted) {
      if (!isObservable) {
        // hack: When the ResizeObserver is not available, use native scrolling.
        // At this time, the parent container should have an automatic height instead of a fixed height
        viewport.parentElement.style.height = 'auto';
      }
      initItems(items);
      isInited = true;
    }
  }

  function init(items, viewportHeight, itemHeight) {
    // preserve heightMap
    const itemsHeightMap = new Map<any, number>();

    // (window as any)._vcOrigConsole.log('init', isObservable);
    // let reuseHeightCount = 0;

    for (let i = 0; i < oldItems.length; i += 1) {
      const item = oldItems[i];
      const key = itemKey === undefined ? item : item[itemKey];
      itemsHeightMap.set(key, heightMap[i]);
    }
    topMap.length = heightMap.length = items.length;
    let y = 0;
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const key = itemKey === undefined ? item : item[itemKey];
      if (itemsHeightMap.has(key)) {
        heightMap[i] = itemsHeightMap.get(key);
        // reuseHeightCount += 1;
      } else {
        heightMap[i] = itemHeight;
      }
      topMap[i] = y;
      y += heightMap[i];
    }
    frameHeight = Math.max(y, viewportHeight - headerHeight - footerHeight);

    // (window as any)._vcOrigConsole.log("init(): frameHeight", frameHeight);
    // (window as any)._vcOrigConsole.log("heightMap", heightMap);
    // (window as any)._vcOrigConsole.log("reuseHeightCount", reuseHeightCount);
    // (window as any)._vcOrigConsole.log(
    //   "new height count",
    //   items.length - reuseHeightCount
    // );

    oldItems = items;

    if (isObservable) {
      refresh(items, scrollHandler.getPosition(), viewportHeight);
      frame.style.height = `${frameHeight}px`;
      scrollToBottom(isOnBottom && stickToBottom);
      refreshScrollbar();
    } else {
      refresh(items, 0, 9000000);
    }
  }

  function refresh(items: any[], scrollTop: number, viewportHeight: number) {
    let i = 0;
    let y = 0;

    while (i < items.length && y + heightMap[i] < scrollTop - buffer) {
      y += heightMap[i];
      i += 1;
    }

    start = i;

    while (
      i < items.length &&
      viewportHeight &&
      y < scrollTop + viewportHeight + buffer
    ) {
      y += heightMap[i];
      i += 1;
    }

    end = i;

    visible = updateVisible(items.length, start, end);
  }

  const onRowResize = async (index: number, height: number) => {
    if (heightMap[index] === height || viewportHeight === 0) return;

    // ;(window as any)._vcOrigConsole.log(
    //   "row resize",
    //   index,
    //   heightMap[index],
    //   height
    // );

    const oldHeight = heightMap[index];
    heightMap[index] = height;

    const n = items.length;
    for (let i = index; i < n - 1; i += 1) {
      topMap[i + 1] = topMap[i] + heightMap[i];
    }
    frameHeight = Math.max(
      topMap[n - 1] + heightMap[n - 1],
      viewportHeight - headerHeight - footerHeight
    );

    const scrollPos = scrollHandler.getPosition();

    avoidRefresh = true;
    if (topMap[index] + oldHeight < scrollPos) {
      scrollHandler.updatePosition(scrollPos + height - oldHeight);
    } else {
      scrollToBottom(isOnBottom && stickToBottom);
    }

    // ;(window as any)._vcOrigConsole.log(
    //   "topMap",
    //   topMap,
    // );

    await new Promise((resolve) => setTimeout(resolve, 0));

    // (window as any)._vcOrigConsole.log("frameHeight", frameHeight);
    refresh(items, scrollHandler.getPosition(), viewportHeight);
    frame.style.height = `${frameHeight}px`;
    refreshScrollbar();
  };

  // trigger initial refresh
  onMount(() => {
    isMounted = true;
    Style.use();
  });

  onDestroy(() => {
    Style.unuse();
  });

  if (isObservable) {
    initHandler();
    initRegisterHeightObserver();
  }

  export const handler = {
    scrollTo: (index: number) => {
      if (!isObservable) { return; }
      const itemPos = topMap[Math.max(0, Math.min(items.length - 1, index))];
      const scrollPos = Math.min(getScrollExtent(), itemPos);

      const maxDuration = 500;
      const minPixelsPerSecond = 2000;

      const duration = Math.min(
        Math.floor(
          (maxDuration * Math.abs(scrollHandler.getPosition() - scrollPos)) /
            minPixelsPerSecond
        ),
        maxDuration
      );

      scrollHandler.scrollTo(scrollPos, duration);
    },
  };
</script>

<div
  bind:this={viewport}
  on:touchstart={!isObservable ? emptyEvent : touchTracker.handleTouchStart}
  on:touchmove={!isObservable ? emptyEvent : touchTracker.handleTouchMove}
  on:touchend={!isObservable ? emptyEvent : touchTracker.handleTouchEnd}
  on:touchcancel={!isObservable ? emptyEvent : touchTracker.handleTouchCancel}
  on:wheel={!isObservable ? emptyEvent : touchTracker.handleWheel}
  class="vc-scroller-viewport"
  class:static={!isObservable}
>
  <div bind:this={contents} class="vc-scroller-contents">
    {#if $$slots.header}
      <div bind:this={header} class="vc-scroller-header">
        <slot name="header" />
      </div>
    {/if}
    <div bind:this={frame} class="vc-scroller-items">
      {#if items.length}
        {#each visible as row, i (row.key)}
          <RecycleItem
            show={row.show}
            top={topMap[row.index]}
            onResize={(height) => onRowResize(row.index, height)}
          >
            <slot name="item" item={items[row.index]}>Missing template</slot>
          </RecycleItem>
        {/each}
      {:else}
        <slot name="empty" />
      {/if}
    </div>
    {#if $$slots.footer}
      <div bind:this={footer} class="vc-scroller-footer">
        <slot name="footer" />
      </div>
    {/if}
  </div>
  {#if scrollbar}
    <div
      class="vc-scroller-scrollbar-track"
      style:display={scrollbarThumbHeight < 100 ? "block" : "none"}
    >
      <div
        class="vc-scroller-scrollbar-thumb"
        style:height="{scrollbarThumbHeight}%"
        style:top="{scrollbarThumbPos}%"
      />
    </div>
  {/if}
</div>
