<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '../component/icon.svelte';
  import { getLastIdentifier, VConsoleLogModel } from './log.model';
  // import LogRow from './logRow.svelte';

  interface ICmdPromptedItem {
    text: string;
    value: string;
  }

  /*************************************
   * Public properties
   *************************************/


  /*************************************
   * Inner properties
   *************************************/

  const module = VConsoleLogModel.getSingleton(VConsoleLogModel);
  const cachedObjKeys: { [key: string]: string[] } = {};
  const _console = (window as any)._vcOrigConsole;

  let cmdElement: HTMLTextAreaElement;
  let cmdValue = '';
  let promptedStyle = '';
  let promptedList: ICmdPromptedItem[] = [];
  let filterValue = '';


  /*************************************
   * Lifecycle
   *************************************/

  onMount(() => {

  });
  

  /*************************************
   * Methods
   *************************************/

  const evalCommand = (cmd: string) => {
    module.evalCommand(cmd);
  };

  const moveCursorToPos = (dom, pos) => {
    if (dom.setSelectionRange) {
      setTimeout(() => {
        dom.setSelectionRange(pos, pos);
      }, 1);
    }
  };

  const clearPromptedList = () => {
    promptedStyle = 'display: none;'
    // promptedList.length = 0;
    promptedList = [];
  };

  const updatePromptedList = (identifier?: ReturnType<typeof getLastIdentifier>) => {
    if (cmdValue === '') {
      clearPromptedList();
      return;
    }
    if (!identifier) {
      identifier = getLastIdentifier(cmdValue);
    }
    // _console.log('identifier', identifier.front, identifier.back)

    // for case 'aabb',
    // use 'aabb' as a key of global object
    let objName = 'window'; // `window` as default
    let keyName = cmdValue;

    if (identifier.front.text === '.' || identifier.front.text === '[') {
      // for case 'aa.bb.cc', objName='aa.bb', keyName='cc'
      // for case 'aa.bb["cc"]', objName='aa.bb', keyName='cc'
      objName = identifier.front.before;
      keyName = identifier.back.text !== '' ? identifier.back.before : identifier.front.after;
    }
    // if keyName starts/ends with quote(s), remove it
    keyName = keyName.replace(/(^['"]+)|(['"']+$)/g, '');
    // _console.log('objName:', objName, 'keyName:', keyName);

    if (!cachedObjKeys[objName]) {
      try {
        cachedObjKeys[objName] = Object.getOwnPropertyNames(eval('(' + objName + ')')).sort();
        // _console.log('cachedObjKeys', objName, keyName, cachedObjKeys[objName].length);
      } catch (e) {
        // do nothing
        // _console.log('cachedObjKeys error', e);
      }
    }

    try {
      if (cachedObjKeys[objName]) {
        for (let i = 0; i < cachedObjKeys[objName].length; i++) {
          // for performance, set an upper limit
          if (promptedList.length >= 100) {
            break;
          }
          
          const key = String(cachedObjKeys[objName][i]);
          const keyPattern = new RegExp('^' + keyName, 'i'); // polyfill String.startsWith
          if (keyPattern.test(key)) {
            let completeCmd = objName;
            if (identifier.front.text === '.' || identifier.front.text === '') {
              completeCmd += '.' + key;
            } else if (identifier.front.text === '[') {
              completeCmd += `['${key}']`;
            }
            promptedList.push({
              text: key,
              value: completeCmd,
            });
            // _console.log('text', key, 'complateCmd', completeCmd);
          }
        }
      }
    } catch (e) {
      // do nothing
      // _console.log('foreach error', e);
    }

    if (promptedList.length > 0) {
      const m = Math.min(200, (promptedList.length + 1) * 31);
      promptedStyle = `display: block; height: ${m}px; margin-top: ${-m-2}px;`;
      promptedList = promptedList;
      // _console.log('promptedList:', promptedList);
    } else {
      clearPromptedList();
    }
  };

  const autoCompleteBrackets = (identifier, keyCode) => {
    const isDeleteKeyCode = keyCode === 8 || keyCode === 46;
    if (!isDeleteKeyCode && identifier.front.after === '') {
      switch (identifier.front.text) {
        case '[':
          cmdValue += ']';
          moveCursorToPos(cmdElement, cmdValue.length - 1);
          return;

        case '(':
          cmdValue += ')';
          moveCursorToPos(cmdElement, cmdValue.length - 1);
          return;

        case '{':
          cmdValue += '}';
          moveCursorToPos(cmdElement, cmdValue.length - 1);
          return;
      }
    }
  };

  /*************************************
   * DOM Events
   *************************************/

  const onTapOk = () => {

  };
  const onTapFilter = () => {

  };
  const onTapClearText = (name: string) => {
    if (name === 'cmd') {
      cmdValue = '';
      clearPromptedList();
    } else if (name === 'filter') {
      filterValue = '';
    }
  };
  const onTapPromptedItem = (item: ICmdPromptedItem) => {
    let type = '';
    try {
      type = eval('typeof ' + item.value);
    } catch (e) {
      // do nothing
    }
    cmdValue = item.value + (type === 'function' ? '()' : '');
    // _console.log('onTapPromptedItem', item);
    clearPromptedList();
  };
  const onCmdFocus = () => {
    updatePromptedList();
  };
  const onCmdBlur = () => {
    // clearPromptedList();
  };
  const onCmdKeyUp = (e) => {
    promptedList = []
    const identifier = getLastIdentifier(e.target.value);
    autoCompleteBrackets(identifier, e.keyCode);
    updatePromptedList(identifier);
  };
  const onCmdSubmit = (e) => {
    if (cmdValue !== '') {
      evalCommand(cmdValue);
    }
    clearPromptedList();
  };
  const onFilterSubmit = (e) => {

  };
</script>

<form class="vc-cmd" on:submit|preventDefault={onCmdSubmit}>
  <button class="vc-cmd-btn" type="submit" on:click={onTapOk}>OK</button>

  <ul class='vc-cmd-prompted' style="{promptedStyle}">
    {#if promptedList.length > 0}
      <li class="vc-cmd-prompted-hide" on:click={clearPromptedList}>Close</li>
    {/if}
    {#each promptedList as item}
      <li on:click={() => onTapPromptedItem(item)}>{item.text}</li>
    {:else}
      <li>No Prompted</li>
    {/each}
  </ul>

  <div class="vc-cmd-input-wrap">
    {#if cmdValue.length > 0}
      <div class="vc-cmd-clear-btn" on:click|preventDefault={() => onTapClearText('cmd')}>
        <Icon name="clear" />
      </div>
    {/if}
    <textarea
      class="vc-cmd-input"
      placeholder="command..."
      bind:value={cmdValue}
      bind:this={cmdElement}
      on:keyup={onCmdKeyUp}
      on:focus={onCmdFocus}
      on:blur={onCmdBlur}
    ></textarea>
  </div>
</form>

<form class="vc-cmd vc-filter" on:submit|preventDefault={onFilterSubmit}>
  <button class="vc-cmd-btn" type="submit" on:click={onTapFilter}>Filter</button>
  <ul class='vc-cmd-prompted'></ul>
  <div class="vc-cmd-input-wrap">
    {#if filterValue.length > 0}
      <div class="vc-cmd-clear-btn" on:click|preventDefault={() => onTapClearText('filter')}>
        <Icon name="clear" />
      </div>
    {/if}
    <textarea class="vc-cmd-input" placeholder="filter..."></textarea>
  </div>
</form>

<style lang="less">
@import "../styles/var.less";

// container
.vc-cmd {
  position: absolute;
  height: (40em / @font);
  left: 0;
  right: 0;
  bottom: (40em / @font);
  border-top: 1px solid var(--VC-FG-3);
  display: block !important;

  &.vc-filter{
    bottom: 0;
  }
}

// input or textarea
.vc-cmd-input-wrap {
  display: block;
  position: relative;
  height: (28em / @font);
  margin-right: (40em / @font);
  padding: (6em / @font) (8em / @font);
}
.vc-cmd-input {
  width: 100%;
  border: none;
  resize: none;
  outline: none;
  padding: 0;
  font-size: (12em / @font);
  background-color: transparent;
  color: var(--VC-FG-0);
}
.vc-cmd-input::-webkit-input-placeholder {
  line-height: (28em / @font);
}

// button
.vc-cmd-btn {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: (40em / @font);
  border: none;
  background-color: var(--VC-BG-0);
  color: var(--VC-FG-0);
  outline: none;
  -webkit-touch-callout: none;
  font-size: 1em;
}
.vc-cmd-clear-btn {
  position: absolute;
  text-align: center;
  top: 0;
  right: 0;
  bottom: 0;
  width: (40em / @font);
  line-height: (40em / @font);
}
.vc-cmd-btn:active,
.vc-cmd-clear-btn:active {
  background-color: var(--VC-BG-COLOR-ACTIVE);
}

// prompted list
.vc-cmd-prompted {
  position: absolute;
  left: (6em / @font);
  right: (6em / @font);
  background-color: var(--VC-BG-3);
  border: 1px solid var(--VC-FG-3);
  overflow-x: scroll;
  display: none;
}
.vc-cmd-prompted li {
  list-style: none;
  line-height: 30px;
  padding: 0 (6em / @font);
  border-bottom: 1px solid var(--VC-FG-3);
}
.vc-cmd-prompted li:active {
  background-color: var(--VC-BG-COLOR-ACTIVE);
}
.vc-cmd-prompted-hide {
  text-align: center;
}
</style>
