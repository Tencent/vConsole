<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import query from '../lib/query';
  import * as tool from '../lib/tool';
  import { default as SwitchButton } from './switchButton.svelte';
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
  let fontSize = '';
  let showMain = false;
  let showPanel = false;
  let showMask = false;

  $: {
    if (show === true) {
      // before show console panel,
      // trigger a transitionstart event to make panel's property 'display' change from 'none' to 'block'
      showPanel = true;
      showMask = true;
      // set 10ms delay to fix confict between display and transition
      setTimeout(() => {
        showMain = true;
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
    // modify font-size
    const dpr = window.devicePixelRatio || 1;
    const viewportEl = document.querySelector('[name="viewport"]');
    if (viewportEl) {
      const viewportContent = viewportEl.getAttribute('content') || '';
      const initialScale = viewportContent.match(/initial\-scale\=\d+(\.\d+)?/);
      const scale = initialScale ? parseFloat(initialScale[0].split('=')[1]) : 1;
      if (scale < 1) {
        fontSize = 13 * dpr + 'px';
      }
    }
  });


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
    let top = divContent.scrollTop,
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
          if (!query.hasClass(e.target, 'vc-cmd-input')) { // skip input
            preventContentMove = true;
          }
        }
      } else if (currentScroll === totalScroll) {
        // when content is on the bottom,
        // do similar processing
        divContent.scrollTop = top - 1;
        if (divContent.scrollTop === top) {
          if (!query.hasClass(e.target, 'vc-cmd-input')) {
            preventContentMove = true;
          }
        }
      }
  };
  const onContentTouchMove = (e) => {
    if (preventContentMove) {
      e.preventDefault();
    }
  };
  const onContentTouchEnd = (e) => {
    preventContentMove = false;
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

<style lang="less">
@import "../styles/var.less";

.vc-mask {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0, 0);
  z-index: 10001;
  -webkit-transition: background .3s;
  transition: background .3s;
  -webkit-tap-highlight-color: transparent;
  overflow-y: scroll;
}

.vc-panel {
  display: none;
  position: fixed;
  min-height: 85%;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10002;
  background-color: var(--VC-BG-0);
  -webkit-transition: -webkit-transform .3s;
  transition: -webkit-transform .3s;
  transition: transform .3s;
  transition: transform .3s, -webkit-transform .3s;

  -webkit-transform: translate(0, 100%);
  transform: translate(0, 100%);
}

.vc-toggle {

  .vc-switch {
    display: none;
  }

  .vc-mask {
    background: rgba(0, 0, 0, 0.6);
    display: block;
  }

  .vc-panel {
    -webkit-transform: translate(0, 0);
    transform: translate(0, 0);
  }
}


// tabbar
.vc-tabbar {
  border-bottom: 1px solid var(--VC-FG-3);
  overflow-x: auto;
  height: (39em / @font);
  width: auto;
  white-space: nowrap;

  .vc-tab {
    display: inline-block;
    line-height: (39em / @font);
    padding: 0 (15em / @font);
    border-right: 1px solid var(--VC-FG-3);
    text-decoration: none;
    color: var(--VC-FG-0);
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
  }
  .vc-tab:active {
    background-color: rgba(0,0,0,0.15);
  }
  .vc-tab.vc-actived {
    background-color: var(--VC-BG-1);
  }
}

// topbar
.vc-topbar {
  background-color: var(--VC-BG-1);
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -webkit-flex-direction: row;
  -moz-box-orient: horizontal;
  -moz-box-direction: normal;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  width: 100%;

  .vc-toptab {
    display: none;
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    -moz-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    line-height: (30em / @font);
    padding: 0 (15em / @font);
    border-bottom: 1px solid var(--VC-FG-3);
    text-decoration: none;
    text-align: center;
    color: var(--VC-FG-0);
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
  }
  .vc-toptab.vc-toggle {
    display: block;
  }
  .vc-toptab:active {
    background-color: rgba(0,0,0,0.15);
  }
  .vc-toptab.vc-actived {
    border-bottom: 1px solid var(--VC-INDIGO);
  }
}

// toolbar
.vc-toolbar {
  border-top: 1px solid var(--VC-FG-3);
  line-height: (39em / @font);
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -webkit-flex-direction: row;
  -moz-box-orient: horizontal;
  -moz-box-direction: normal;
  -ms-flex-direction: row;
  flex-direction: row;

  .vc-tool {
    display: none;
    font-style: normal;
    text-decoration: none;
    color: var(--VC-FG-0);
    width: 50%;
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    -moz-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    text-align: center;
    position: relative;
    -webkit-touch-callout: none;
  }
  .vc-tool.vc-toggle,
  .vc-tool.vc-global-tool {
    display: block;
  }

  .vc-tool:active {
    background-color: rgba(0,0,0,0.15);
  }
  .vc-tool:after {
    content: " ";
    position: absolute;
    top: (7em / @font);
    bottom: (7em / @font);
    right: 0;
    border-left: 1px solid var(--VC-FG-3);
  }

  .vc-tool-last:after {
    border: none;
  }
}

// content
.vc-content {
  background-color: var(--VC-BG-2);
  overflow-x: hidden;
  overflow-y: auto;
  position: absolute;
  top: (40em / @font);
  left: 0;
  right: 0;
  bottom: (40em / @font);
  -webkit-overflow-scrolling: touch;
  margin-bottom: constant(safe-area-inset-bottom);
  margin-bottom: env(safe-area-inset-bottom);
}
.vc-content.vc-has-topbar {
  top: (71em / @font);
}
.vc-plugin-box {
  display: none;
  position: relative;
  min-height: 100%;
}
.vc-plugin-box.vc-actived {
  display: block;
}
:global(.vc-plugin-content) {
  padding-bottom: (39em / @font) * 2;
  -webkit-tap-highlight-color: transparent;
}
:global(.vc-plugin-empty:before),
:global(.vc-plugin-content:empty:before) {
  content: "Empty";
  color: var(--VC-FG-1);
  position: absolute;
  top: 45%;
  left: 0;
  right: 0;
  bottom: 0;
  font-size: (15em / @font);
  text-align: center;
}



// safe area
@supports (bottom: constant(safe-area-inset-bottom)) or (bottom: env(safe-area-inset-bottom)) {
  .vc-toolbar,
  .vc-switch {
    bottom: constant(safe-area-inset-bottom);
    bottom: env(safe-area-inset-bottom);
  }
}
</style>
