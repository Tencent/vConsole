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
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('click', stopDragClick, true);
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

  const onDragStart = (pageX: number, pageY: number) => {
    switchPos.startX = pageX;
    switchPos.startY = pageY;
    switchPos.hasMoved = false;
  };
  const onDragMove = (pageX: number, pageY: number) => {
    const offsetX = pageX - switchPos.startX,
          offsetY = pageY - switchPos.startY;
    let x = Math.floor(switchPos.x - offsetX),
        y = Math.floor(switchPos.y - offsetY);
    [x, y] = _getSwitchButtonSafeAreaXY(x, y);
    btnSwitchPos.x = x;
    btnSwitchPos.y = y;
    switchPos.endX = x;
    switchPos.endY = y;
    switchPos.hasMoved = true;
  };
  const onDragEnd = () => {
    if (!switchPos.hasMoved) {
      return;
    }
    switchPos.startX = 0;
    switchPos.startY = 0;
    switchPos.hasMoved = false;
    setSwitchPosition(switchPos.endX, switchPos.endY);
  };

  const onTouchStart = (e) => {
    onDragStart(e.touches[0].pageX, e.touches[0].pageY);
  };
  const onTouchMove = (e) => {
    if (e.touches.length <= 0) {
      return;
    }
    onDragMove(e.touches[0].pageX, e.touches[0].pageY);
    e.preventDefault();
  };
  const onTouchEnd = () => {
    onDragEnd();
  };

  const onMouseDown = (e: MouseEvent) => {
    onDragStart(e.pageX, e.pageY);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  const onMouseMove = (e: MouseEvent) => {
    onDragMove(e.pageX, e.pageY);
  };
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    if (switchPos.hasMoved) {
      document.addEventListener('click', stopDragClick, true);
    }
    onDragEnd();
  };
  const stopDragClick = (e: MouseEvent) => {
    e.stopPropagation();
    document.removeEventListener('click', stopDragClick, true);
  };
</script>

<div
  class="vc-switch"
  style="right: {btnSwitchPos.x}px; bottom: {btnSwitchPos.y}px; display: {show ? 'block' : 'none'};"
  bind:this={btnSwitch}
  on:touchstart|nonpassive={onTouchStart}
  on:touchmove|nonpassive={onTouchMove}
  on:touchend={onTouchEnd}
  on:mousedown={onMouseDown}
  on:click
>vConsole</div>
