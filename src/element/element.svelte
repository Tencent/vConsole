<script lang="ts">
  import { rootNode } from './element.model';
  import ElementNode from './elementNode.svelte';
</script>

<div class="vc-plugin-content">
  <ElementNode node={$rootNode} on:toggleNode />
</div>
