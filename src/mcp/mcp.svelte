<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { VConsoleMCPState } from './mcp';

  export let protocol: 'ws:' | 'wss:' = 'ws:';
  export let host = '';
  export let port = '8765';
  export let path = '';
  export let token = '';
  export let state: VConsoleMCPState = 'closed';
  export let allowJavaScriptExecution = false;

  const dispatch = createEventDispatcher();

  $: endpoint = `${protocol}//${host}:${port}${path}`;
</script>

<div class="vc-table">
  <div class="vc-table-row">
    <div class="vc-table-col vc-table-col-2 vc-table-col-title">Status</div>
    <div class="vc-table-col vc-table-col-4 vc-table-col-value">{state}</div>
  </div>
  <div class="vc-table-row">
    <label class="vc-table-col vc-table-col-2 vc-table-col-title" for="__vc_mcp_host">Host</label>
    <div class="vc-table-col vc-table-col-4">
      <input id="__vc_mcp_host" class="vc-table-input" bind:value={host} inputmode="url" placeholder="192.168.1.100">
    </div>
  </div>
  <div class="vc-table-row">
    <label class="vc-table-col vc-table-col-2 vc-table-col-title" for="__vc_mcp_port">Port</label>
    <div class="vc-table-col vc-table-col-4">
      <input id="__vc_mcp_port" class="vc-table-input" bind:value={port} inputmode="numeric" placeholder="8765">
    </div>
  </div>
  <div class="vc-table-row">
    <label class="vc-table-col vc-table-col-2 vc-table-col-title" for="__vc_mcp_token">Pairing Token</label>
    <div class="vc-table-col vc-table-col-4">
      <input id="__vc_mcp_token" class="vc-table-input" bind:value={token} type="password" autocomplete="off" placeholder="Optional">
    </div>
  </div>
  <div class="vc-table-row">
    <label class="vc-table-col vc-table-col-2 vc-table-col-title" for="__vc_mcp_allow_javascript">Allow JavaScript Execution</label>
    <div class="vc-table-col vc-table-col-4">
      <input
        id="__vc_mcp_allow_javascript"
        type="checkbox"
        bind:checked={allowJavaScriptExecution}
        on:change={() => dispatch('allowJavaScriptExecutionChange', allowJavaScriptExecution)}
      >
      {allowJavaScriptExecution ? 'Allowed' : 'Denied'}
    </div>
  </div>
  <div class="vc-table-row vc-small">
    <div class="vc-table-col vc-table-col-value">{endpoint}</div>
  </div>
</div>
