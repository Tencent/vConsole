<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as tool from '../lib/tool';
  import Style from './switchButton.less';

  /*************************************
   * Public properties
   *************************************/

  export let show = true;
  export let position = { x: 0, y: 0 };


  /*************************************
   * Inner properties
   *************************************/

  const switchPos = {
    hasMoved: false, // exclude click event
    x: 0, // right
    y: 0, // bottom
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0
  };
  const btnSwitchPos = {
    x: 0,
    y: 0,
  };
  let btnSwitch: HTMLElement;

  $: {
    if (btnSwitch) {
      setSwitchPosition(position.x, position.y);
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
   * Methods
   *************************************/

  const setSwitchPosition = (switchX: number, switchY: number) => {
    [switchX, switchY] = _getSwitchButtonSafeAreaXY(switchX, switchY);
    switchPos.x = switchX;
    switchPos.y = switchY;
    btnSwitchPos.x = switchX;
    btnSwitchPos.y = switchY;
    tool.setStorage('switch_x', switchX + '');
    tool.setStorage('switch_y', switchY + '');
  }

  /**
  * Get an safe [x, y] position for switch button
  */
  const _getSwitchButtonSafeAreaXY = (x: number, y: number) => {
    const docWidth = Math.max(document.documentElement.offsetWidth, window.innerWidth);
    const docHeight = Math.max(document.documentElement.offsetHeight, window.innerHeight);
    // check edge
    if (x + btnSwitch.offsetWidth > docWidth) {
      x = docWidth - btnSwitch.offsetWidth;
    }
    if (y + btnSwitch.offsetHeight > docHeight) {
      y = docHeight - btnSwitch.offsetHeight;
    }
    if (x < 0) { x = 0; }
    if (y < 20) { y = 20; } // safe area for iOS Home indicator
    return [x, y];
  };

  
  /*************************************
   * DOM Events
   *************************************/

  const onTouchStart = (e) => {
    switchPos.startX = e.touches[0].pageX;
    switchPos.startY = e.touches[0].pageY;
    switchPos.hasMoved = false;
  };
  const onTouchEnd = (e) => {
    if (!switchPos.hasMoved) {
      return;
    }
    switchPos.startX = 0;
    switchPos.startY = 0;
    switchPos.hasMoved = false;
    setSwitchPosition(switchPos.endX, switchPos.endY);
  };
  const onTouchMove = (e) => {
    if (e.touches.length <= 0) {
      return;
    }
    const offsetX = e.touches[0].pageX - switchPos.startX,
          offsetY = e.touches[0].pageY - switchPos.startY;
    let x = Math.floor(switchPos.x - offsetX),
        y = Math.floor(switchPos.y - offsetY);
    [x, y] = _getSwitchButtonSafeAreaXY(x, y);
    btnSwitchPos.x = x;
    btnSwitchPos.y = y;
    switchPos.endX = x;
    switchPos.endY = y;
    switchPos.hasMoved = true;
    e.preventDefault();
  };
</script>

<div
  class="vc-switch"
  style="right: {btnSwitchPos.x}px; bottom: {btnSwitchPos.y}px; display: {show ? 'block' : 'none'};"
  bind:this={btnSwitch}
  on:touchstart|nonpassive={onTouchStart}
  on:touchend|nonpassive={onTouchEnd}
  on:touchmove|nonpassive={onTouchMove}
  on:click
>vConsole</div>
