<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import Icon from '../component/icon/icon.svelte';
  import { getLastIdentifier } from './logTool';
  import { VConsoleLogModel } from './log.model';
  import Style from './logCommand.less';

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

  const module = VConsoleLogModel.getSingleton(VConsoleLogModel, 'VConsoleLogModel');
  const cachedObjKeys: { [key: string]: string[] } = {};
  const dispatch = createEventDispatcher();
  // const _console = (window as any)._vcOrigConsole;

  let cmdElement: HTMLTextAreaElement;
  let cmdValue = '';
  let promptedStyle = '';
  let promptedList: ICmdPromptedItem[] = [];
  let filterValue = '';


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

  const dispatchFilterEvent = () => {
    dispatch('filterText', { filterText: filterValue });
  };

  /*************************************
   * DOM Events
   *************************************/

  const onTapClearText = (name: string) => {
    if (name === 'cmd') {
      cmdValue = '';
      clearPromptedList();
    } else if (name === 'filter') {
      filterValue = '';
      dispatchFilterEvent();
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
  const onCmdKeyDown = (e) => {
    if (e.keyCode === 13) { // Enter
      e.preventDefault();
      onCmdSubmit();
    }
  };
  const onCmdKeyUp = (e) => {
    promptedList = [];
    const identifier = getLastIdentifier(e.target.value);
    autoCompleteBrackets(identifier, e.keyCode);
    updatePromptedList(identifier);
  };
  const onCmdSubmit = () => {
    if (cmdValue !== '') {
      evalCommand(cmdValue);
    }
    clearPromptedList();
  };
  const onFilterSubmit = (e) => {
    dispatchFilterEvent();
  };
</script>

<form class="vc-cmd" on:submit|preventDefault={onCmdSubmit}>
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
    <textarea
      class="vc-cmd-input"
      placeholder="command..."
      bind:value={cmdValue}
      bind:this={cmdElement}
      on:keydown="{onCmdKeyDown}"
      on:keyup={onCmdKeyUp}
      on:focus={onCmdFocus}
      on:blur={onCmdBlur}
    ></textarea>
    {#if cmdValue.length > 0}
    <div class="vc-cmd-clear-btn" on:click|preventDefault={() => onTapClearText('cmd')}>
      <Icon name="clear" />
    </div>
  {/if}
  </div>

  <button class="vc-cmd-btn" type="submit">OK</button>
</form>

<form class="vc-cmd vc-filter" on:submit|preventDefault={onFilterSubmit}>
  <ul class='vc-cmd-prompted'></ul>
  <div class="vc-cmd-input-wrap">
    <textarea
      class="vc-cmd-input"
      placeholder="filter..."
      bind:value={filterValue}
    ></textarea>
    {#if filterValue.length > 0}
    <div class="vc-cmd-clear-btn" on:click|preventDefault={() => onTapClearText('filter')}>
      <Icon name="clear" />
    </div>
  {/if}
  </div>
  <button class="vc-cmd-btn" type="submit">Filter</button>
</form>
