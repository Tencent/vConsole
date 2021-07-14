<script lang="ts">
  let { class: clazz } = $$props;
</script>

<button class={clazz} on:click on:dblclick><slot /></button>

<style lang="less">
  button {
    background: var(--VC-BG-1);
    color: var(--VC-FG-1);
    &:hover {
      background: var(--VC-BG-2);
    }
    &:active {
      background: var(--VC-BG-0);
    }
  }
</style>
