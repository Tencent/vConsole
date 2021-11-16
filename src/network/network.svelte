<script lang="ts">
  import copy from 'copy-text-to-clipboard';
  import Fa from 'svelte-fa';
  import { faCopy } from '@fortawesome/free-solid-svg-icons';
  import * as tool from '../lib/tool';
  import { VConsoleNetworkModel } from './networkModel';

  const networkModel = VConsoleNetworkModel.getSingleton(VConsoleNetworkModel);
  let reqList = networkModel.reqList;
  let reqCount = Object.keys(reqList).length;
  networkModel.onDataUpdate(() => {
    reqList = networkModel.reqList;
    reqCount = Object.keys(reqList).length;
  });

  const onTapPreview = (reqId: string) => {
    reqList[reqId].actived = !reqList[reqId].actived;
  };
  const onTapCopy = (reqId: string, key: string) => {
    console.log('onTapCopy', reqId, key);
    if (tool.isObject(reqList[reqId][key]) || tool.isArray(reqList[reqId][key])) {
      copy(tool.JSONStringify(reqList[reqId][key]));
    } else {
      copy(reqList[reqId][key]);
    }
  };
</script>

<div class="vc-table">
    
  <dl class="vc-table-row">
    <dd class="vc-table-col vc-table-col-4">Name {#if reqCount > 0}({reqCount}){/if}</dd>
    <dd class="vc-table-col">Method</dd>
    <dd class="vc-table-col">Status</dd>
    <dd class="vc-table-col">Time</dd>
  </dl>

  <div class="vc-log">
    {#each Object.entries(reqList) as [reqId, req]}
      <div class="vc-group" class:vc-actived="{req.actived}" id="{req.id}">
        <dl class="vc-table-row vc-group-preview" class:vc-table-row-error="{req.status >= 400}" on:click={() => onTapPreview(req.id)}>
          <dd class="vc-table-col vc-table-col-4">{req.name}</dd>
          <dd class="vc-table-col">{req.method}</dd>
          <dd class="vc-table-col">{req.statusText}</dd>
          <dd class="vc-table-col">{req.costTime}</dd>
        </dl>
        <div class="vc-group-detail">
          <div>
            <dl class="vc-table-row vc-left-border">
              <dt class="vc-table-col vc-table-col-title">
                General
                <i class="vc-table-row-icon" on:click="{() => onTapCopy(req.id, 'url')}"><Fa icon="{faCopy}"/></i>
              </dt>
            </dl>
            <div class="vc-table-row vc-left-border vc-small">
              <div class="vc-table-col vc-table-col-2">URL</div>
              <div class="vc-table-col vc-table-col-4 vc-table-col-value vc-max-height-line">{req.url}</div>
            </div>
            <div class="vc-table-row vc-left-border vc-small">
              <div class="vc-table-col vc-table-col-2">Method</div>
              <div class="vc-table-col vc-table-col-4 vc-table-col-value vc-max-height-line">{req.method}</div>
            </div>
            <div class="vc-table-row vc-left-border vc-small">
              <div class="vc-table-col vc-table-col-2">Type</div>
              <div class="vc-table-col vc-table-col-4 vc-table-col-value vc-max-height-line">{req.requestType}</div>
            </div>
          </div>
          {#if (req.header !== null)}
          <div>
            <dl class="vc-table-row vc-left-border">
              <dt class="vc-table-col vc-table-col-title">
                Response Headers
                <i class="vc-table-row-icon" on:click="{() => onTapCopy(req.id, 'header')}"><Fa icon="{faCopy}"/></i>
              </dt>
            </dl>
            {#each Object.entries(req.header) as [key, item]}
            <div class="vc-table-row vc-left-border vc-small">
              <div class="vc-table-col vc-table-col-2">{key}</div>
              <div class="vc-table-col vc-table-col-4 vc-table-col-value vc-max-height-line">{item}</div>
            </div>
            {/each}
          </div>
          {/if}
          {#if (req.requestHeader !== null)}
          <div>
            <dl class="vc-table-row vc-left-border">
              <dt class="vc-table-col vc-table-col-title">
                Request Headers
                <i class="vc-table-row-icon" on:click="{() => onTapCopy(req.id, 'requestHeader')}"><Fa icon="{faCopy}"/></i>
              </dt>
            </dl>
            {#each Object.entries(req.requestHeader) as [key, item]}
            <div class="vc-table-row vc-left-border vc-small">
              <div class="vc-table-col vc-table-col-2">{key}</div>
              <div class="vc-table-col vc-table-col-4 vc-table-col-value vc-max-height-line">{item}</div>
            </div>
            {/each}
          </div>
          {/if}
          {#if (req.getData !== null)}
          <div>
            <dl class="vc-table-row vc-left-border">
              <dt class="vc-table-col vc-table-col-title">
                Query String Parameters
                <i class="vc-table-row-icon" on:click="{() => onTapCopy(req.id, 'getData')}"><Fa icon="{faCopy}"/></i>
              </dt>
            </dl>
            {#each Object.entries(req.getData) as [key, item]}
            <div class="vc-table-row vc-left-border vc-small">
              <div class="vc-table-col vc-table-col-2">{key}</div>
              <div class="vc-table-col vc-table-col-4 vc-table-col-value vc-max-height-line">{item}</div>
            </div>
            {/each}
          </div>
          {/if}
          {#if (req.postData !== null)}
          <div>
            <dl class="vc-table-row vc-left-border">
              <dt class="vc-table-col vc-table-col-title">
                Request Payload
                <i class="vc-table-row-icon" on:click="{() => onTapCopy(req.id, 'postData')}"><Fa icon="{faCopy}"/></i>
              </dt>
            </dl>
            {#if (typeof req.postData === 'string')}
              <div class="vc-table-row vc-left-border vc-small">
                <pre class="vc-table-col vc-table-col-value vc-max-height-line">{req.postData}</pre>
              </div>
            {:else}
              {#each Object.entries(req.postData) as [key, item]}
              <div class="vc-table-row vc-left-border vc-small">
                <div class="vc-table-col vc-table-col-2">{key}</div>
                <div class="vc-table-col vc-table-col-4 vc-table-col-value vc-max-height-line">{item}</div>
              </div>
              {/each}
            {/if}
          </div>
          {/if}
          <div>
            <dl class="vc-table-row vc-left-border">
              <dt class="vc-table-col vc-table-col-title">
                Response
                <i class="vc-table-row-icon" on:click="{() => onTapCopy(req.id, 'response')}"><Fa icon="{faCopy}"/></i>
              </dt>
            </dl>
            <div class="vc-table-row vc-left-border vc-small">
              <pre class="vc-table-col vc-max-height vc-min-height">{req.response || ''}</pre>
            </div>
          </div>
        </div>
      </div>
    {/each}

  </div>
</div>

<style lang="less">
  
</style>
