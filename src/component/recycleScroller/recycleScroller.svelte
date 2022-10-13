<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import RecycleItem from "./recycleItem.svelte";
  import ScrollHandler from "./scroll/scrollHandler";
  import TouchTracker from "./scroll/touchTracker";
  import Style from "./recycleScroller.less";

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
  let footer: HTMLElement | undefined;
  let viewport: HTMLElement | undefined;
  let contents: HTMLElement | undefined;
  let frame: HTMLElement | undefined;

  let footerHeight = 0;
  let viewportHeight = 0;
  let frameHeight = 0;

  let scrollbarThumbHeight = 100;
  let scrollbarThumbPos = 0;

  let heightMap = [];
  let topMap = [];
  // sort by key
  let visible: { key: number; index: number; data: any; show: boolean }[] = [];
  // sort by index
  let orderedVisible: {
    key: number;
    index: number;
    data: any;
    show: boolean;
  }[] = [];

  const updateVisible = (start, end) => {
    // (window as any)._vcOrigConsole.log("updateVisible", start, end);
    const newVisible: {
      key: number;
      index: number;
      data: any;
      show: boolean;
    }[] = [];
    // const visibleCount = end - start
    const poolCount = orderedVisible.length;
    // ;(window as any)._vcOrigConsole.log('poolCount', poolCount)

    if (poolCount === 0) {
      for (let i = start; i < end; i += 1) {
        newVisible.push({
          key: i - start,
          index: i,
          data: items[i],
          show: true,
        });
      }
      orderedVisible = newVisible;
      visible = newVisible.slice().sort((a, b) => a.key - b.key);
      return;
    }

    const firstPool = orderedVisible[0].index;
    const lastPool = orderedVisible[poolCount - 1].index + 1;

    // ;(window as any)._vcOrigConsole.log('firstPool', firstPool)
    // ;(window as any)._vcOrigConsole.log('lastPool', lastPool)

    // 计算新的 visible 区域
    const newFirstPool =
      start <= lastPool
        ? // 1. 开头一定在 [0, start]
          Math.max(
            0,
            Math.min(
              start,
              // 2. 开头一定在 [firstPool, lastPool) 之间
              Math.max(firstPool, Math.min(lastPool - 1, end - poolCount))
            )
          )
        : start; // lastPool 如果比 start 小，则前部无法保留下来

    const newLastPool =
      firstPool <= end
        ? // 1. 结尾一定在 [end, items.length] 之间
          Math.max(
            end,
            Math.min(
              items.length,
              // 2. 结尾一定在 (firstPool, lastPool] 之间
              Math.max(
                firstPool + 1,
                Math.min(lastPool, newFirstPool + poolCount)
              )
            )
          )
        : end; // end 如果比 firstPool 小，则后部无法保留下来

    // ;(window as any)._vcOrigConsole.log('newFirstPool', newFirstPool)
    // ;(window as any)._vcOrigConsole.log('newLastPool', newLastPool)

    if (newLastPool - newFirstPool < poolCount) {
      // 数量少于上次，无法复用，全都重新生成
      for (let i = start; i < end; i += 1) {
        newVisible.push({
          key: i - start,
          index: i,
          data: items[i],
          show: true,
        });
      }
      orderedVisible = newVisible;
      visible = newVisible.slice().sort((a, b) => a.key - b.key);
      return;
    }

    let usedPoolIndex = 0;
    let usedPoolOffset = 0;

    // 复用区域
    let reuseStart = 0;
    let reuseEnd = 0;

    if (lastPool < newFirstPool || newLastPool < firstPool) {
      // 完全没有交集，随便复用
      reuseStart = newFirstPool;
      reuseEnd = newFirstPool + poolCount;
    } else if (firstPool < newFirstPool) {
      // 开头复用
      usedPoolOffset = newFirstPool - firstPool;
      reuseStart = newFirstPool;
      reuseEnd = newFirstPool + poolCount;
    } else if (newLastPool < lastPool) {
      // 尾部复用
      usedPoolOffset = poolCount - (lastPool - newLastPool);
      reuseStart = newLastPool - poolCount;
      reuseEnd = newLastPool;
    } else if (newFirstPool <= firstPool && lastPool <= newLastPool) {
      // 新的 visible 是完全子集，直接复用
      reuseStart = firstPool;
      reuseEnd = lastPool;
    }

    // ;(window as any)._vcOrigConsole.log('usedPoolIndex', usedPoolIndex)
    // ;(window as any)._vcOrigConsole.log('usedPoolOffset', usedPoolOffset)
    // ;(window as any)._vcOrigConsole.log('reuseStart', reuseStart)
    // ;(window as any)._vcOrigConsole.log('reuseEnd', reuseEnd)

    // 开头不可见区域
    // 如果有不可见区域，则一定是来自上一次 visible 的复用 row
    for (let i = newFirstPool; i < start; i += 1, usedPoolIndex += 1) {
      const pool = orderedVisible[(usedPoolOffset + usedPoolIndex) % poolCount];
      newVisible.push({
        key: pool.key,
        index: i,
        data: items[i],
        show: false,
      });
    }

    // 可见区域
    for (let i = start, keyIndex = 0; i < end; i += 1) {
      let key;
      if (reuseStart <= i && i < reuseEnd) {
        // 复用 row
        const pool =
          orderedVisible[(usedPoolOffset + usedPoolIndex) % poolCount];
        key = pool.key;
        usedPoolIndex += 1;
      } else {
        // 新建 row
        key = poolCount + keyIndex;
        keyIndex += 1;
      }
      newVisible.push({
        key,
        index: i,
        data: items[i],
        show: true,
      });
    }

    // 末尾不可见区域
    // 如果有不可见区域，则一定是来自上一次 visible 的复用 row
    for (let i = end; i < newLastPool; i += 1, usedPoolIndex += 1) {
      const pool = orderedVisible[(usedPoolOffset + usedPoolIndex) % poolCount];
      newVisible.push({
        key: pool.key,
        index: i,
        data: items[i],
        show: false,
      });
    }

    orderedVisible = newVisible;
    visible = newVisible.slice().sort((a, b) => a.key - b.key);
    // (window as any)._vcOrigConsole.log("orderedVisible", orderedVisible);
    // (window as any)._vcOrigConsole.log("visible", visible);
  };

  const getScrollExtent = () =>
    Math.max(0, frameHeight + footerHeight - viewportHeight);

  let isOnBottom = true;
  let avoidRefresh = false;

  const scrollHandler = new ScrollHandler(getScrollExtent, async (pos) => {
    // if (pos < 0) {
    //   ;(window as any)._vcOrigConsole.error('invalid pos', pos, new Error().stack);
    //   debugger
    // }
    const scrollExtent = getScrollExtent();
    isOnBottom = Math.abs(pos - scrollExtent) <= 1;

    contents.style.transform = `translateY(${-pos}px) translateZ(0)`;
    refreshScrollbar();

    if (avoidRefresh) {
      avoidRefresh = false;
    } else {
      await new Promise(resolve => setTimeout(resolve, 0))

      refresh(items, pos, viewportHeight, false);
    }
  });

  const refreshScrollbar = () => {
    const pos = scrollHandler.getPosition();
    const fac = 100 / (frameHeight + footerHeight);
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

  function initItems(items) {
    return init(items, viewportHeight, itemHeight);
  }

  let oldItems = [];
  let mounted;

  // whenever `items` or `itemHeight` changes, refresh the viewport
  $: if (mounted) initItems(items);

  function init(items, viewportHeight, itemHeight) {
    // preserve heightMap
    const itemsHeightMap = new Map<any, number>();

    // (window as any)._vcOrigConsole.log("init");
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
    frameHeight = Math.max(y, viewportHeight - footerHeight);

    // (window as any)._vcOrigConsole.log("heightMap", heightMap);
    // (window as any)._vcOrigConsole.log("reuseHeightCount", reuseHeightCount);
    // (window as any)._vcOrigConsole.log(
    //   "new height count",
    //   items.length - reuseHeightCount
    // );

    oldItems = items;

    refresh(items, scrollHandler.getPosition(), viewportHeight, true);
    frame.style.height = `${frameHeight}px`;
    scrollToBottom(isOnBottom && stickToBottom);
    refreshScrollbar();
  }

  function refresh(
    items: any[],
    scrollTop: number,
    viewportHeight: number,
    force: boolean
  ) {
    // (window as any)._vcOrigConsole.error(
    //   "refresh",
    //   items.length,
    //   scrollTop,
    //   viewportHeight
    // );

    let i = 0;
    let y = 0;
    let oldStart = start;
    let oldEnd = end;

    while (i < items.length && y + heightMap[i] < scrollTop - buffer) {
      y += heightMap[i];
      i += 1;
    }
    // (window as any)._vcOrigConsole.error("refresh start", i, y);

    start = i;

    while (
      i < items.length &&
      viewportHeight &&
      y < scrollTop + viewportHeight + buffer
    ) {
      y += heightMap[i];
      i += 1;
    }
    // (window as any)._vcOrigConsole.error("refresh end", i, y);

    end = i;

    if (oldStart !== start || oldEnd !== end || force) {
      updateVisible(start, end);
    }
  }

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
        observer = new ResizeObserver((entries) => {
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

  registerHeightObserver(
    () => viewport,
    async (height) => {
      if (viewportHeight === height) return;
      // (window as any)._vcOrigConsole.log("viewport height resize", height);
      viewportHeight = height;

      // setTimeout to avoid ResizeObserver loop limit exceeded error
      await new Promise((resolve) => setTimeout(resolve, 0));

      refresh(items, scrollHandler.getPosition(), viewportHeight, false);
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
      if (viewportHeight !== 0) scrollToBottom(isOnBottom && stickToBottom);
      refreshScrollbar();
    }
  );

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
      viewportHeight - footerHeight
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
    refresh(items, scrollHandler.getPosition(), viewportHeight, false);
    frame.style.height = `${frameHeight}px`;
    refreshScrollbar();
  };

  // trigger initial refresh
  onMount(() => {
    mounted = true;
    Style.use();
  });

  onDestroy(() => {
    Style.unuse();
  });

  const touchTracker = new TouchTracker(scrollHandler);

  export const handler = {
    scrollTo: (index: number, duration?: number) => {
      const itemPos = topMap[Math.max(0, Math.min(items.length - 1, index))];
      const scrollPos = Math.min(getScrollExtent(), itemPos);

      scrollHandler.scrollTo(scrollPos, duration);
    },
  };
</script>

<div
  bind:this={viewport}
  on:touchstart={touchTracker.handleTouchStart}
  on:touchmove={touchTracker.handleTouchMove}
  on:touchend={touchTracker.handleTouchEnd}
  on:touchcancel={touchTracker.handleTouchCancel}
  on:wheel={touchTracker.handleWheel}
  class="vc-scroller-viewport"
>
  <div bind:this={contents} class="vc-scroller-contents">
    <div bind:this={frame} class="vc-scroller-items">
      {#if items.length}
        {#each visible as row, i (row.key)}
          <RecycleItem
            show={row.show}
            top={topMap[row.index]}
            onResize={(height) => onRowResize(row.index, height)}
          >
            <slot name="item" item={row.data}>Missing template</slot>
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
