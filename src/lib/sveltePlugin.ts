import VConsolePlugin from './plugin';
import type { SvelteComponent, ComponentType } from 'svelte';
import { createClassComponent } from 'svelte/legacy';

export class VConsoleSveltePlugin<T extends {} = {}> extends VConsolePlugin {
  CompClass: ComponentType<SvelteComponent>;
  compInstance?: SvelteComponent;
  initialProps: T;

  constructor(
    id: string,
    name: string,
    CompClass: ComponentType<SvelteComponent>,
    initialProps: T
  ) {
    super(id, name);
    this.CompClass = CompClass;
    this.initialProps = initialProps;
  }

  onReady() {
    this.isReady = true;
  }

  onRenderTab(callback) {
    const $container = document.createElement('div');
    const compInstance = this.compInstance = createClassComponent({
      component: this.CompClass,
      target: $container,
      props: this.initialProps,
    });
    // console.log('onRenderTab', this.compInstance);
    callback($container.firstElementChild, compInstance.options);
  }

  onRemove() {
    super.onRemove && super.onRemove();
    if (this.compInstance) {
      this.compInstance.$destroy();
    }
  }

}
