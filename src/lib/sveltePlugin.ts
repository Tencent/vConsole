import VConsolePlugin from './plugin';
import { SvelteComponent } from 'svelte';

export class VConsoleSveltePlugin<T extends {} = {}> extends VConsolePlugin {
  CompClass: typeof SvelteComponent;
  compInstance?: SvelteComponent;
  initialProps: T;
  $dom: HTMLElement;

  constructor(
    id: string,
    name: string,
    CompClass: typeof SvelteComponent,
    renderProps: T
  ) {
    super(id, name);
    this.CompClass = CompClass;
    this.initialProps = renderProps;
  }

  onReady() {
    this.isReady = true;
  }

  onRenderTab(callback) {
    this.$dom = document.createElement('div');
    this.compInstance = new this.CompClass({
      target: this.$dom,
      props: this.initialProps,
    });
    callback(this.$dom);
  }

  onRemove() {}

}

export default VConsoleSveltePlugin;
