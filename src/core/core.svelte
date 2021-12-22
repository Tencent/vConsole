<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import * as tool from '../lib/tool';
  import { default as SwitchButton } from './switchButton.svelte';
  import { contentStore } from './core.model';
  import Style from './core.less';
  import type { IVConsoleTopbarOptions, IVConsoleToolbarOptions } from '../lib/plugin';

  /*************************************
   * Public properties
   *************************************/

  interface IPlugin {
    id: string;
    name: string;
    hasTabPanel: boolean;
    topbarList?: IVConsoleTopbarOptions[];
    toolbarList?: IVConsoleToolbarOptions[];
  }

  export let theme = '';
  export let disableScrolling = false;
  export let show = false;
  export let showSwitchButton = true;
  export let switchButtonPosition = { x: 0, y: 0 };
  export let activedPluginId = '';
  export let pluginList: { [id: string]: IPlugin } = {};
  export let divContentInner: HTMLElement = undefined;


  /*************************************
   * Inner properties
   *************************************/

	const dispatch = createEventDispatcher();
  let preventContentMove = false;
  let divContent: HTMLElement;
  let unsubscribe: ReturnType<typeof contentStore.subscribe>;
  let fontSize = '';
  let showMain = false;
  let showPanel = false;
  let showMask = false;
  let isInBottom = true;
  let preivousContentUpdateTime = 0;

  $: {
    if (show === true) {
      // before show console panel,
      // trigger a transitionstart event to make panel's property 'display' change from 'none' to 'block'
      showPanel = true;
      showMask = true;
      // set 10ms delay to fix confict between display and transition
      setTimeout(() => {
        showMain = true;
        autoScrollToBottom();
      }, 10);
    } else {
      showMain = false;
      setTimeout(() => {
        // panel will be hidden by CSS transition in 0.3s
        showPanel = false;
        showMask = false;
      }, 330);
    }
  }


  /*************************************
   * Lifecycle
   *************************************/

  onMount(() => {
    // modify font-size to prevent scaling
    // const dpr = window.devicePixelRatio || 1;
    const viewportEl = document.querySelectorAll('[name="viewport"]');
    if (viewportEl && viewportEl[0]) {
      const viewportContent = viewportEl[viewportEl.length - 1].getAttribute('content') || '';
      const initialScale = viewportContent.match(/initial\-scale\=\d+(\.\d+)?/);
      const scale = initialScale ? parseFloat(initialScale[0].split('=')[1]) : 1;
      if (scale !== 1) {
        fontSize = Math.floor(1 / scale * 13) + 'px';
      }
      // console.log(scale, fontSize);
    }
    // style
    Style.use && Style.use();
    // console.log('core.svelte onMount', Style);

    unsubscribe = contentStore.subscribe((store) => {
      if (!show) { return; }
      if (preivousContentUpdateTime !== store.updateTime) {
        preivousContentUpdateTime = store.updateTime;
        autoScrollToBottom();
      }
    });
  });

  onDestroy(() => {
    Style.unuse && Style.unuse();
    unsubscribe && unsubscribe();
  });


  /*************************************
   * Methods
   *************************************/

  const scrollToBottom = () => {
    if (!divContent) { return; }
    divContent.scrollTop = divContent.scrollHeight - divContent.offsetHeight;
  };
  const autoScrollToBottom = () => {
    if (!disableScrolling && isInBottom) {
      scrollToBottom();
    }
  };


  /*************************************
   * DOM Events
   *************************************/

  const onTapEventShow = (e) => {
    dispatch('show', { show: true });
  };
  const onTapEventHide = (e) => {
    dispatch('show', { show: false });
  };
  const onTapTabbar = (tabId: string) => {
    if (tabId === activedPluginId) {
      return;
    }
    activedPluginId = tabId;
    dispatch('changePanel', { pluginId: tabId });
  };
  const onTapTopbar = (e, pluginId: string, idx: number) => {
    const topbar = pluginList[pluginId].topbarList[idx];
    let enable = true;
    if (tool.isFunction(topbar.onClick)) {
      enable = topbar.onClick.call(e.target, e, topbar.data);
    }
    if (enable === false) {
      // do nothing
    } else {
      for (let i = 0; i < pluginList[pluginId].topbarList.length; i++) {
        pluginList[pluginId].topbarList[i].actived = idx === i;
      }
      pluginList = pluginList;
    }
  };
  const onTapToolbar = (e, pluginId: string, idx: number) => {
    const toolbar = pluginList[pluginId].toolbarList[idx];
    if (tool.isFunction(toolbar.onClick)) {
      toolbar.onClick.call(e.target, e, toolbar.data);
    }
  };
  const onContentTouchStart = (e) => {
    const top = divContent.scrollTop,
          totalScroll = divContent.scrollHeight,
          currentScroll = top + divContent.offsetHeight;
    if (top === 0) {
      // when content is on the top,
      // reset scrollTop to lower position to prevent iOS apply scroll action to background
      divContent.scrollTop = 1;
      // however, when content's height is less than its container's height,
      // scrollTop always equals to 0 (it is always on the top),
      // so we need to prevent scroll event manually
      if (divContent.scrollTop === 0) {
        if (e.target.classList && !e.target.classList.contains('vc-cmd-input')) { // skip input
          preventContentMove = true;
        }
      }
    } else if (currentScroll === totalScroll) {
      // when content is on the bottom,
      // do similar processing
      divContent.scrollTop = top - 1;
      if (divContent.scrollTop === top) {
        if (e.target.classList && !e.target.classList.contains('vc-cmd-input')) {
          preventContentMove = true;
        }
      }
    }
    // (window as any)._vcOrigConsole.log('preventContentMove', preventContentMove);
  };
  const onContentTouchMove = (e) => {
    if (preventContentMove) {
      e.preventDefault();
    }
  };
  const onContentTouchEnd = (e) => {
    preventContentMove = false;
  };
  const onContentScroll = (e) => {
    if (!show) { return; }
    if (divContent.scrollTop + divContent.offsetHeight >= divContent.scrollHeight - 50) {
      isInBottom = true;
    } else {
      isInBottom = false;
    }
    // (window as any)._vcOrigConsole.log('onContentScroll', isInBottom);
  };
</script>

<div
  id="__vconsole"
  class:vc-toggle={showMain}
  style="{fontSize ? 'font-size:' + fontSize + ';' : ''}"
  data-theme={theme}
>
  <SwitchButton
    bind:show={showSwitchButton}
    bind:position={switchButtonPosition}
    on:click={onTapEventShow}
  />

  <div class="vc-mask" style="display: {showMask ? 'block' : 'none'};" on:click={onTapEventHide}></div>

  <div class="vc-panel" style="display: {showPanel ? 'block' : 'none'};">
    <div class="vc-tabbar">
      {#each Object.entries(pluginList) as [pluginId, plugin]}
        {#if plugin.hasTabPanel}
          <a
            class="vc-tab"
            class:vc-actived={plugin.id === activedPluginId}
            id="__vc_tab_{plugin.id}"
            on:click={() => onTapTabbar(plugin.id)}
          >{plugin.name}</a>
        {/if}
      {/each}
    </div>

    <div class="vc-topbar">
      {#each Object.entries(pluginList) as [pluginId, plugin]}
        {#each plugin.topbarList as item, i}
          <i
            class="vc-toptab vc-topbar-{plugin.id} {item.className}"
            class:vc-toggle={plugin.id === activedPluginId}
            class:vc-actived={item.actived}
            on:click={(e) => onTapTopbar(e, plugin.id, i)}
          >{item.name}</i>
        {/each}
      {/each}
    </div>

    <div
      class="vc-content"
      class:vc-has-topbar={pluginList[activedPluginId]?.topbarList?.length > 0}
      bind:this={divContent}
      on:touchstart={onContentTouchStart}
      on:touchmove={onContentTouchMove}
      on:touchend={onContentTouchEnd}
      on:scroll={onContentScroll}
    >
      {#each Object.entries(pluginList) as [pluginId, plugin]}
        <div
          id="__vc_plug_{plugin.id}"
          class="vc-plugin-box"
          class:vc-actived="{plugin.id === activedPluginId}"
          bind:this={divContentInner}
        ></div>
      {/each}
    </div>

    <div class="vc-toolbar">
      {#each Object.entries(pluginList) as [pluginId, plugin]}
        {#each plugin.toolbarList as item, i}
          <i
            class="vc-tool vc-tool-{plugin.id}"
            class:vc-global-tool={item.global}
            class:vc-toggle={plugin.id === activedPluginId}
            on:click={(e) => onTapToolbar(e, plugin.id, i)}
          >{item.name}</i>
        {/each}
      {/each}
      <i class="vc-tool vc-global-tool vc-tool-last vc-hide" on:click={onTapEventHide}>Hide</i>
    </div>
  </div>
</div>
